import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    title: { type: String, required: true },
    sku: { type: String, default: "" },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderItems: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items && items.length > 0,
        message: "An order must contain at least one item",
      },
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: "India" },
    },
    pricing: {
      itemsPrice: { type: Number, required: true, min: 0 },
      taxPrice: { type: Number, required: true, min: 0, default: 0 },
      shippingPrice: { type: Number, required: true, min: 0, default: 0 },
      discountPrice: { type: Number, required: true, min: 0, default: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
    },
    paymentInfo: {
      method: {
        type: String,
        enum: {
          values: ["card", "upi", "netbanking", "cod", "wallet"],
          message: "{VALUE} is not a valid payment method",
        },
        required: true,
      },
      status: {
        type: String,
        enum: {
          values: ["pending", "authorized", "paid", "failed", "refunded"],
          message: "{VALUE} is not a valid payment status",
        },
        default: "pending",
      },
      transactionId: { type: String, default: "" },
      paidAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: {
        values: [
          "placed",
          "confirmed",
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
          "cancelled",
          "returned",
        ],
        message: "{VALUE} is not a valid order status",
      },
      default: "placed",
      index: true,
    },
    trackingInfo: {
      carrier: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      estimatedDelivery: { type: Date },
    },
    deliveryPreferences: {
      preferredSlot: {
        type: String,
        enum: ["morning", "afternoon", "evening", "anytime"],
        default: "anytime",
      },
      preferredDate: { type: Date },
      deliveryInstructions: { type: String, default: "" },
      rescheduled: { type: Boolean, default: false },
    },
    deliveryAgent: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      vehicleNumber: { type: String, default: "" },
      photoUrl: { type: String, default: "" },
      deliveryOtp: { type: String, default: "" },
    },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound queries optimization (e.g., get user orders sorted by date)
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);