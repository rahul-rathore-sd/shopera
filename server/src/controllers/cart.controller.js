import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Get User Cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "title slug images basePrice baseDiscountPrice stock hasVariants variants isPublished",
  });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

// 2. Add Item to Cart (or update quantity)
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const parsedQty = Math.max(1, parseInt(quantity, 10));

  const product = await Product.findById(productId);
  if (!product || !product.isPublished) {
    throw new ApiError(404, "Product not found or unavailable");
  }

  let selectedPrice = product.baseDiscountPrice || product.basePrice;
  let availableStock = product.stock;
  let sku = "";

  if (product.hasVariants) {
    if (!variantId) {
      throw new ApiError(400, "Variant ID is required for this product");
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      throw new ApiError(404, "Selected variant does not exist");
    }

    selectedPrice = variant.discountPrice || variant.price;
    availableStock = variant.stock;
    sku = variant.sku;
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex((item) => {
    const isSameProduct = item.product.toString() === productId;
    const isSameVariant = variantId
      ? item.variantId?.toString() === variantId
      : !item.variantId;
    return isSameProduct && isSameVariant;
  });

  if (existingItemIndex > -1) {
    const newQty = cart.items[existingItemIndex].quantity + parsedQty;
    if (newQty > availableStock) {
      throw new ApiError(400, `Cannot add more than available stock (${availableStock})`);
    }
    cart.items[existingItemIndex].quantity = newQty;
    cart.items[existingItemIndex].priceSnapshot = selectedPrice;
  } else {
    if (parsedQty > availableStock) {
      throw new ApiError(400, `Requested quantity exceeds available stock (${availableStock})`);
    }
    cart.items.push({
      product: productId,
      variantId: variantId || null,
      sku,
      quantity: parsedQty,
      priceSnapshot: selectedPrice,
    });
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "title slug images basePrice baseDiscountPrice stock hasVariants variants",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, populatedCart, "Item added to cart"));
});

// 3. Update Item Quantity in Cart
export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty < 1) {
    throw new ApiError(400, "Quantity must be a positive integer");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  const product = await Product.findById(item.product);
  if (!product) {
    throw new ApiError(404, "Associated product no longer exists");
  }

  let availableStock = product.stock;
  if (product.hasVariants && item.variantId) {
    const variant = product.variants.id(item.variantId);
    if (!variant) throw new ApiError(404, "Variant not found");
    availableStock = variant.stock;
  }

  if (parsedQty > availableStock) {
    throw new ApiError(400, `Requested quantity exceeds available stock (${availableStock})`);
  }

  item.quantity = parsedQty;
  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item updated successfully"));
});

// 4. Remove Item from Cart
export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items.pull({ _id: itemId });
  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Item removed from cart"));
});

// 5. Clear Entire Cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [], coupon: { code: "", discountAmount: 0 } } },
    { returnDocument: "after" }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart cleared successfully"));
});