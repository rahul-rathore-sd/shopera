import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Cart } from "../models/Cart.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);

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
        await product.save({ session });

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
        await product.save({ session });

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

    // Create Order Document inside transaction
    const [createdOrder] = await Order.create(
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
          orderStatus: "placed",
        },
      ],
      { session }
    );

    // Clear user cart inside transaction
    cart.items = [];
    cart.coupon = { code: "", discountAmount: 0 };
    await cart.save({ session });

    await session.commitTransaction();

    return res
      .status(201)
      .json(new ApiResponse(201, createdOrder, "Order placed successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// 2. Get User Orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

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
  const { status, trackingInfo } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.orderStatus === "delivered") {
    throw new ApiError(400, "Order is already marked as delivered");
  }

  if (status) order.orderStatus = status;
  if (trackingInfo) order.trackingInfo = trackingInfo;

  if (status === "delivered") {
    order.deliveredAt = new Date();
    order.paymentInfo.status = "paid";
  }

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Restock all items back to product inventory
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product).session(session);
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
        await product.save({ session });
      }
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancellationReason = reason || "Cancelled by customer";
    await order.save({ session });

    await session.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order cancelled and stock restored"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});