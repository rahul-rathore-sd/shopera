import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cart, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon } =
    useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(null); // track which item is updating

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <ShoppingBag className="mx-auto h-16 w-16 text-slate-300" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Your Cart is waiting</h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to view your saved items and proceed to checkout.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700"
        >
          Sign In to Shopera
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];

  // Calculations
  const subtotal = items.reduce(
    (acc, item) => acc + item.priceSnapshot * item.quantity,
    0
  );
  const discount = cart?.coupon?.discountAmount || 0;
  const deliveryCharges = subtotal > 1000 || subtotal === 0 ? 0 : 100;
  const estimatedTax = Math.round(subtotal * 0.18); // 18% GST standard
  const grandTotal = Math.max(0, subtotal + estimatedTax + deliveryCharges - discount);

  const handleQuantityChange = async (itemId, nextQty) => {
    if (nextQty < 1) return;
    try {
      setIsUpdating(itemId);
      await updateQuantity(itemId, nextQty);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setIsUpdating(itemId);
      await removeItem(itemId);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      applyCoupon(couponInput);
      setCouponSuccess(`Coupon '${couponInput.toUpperCase()}' applied successfully!`);
      setCouponInput("");
    } catch (err) {
      setCouponError(err.message || "Failed to apply coupon");
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="mt-2 text-sm text-slate-500">
          Explore our trending catalog and pick something exceptional today!
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
          Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline"
        >
          Empty Cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Column: Cart Items List */}
        <div className="space-y-4 lg:col-span-8">
          {items.map((item) => {
            const product = item.product || {};
            const itemImage =
              product.images?.[0]?.url || "https://placehold.co/150x150?text=Item";

            return (
              <div
                key={item._id}
                className={`flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                  isUpdating === item._id ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-4">
                  <img
                    src={itemImage}
                    alt={product.title || "Cart Item"}
                    className="h-20 w-20 flex-shrink-0 rounded-xl border border-slate-100 object-cover"
                  />
                  <div className="flex flex-col">
                    <Link
                      to={`/product/${product.slug}`}
                      className="line-clamp-1 font-semibold text-slate-900 hover:text-indigo-600"
                    >
                      {product.title}
                    </Link>
                    {item.sku && (
                      <span className="mt-0.5 text-xs text-slate-400">
                        SKU: <strong className="text-slate-600">{item.sku}</strong>
                      </span>
                    )}
                    <span className="mt-1 font-black text-slate-900 sm:hidden">
                      ₹{(item.priceSnapshot * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Controls (Quantity Counter + Price + Delete) */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:border-none sm:pt-0 sm:gap-6">
                  {/* Quantity Counter */}
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-50"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Desktop Item Total */}
                  <div className="hidden text-right sm:block">
                    <span className="text-base font-black text-slate-900">
                      ₹{(item.priceSnapshot * item.quantity).toLocaleString("en-IN")}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      ₹{item.priceSnapshot.toLocaleString("en-IN")} each
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="p-2 text-slate-400 transition hover:text-rose-600"
                    title="Remove Item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary & Checkout Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Order Summary</h3>

            {/* Coupon Code Accordion */}
            <div className="space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. SHOPERA10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs uppercase outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Apply
                </button>
              </form>

              {couponError && (
                <div className="flex items-center gap-1 text-[11px] text-rose-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{couponError}</span>
                </div>
              )}

              {couponSuccess && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{couponSuccess}</span>
                </div>
              )}

              {cart?.coupon?.code && (
                <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700">
                  <span className="font-semibold">Code: {cart.coupon.code}</span>
                  <button
                    onClick={removeCoupon}
                    className="text-indigo-500 hover:text-indigo-800"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Line Item Breakdown */}
            <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between font-medium text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated GST (18%)</span>
                <span>₹{estimatedTax.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>
                  {deliveryCharges === 0 ? (
                    <strong className="text-emerald-600">FREE</strong>
                  ) : (
                    `₹${deliveryCharges}`
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => navigate("/checkout")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Security Footnote */}
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Safe & Secure 256-Bit Encrypted Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}