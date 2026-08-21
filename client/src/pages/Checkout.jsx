// Here is the complete Multi-Step Checkout Page (src/pages/Checkout.jsx). It integrates:

// Step 1: Shipping Address Collection & Form Validation

// Step 2: Order Review & Item Breakdown

// Step 3: Payment Method Selection & Razorpay SDK Modal Integration (with signature verification callback)

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShoppingBag,
  MapPin,
} from "lucide-react";
import api from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { loadRazorpayScript } from "../utils/loadRazorpay";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { cart, fetchCart } = useCartStore();

  const [step, setStep] = useState(1); // Step 1: Address, Step 2: Payment & Review
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Shipping Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState("upi"); // "upi", "card", "netbanking", "cod"

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (acc, item) => acc + item.priceSnapshot * item.quantity,
    0
  );
  const discount = cart?.coupon?.discountAmount || 0;
  const shippingPrice = subtotal > 1000 || subtotal === 0 ? 0 : 100;
  const taxPrice = Math.round(subtotal * 0.18);
  const totalAmount = Math.max(0, subtotal + taxPrice + shippingPrice - discount);

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ["fullName", "phone", "street", "city", "state", "postalCode"];
    const hasEmptyField = requiredFields.some((field) => !shippingAddress[field]?.trim());

    if (hasEmptyField) {
      setErrorMessage("Please complete all shipping address fields.");
      return;
    }
    setErrorMessage("");
    setStep(2);
  };

  // Main Payment & Order Finalization Handler
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // 1. Create Internal Order Document in MongoDB
      const orderRes = await api.post("/orders", {
        shippingAddress,
        paymentMethod,
      });
      const order = orderRes.data.data;

      // If Cash on Delivery or Instant Demo Pay, complete immediately
      if (paymentMethod === "cod" || paymentMethod === "demo_pay") {
        await fetchCart();
        navigate(`/order-success/${order._id}`);
        return;
      }

      // 2. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // 3. Generate Razorpay Order Intent from Backend
      const razorpayOrderRes = await api.post("/payments/create-order", {
        orderId: order._id,
      });
      const rzpData = razorpayOrderRes.data.data;

      // Normalize prefill fields to comply with Razorpay validation
      const prefillEmail =
        user?.email && !user.email.endsWith(".demo")
          ? user.email
          : "customer@gmail.com";
      const cleanPhone = (shippingAddress.phone || "").replace(/\D/g, "") || "9876543210";

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency || "INR",
        name: "Shopera",
        description: `Order Payment #${order._id}`,
        order_id: rzpData.id,
        handler: async function (response) {
          try {
            // 5. Verify cryptographic signature on backend
            await api.post("/payments/verify-signature", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });

            await fetchCart();
            navigate(`/order-success/${order._id}`);
          } catch (verificationError) {
            setErrorMessage(
              verificationError.response?.data?.message ||
                "Payment verification failed. Please contact customer support."
            );
          }
        },
        prefill: {
          name: shippingAddress.fullName || "Customer",
          email: prefillEmail,
          contact: cleanPhone,
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const razorpayModal = new window.Razorpay(options);
      razorpayModal.on("payment.failed", function (response) {
        setErrorMessage(
          response.error?.description || "Payment attempt failed. You can use Cash on Delivery or Instant Demo Pay to complete the order."
        );
      });
      razorpayModal.open();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to process order. You can use Instant Demo Pay or Cash on Delivery."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-slate-300" />
        <h2 className="mt-4 text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="mt-2 text-sm text-slate-500">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Step Indicator Header */}
      <div className="mb-10 flex items-center justify-center gap-4 text-sm font-bold">
        <div
          className={`flex items-center gap-2 ${
            step >= 1 ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs text-white ${
              step >= 1 ? "bg-indigo-600" : "bg-slate-300"
            }`}
          >
            1
          </span>
          <span>Shipping Address</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />
        <div
          className={`flex items-center gap-2 ${
            step === 2 ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs text-white ${
              step === 2 ? "bg-indigo-600" : "bg-slate-300"
            }`}
          >
            2
          </span>
          <span>Review & Payment</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Column: Multi-Step Forms */}
        <div className="lg:col-span-7">
          {step === 1 ? (
            /* STEP 1: Shipping Address Form */
            <form
              onSubmit={handleAddressSubmit}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-lg font-bold text-slate-900">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <span>Delivery Address</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={shippingAddress.fullName}
                    onChange={handleAddressChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="Flat, House no., Building, Street"
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    placeholder="110001"
                    value={shippingAddress.postalCode}
                    onChange={handleAddressChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Payment Method Selection */
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <span>Choose Payment Method</span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Edit Address
                </button>
              </div>

              {/* Selected Address Summary */}
              <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                <p className="font-bold text-slate-900">{shippingAddress.fullName}</p>
                <p className="mt-0.5">
                  {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} -{" "}
                  {shippingAddress.postalCode}
                </p>
                <p className="mt-0.5">Phone: {shippingAddress.phone}</p>
              </div>

              {/* Payment Method Radio Options */}
              <div className="space-y-3">
                {[
                  {
                    id: "demo_pay",
                    title: "⚡ Instant Demo Pay (Simulate Paid Order)",
                    desc: "1-click instant confirmation for portfolio demos & sandbox testing",
                    badge: "RECOMMENDED FOR TESTING",
                  },
                  {
                    id: "upi",
                    title: "UPI / QR Code",
                    desc: "Google Pay, PhonePe, Paytm, BHIM via Razorpay",
                  },
                  {
                    id: "card",
                    title: "Credit / Debit Card",
                    desc: "Visa, MasterCard, RuPay, Amex via Razorpay",
                  },
                  {
                    id: "netbanking",
                    title: "Net Banking",
                    desc: "All Major Indian Banks via Razorpay",
                  },
                  {
                    id: "cod",
                    title: "Cash on Delivery (COD)",
                    desc: "Pay in cash at your doorstep",
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      paymentMethod === method.id
                        ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_option"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{method.title}</p>
                        {method.badge && (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-black text-indigo-700">
                            {method.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePlaceOrder}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    <span>
                      {paymentMethod === "cod"
                        ? `Confirm Order (₹${totalAmount.toLocaleString("en-IN")})`
                        : `Pay ₹${totalAmount.toLocaleString("en-IN")}`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Order Items & Pricing Breakdown */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">
              Order Items ({items.length})
            </h3>

            <div className="max-h-60 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => {
                const product = item.product || {};
                const image = product.images?.[0]?.url || "https://placehold.co/100x100";
                return (
                  <div key={item._id} className="flex items-center gap-3">
                    <img
                      src={image}
                      alt={product.title}
                      className="h-14 w-14 rounded-lg border border-slate-100 object-cover"
                    />
                    <div className="flex-1 text-xs">
                      <p className="line-clamp-1 font-semibold text-slate-900">
                        {product.title}
                      </p>
                      <p className="text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      ₹{(item.priceSnapshot * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Line Items */}
            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>Coupon Savings</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST Standard (18%)</span>
                <span>₹{taxPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {shippingPrice === 0 ? (
                    <strong className="text-emerald-600">FREE</strong>
                  ) : (
                    `₹${shippingPrice}`
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900">
                <span>Final Payable</span>
                <span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Razorpay Verified Merchant Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}