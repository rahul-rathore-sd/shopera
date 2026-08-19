import { create } from "zustand";
import api from "../api/axiosInstance";

export const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get("/cart");
      set({ cart: data.data, isLoading: false });
    } catch {
      set({ cart: null, isLoading: false });
    }
  },

  addToCart: async (productId, variantId = null, quantity = 1) => {
    const { data } = await api.post("/cart", { productId, variantId, quantity });
    set({ cart: data.data });
    return data;
  },

  updateQuantity: async (itemId, quantity) => {
    const { data } = await api.put(`/cart/item/${itemId}`, { quantity });
    set({ cart: data.data });
    return data;
  },

  removeItem: async (itemId) => {
    const { data } = await api.delete(`/cart/item/${itemId}`);
    set({ cart: data.data });
    return data;
  },

  clearCart: async () => {
    const { data } = await api.delete("/cart");
    set({ cart: data.data });
    return data;
  },

  applyCoupon: async (couponCode) => {
    // Basic client-side/mock voucher validator (or backend endpoint)
    const validCoupons = {
      SHOPERA10: 0.1, // 10% off
      WELCOME500: 500, // Flat 500 off
    };

    const code = couponCode.trim().toUpperCase();
    const currentCart = get().cart;

    if (!validCoupons[code]) {
      throw new Error("Invalid coupon code");
    }

    const subtotal = currentCart?.items?.reduce(
      (acc, item) => acc + item.priceSnapshot * item.quantity,
      0
    ) || 0;

    let discount = 0;
    if (code === "SHOPERA10") {
      discount = Math.round(subtotal * 0.1);
    } else if (code === "WELCOME500") {
      discount = subtotal > 1500 ? 500 : 0;
      if (discount === 0) {
        throw new Error("Coupon valid only on orders above ₹1,500");
      }
    }

    set({
      cart: {
        ...currentCart,
        coupon: {
          code,
          discountAmount: discount,
        },
      },
    });
  },

  removeCoupon: () => {
    const currentCart = get().cart;
    if (currentCart) {
      set({
        cart: {
          ...currentCart,
          coupon: { code: "", discountAmount: 0 },
        },
      });
    }
  },

  getTotalItemCount: () => {
    const cart = get().cart;
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },
}));