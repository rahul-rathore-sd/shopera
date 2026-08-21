import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Cart } from "../models/Cart.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { withOptionalTransaction } from "../utils/transaction.js";

// 1. Create Order with Atomic Stock Lock
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !paymentMethod) {
    throw new ApiError(400, "Shipping address and payment method are required");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cannot place order: Cart is empty");
  }

  const createdOrder = await withOptionalTransaction(async (session) => {
    const sessionOpt = session ? { session } : undefined;
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      let query = Product.findById(item.product);
      if (session) query = query.session(session);
      const product = await query;

      if (!product || !product.isPublished) {
        throw new ApiError(404, `Product '${item.product}' not found or unlisted`);
      }

      if (product.hasVariants) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          throw new ApiError(404, `Variant not found for product '${product.title}'`);
        }

        if (variant.stock < item.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for '${product.title}' (${variant.attributes?.size || variant.sku}). Available: ${variant.stock}`
          );
        }

        // Atomic decrement variant stock and recalculate total
        variant.stock -= item.quantity;
        product.stock = product.variants.reduce((acc, v) => acc + v.stock, 0);
        await product.save(sessionOpt);

        const unitPrice = variant.discountPrice || variant.price;
        itemsPrice += unitPrice * item.quantity;

        orderItems.push({
          product: product._id,
          variantId: variant._id,
          title: product.title,
          sku: variant.sku,
          image: variant.image?.url || product.images[0]?.url || "",
          price: unitPrice,
          quantity: item.quantity,
        });
      } else {
        if (product.stock < item.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for '${product.title}'. Available: ${product.stock}`
          );
        }

        // Atomic decrement standard product stock
        product.stock -= item.quantity;
        await product.save(sessionOpt);

        const unitPrice = product.baseDiscountPrice || product.basePrice;
        itemsPrice += unitPrice * item.quantity;

        orderItems.push({
          product: product._id,
          title: product.title,
          sku: "",
          image: product.images[0]?.url || "",
          price: unitPrice,
          quantity: item.quantity,
        });
      }
    }

    // Pricing calculation
    const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST standard
    const shippingPrice = itemsPrice > 1000 ? 0 : 100;
    const discountPrice = cart.coupon?.discountAmount || 0;
    const totalAmount = Math.max(0, itemsPrice + taxPrice + shippingPrice - discountPrice);

    // Initial 4-digit Delivery OTP
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Create Order Document inside transaction/direct
    const [newOrder] = await Order.create(
      [
        {
          user: req.user._id,
          orderItems,
          shippingAddress,
          pricing: {
            itemsPrice,
            taxPrice,
            shippingPrice,
            discountPrice,
            totalAmount,
          },
          paymentInfo: {
            method: paymentMethod,
            status: paymentMethod === "cod" ? "pending" : "pending",
          },
          deliveryPreferences: req.body?.deliveryPreferences || {
            preferredSlot: "anytime",
            deliveryInstructions: "",
          },
          deliveryAgent: {
            deliveryOtp,
          },
          orderStatus: "placed",
        },
      ],
      sessionOpt
    );

    // Clear user cart inside transaction/direct
    cart.items = [];
    cart.coupon = { code: "", discountAmount: 0 };
    await cart.save(sessionOpt);

    return newOrder;
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdOrder, "Order placed successfully"));
});

// 2. Get User Orders (or All Orders if Admin)
export const getMyOrders = asyncHandler(async (req, res) => {
  const query = req.user.role === "admin" ? {} : { user: req.user._id };
  const orders = await Order.find(query)
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// 3. Get Single Order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate("user", "name email");
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Authorize: Only order owner or admin can view
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Unauthorized to view this order");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order details fetched successfully"));
});

// 4. Update Order Status (Admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, trackingInfo, deliveryAgent } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.orderStatus === "delivered") {
    throw new ApiError(400, "Order is already marked as delivered");
  }

  if (status) order.orderStatus = status;
  if (trackingInfo) order.trackingInfo = trackingInfo;

  // Handle Out for Delivery Transition
  if (status === "out_for_delivery") {
    order.outForDeliveryAt = new Date();
    order.deliveryAgent = {
      name: deliveryAgent?.name || order.deliveryAgent?.name || "Vikram Sen",
      phone: deliveryAgent?.phone || order.deliveryAgent?.phone || "+91 98765 43210",
      vehicleNumber:
        deliveryAgent?.vehicleNumber ||
        order.deliveryAgent?.vehicleNumber ||
        "MH-02-DN-7890",
      photoUrl:
        deliveryAgent?.photoUrl ||
        order.deliveryAgent?.photoUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      deliveryOtp:
        order.deliveryAgent?.deliveryOtp ||
        Math.floor(1000 + Math.random() * 9000).toString(),
    };
  }

  if (status === "delivered") {
    order.deliveredAt = new Date();
    order.paymentInfo.status = "paid";
  }

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// 5. Update Customer Delivery Preferences / Reschedule Slot
export const updateDeliveryPreferences = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { preferredSlot, preferredDate, deliveryInstructions } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Unauthorized to update this order");
  }

  if (["delivered", "cancelled", "returned"].includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Cannot update delivery preferences for an order that is '${order.orderStatus}'`
    );
  }

  if (!order.deliveryPreferences) {
    order.deliveryPreferences = {};
  }

  if (preferredSlot) order.deliveryPreferences.preferredSlot = preferredSlot;
  if (preferredDate) order.deliveryPreferences.preferredDate = new Date(preferredDate);
  if (deliveryInstructions !== undefined) {
    order.deliveryPreferences.deliveryInstructions = deliveryInstructions.trim();
  }
  order.deliveryPreferences.rescheduled = true;

  await order.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        order,
        "Delivery preferences updated successfully"
      )
    );
});

// 5. Cancel Order with Inventory Restock
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Unauthorized to cancel this order");
  }

  if (["shipped", "out_for_delivery", "delivered"].includes(order.orderStatus)) {
    throw new ApiError(400, `Cannot cancel order when status is '${order.orderStatus}'`);
  }

  await withOptionalTransaction(async (session) => {
    const sessionOpt = session ? { session } : undefined;

    // Restock all items back to product inventory
    for (const item of order.orderItems) {
      let query = Product.findById(item.product);
      if (session) query = query.session(session);
      const product = await query;

      if (product) {
        if (product.hasVariants && item.variantId) {
          const variant = product.variants.id(item.variantId);
          if (variant) {
            variant.stock += item.quantity;
            product.stock = product.variants.reduce((acc, v) => acc + v.stock, 0);
          }
        } else {
          product.stock += item.quantity;
        }
        await product.save(sessionOpt);
      }
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = reason || "Cancelled by customer";
    await order.save(sessionOpt);
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled and stock restored"));
});