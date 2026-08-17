import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    priceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    coupon: {
      code: { type: String, trim: true, uppercase: true },
      discountAmount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for dynamic cart total
cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce(
    (total, item) => total + item.priceSnapshot * item.quantity,
    0
  );
});

export const Cart = mongoose.model("Cart", cartSchema);