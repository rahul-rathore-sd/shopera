// This controller provides two validation layers:

// Client-side Signature Verification: Immediate confirmation right after the frontend checkout modal closes.

// Server-to-Server Webhook: Cryptographically verifies asynchronous events (order.paid, payment.failed) to prevent race conditions or dropped network connections.

import crypto from "crypto";
import {
  razorpayInstance,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
} from "../config/razorpay.js";
import { Order } from "../models/Order.js";
import { Cart } from "../models/Cart.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Create Razorpay Payment Order
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ApiError(400, "Order ID is required");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentInfo.status === "paid") {
    throw new ApiError(400, "This order has already been paid for");
  }

  // Razorpay accepts amounts in the smallest currency unit (paise for INR: multiply by 100)
  const options = {
    amount: Math.round(order.pricing.totalAmount * 100),
    currency: "INR",
    receipt: `rcpt_${order._id.toString().slice(-20)}`,
    notes: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  };

  try {
    const razorpayOrder = await razorpayInstance.orders.create(options);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: RAZORPAY_KEY_ID,
          orderId: order._id,
        },
        "Razorpay order generated successfully"
      )
    );
  } catch (error) {
    const isAuthError =
      error?.statusCode === 401 ||
      (error?.error?.code === "BAD_REQUEST_ERROR" && error?.error?.description?.includes("Authentication failed")) ||
      error?.message?.includes("Authentication failed");

    // In local development, if Razorpay API keys are invalid/placeholder, fall back to Dev Sandbox simulation
    if (isAuthError && process.env.NODE_ENV !== "production") {
      console.log(`ℹ️ [Dev Sandbox] Razorpay keys not active — Simulated order generated for Order #${order._id}`);
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            id: mockOrderId,
            amount: options.amount,
            currency: options.currency,
            key: RAZORPAY_KEY_ID || "rzp_test_mock_key",
            orderId: order._id,
            isMock: true,
          },
          "Development Sandbox simulated payment (Razorpay keys not configured)"
        )
      );
    }

    console.error("❌ Razorpay order creation error:", error);
    throw new ApiError(
      500,
      `Payment gateway error: ${error?.error?.description || error?.message || "Failed to create payment intent"}`
    );
  }
});

// 2. Client Callback Signature Verification
export const verifyPaymentSignature = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !orderId
  ) {
    throw new ApiError(400, "Missing payment verification parameters");
  }

  // Support Dev Sandbox mock order verification
  if (razorpay_order_id.startsWith("order_mock_")) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    order.paymentInfo.status = "paid";
    order.paymentInfo.transactionId = razorpay_payment_id || `pay_mock_${Date.now()}`;
    order.paymentInfo.paidAt = new Date();
    order.orderStatus = "confirmed";
    await order.save();

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Payment simulated and order confirmed"));
  }

  // Generate HMAC-SHA256 signature for real Razorpay responses
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    throw new ApiError(400, "Invalid payment signature. Transaction compromised");
  }

  // Update order status to paid
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.paymentInfo.status = "paid";
  order.paymentInfo.transactionId = razorpay_payment_id;
  order.paymentInfo.paidAt = new Date();
  order.orderStatus = "confirmed";
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Payment verified and order confirmed"));
});

// 3. Razorpay Server Webhook Listener (Asynchronous Settlement)
export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSignature = req.headers["x-razorpay-signature"];

  if (!webhookSignature) {
    throw new ApiError(400, "Missing webhook signature header");
  }

  // Webhooks require the raw string buffer for signature verification
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (expectedSignature !== webhookSignature) {
    throw new ApiError(400, "Invalid webhook signature");
  }

  const { event, payload } = req.body;

  if (event === "order.paid" || event === "payment.captured") {
    const paymentEntity = payload.payment.entity;
    const orderId = paymentEntity.notes?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.paymentInfo.status !== "paid") {
        order.paymentInfo.status = "paid";
        order.paymentInfo.transactionId = paymentEntity.id;
        order.paymentInfo.paidAt = new Date();
        order.orderStatus = "confirmed";
        await order.save();
      }
    }
  }

  if (event === "payment.failed") {
    const paymentEntity = payload.payment.entity;
    const orderId = paymentEntity.notes?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.paymentInfo.status !== "paid") {
        order.paymentInfo.status = "failed";
        await order.save();
      }
    }
  }

  // Razorpay expects a 200 OK acknowledgment
  return res.status(200).json({ status: "ok" });
});