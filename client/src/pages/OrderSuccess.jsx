import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  MapPin,
  CreditCard,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  Home,
} from "lucide-react";
import api from "../api/axiosInstance";

export default function OrderSuccess() {
  const { id } = useParams();

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Retrieving order details...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Order Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          We could not locate this order. It may have expired or belongs to a different account.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
        >
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  // Delivery Estimate Date (Order Created + 4 Days)
  const orderDate = new Date(order.createdAt);
  const estimatedDeliveryDate = new Date(orderDate);
  estimatedDeliveryDate.setDate(orderDate.getDate() + 4);

  // Status mapping for pipeline tracking
  const statusSteps = [
    { key: "placed", label: "Order Placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const statusHierarchy = {
    placed: 1,
    confirmed: 2,
    processing: 3,
    shipped: 4,
    out_for_delivery: 4,
    delivered: 5,
    cancelled: 0,
  };

  const currentStepLevel = statusHierarchy[order.orderStatus] || 1;
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl">
          Thank you for your order!
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          A confirmation and tracking link have been dispatched to your registered email.
        </p>

        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-white px-5 py-2.5 shadow-sm text-xs font-semibold text-slate-700">
          <span>Order ID: <strong className="text-slate-900">#{order._id}</strong></span>
          <span className="text-slate-300">|</span>
          <span>
            Placed on:{" "}
            <strong className="text-slate-900">
              {orderDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </span>
        </div>
      </div>

      {/* Live Tracking Progress Bar */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Delivery Status</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Est. Delivery:{" "}
              {estimatedDeliveryDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>

        {isCancelled ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-semibold text-rose-700">
            This order was cancelled on{" "}
            {new Date(order.cancelledAt || order.updatedAt).toLocaleDateString()}. Reason:{" "}
            {order.cancellationReason || "Customer Request"}
          </div>
        ) : (
          <div className="mt-8">
            <div className="relative flex justify-between">
              {/* Connector line */}
              <div className="absolute left-0 top-1/2 -z-0 h-1 w-full -translate-y-1/2 bg-slate-100">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${((currentStepLevel - 1) / (statusSteps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {statusSteps.map((s, idx) => {
                const isPassed = currentStepLevel >= idx + 1;
                return (
                  <div key={s.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                        isPassed
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-center text-[11px] font-semibold sm:text-xs ${
                        isPassed ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Details & Summary Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Purchased Items Snapshots */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
              <Package className="h-5 w-5 text-indigo-600" />
              <span>Purchased Items ({order.orderItems?.length})</span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <img
                    src={item.image || "https://placehold.co/120x120"}
                    alt={item.title}
                    className="h-16 w-16 rounded-xl border border-slate-100 object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="line-clamp-1 text-sm font-bold text-slate-900">
                      {item.title}
                    </h4>
                    {item.sku && (
                      <p className="text-xs text-slate-400">
                        SKU: <span className="text-slate-600">{item.sku}</span>
                      </p>
                    )}
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      ₹{item.price.toLocaleString("en-IN")} each
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Shipping Address, Payment & Financial Breakdown */}
        <div className="space-y-6 lg:col-span-5">
          {/* Shipping & Payment Meta */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <span>Delivery Address</span>
            </div>
            <div className="mt-3 text-xs leading-relaxed text-slate-600">
              <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
              <p>
                {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
              </p>
              <p className="mt-1">Phone: {order.shippingAddress?.phone}</p>
            </div>

            <div className="mt-6 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
              <CreditCard className="h-4 w-4 text-indigo-600" />
              <span>Payment Info</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-600 uppercase font-semibold">
                Method: {order.paymentInfo?.method}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                  order.paymentInfo?.status === "paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {order.paymentInfo?.status}
              </span>
            </div>
          </div>

          {/* Pricing Ledger */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Payment Receipt</span>
            </div>

            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{order.pricing?.itemsPrice?.toLocaleString("en-IN")}</span>
              </div>
              {order.pricing?.discountPrice > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{order.pricing?.discountPrice?.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxes (GST 18%)</span>
                <span>₹{order.pricing?.taxPrice?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.pricing?.shippingPrice === 0 ? (
                    <strong className="text-emerald-600">FREE</strong>
                  ) : (
                    `₹${order.pricing?.shippingPrice}`
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-black text-slate-900">
                <span>Total Paid</span>
                <span>₹{order.pricing?.totalAmount?.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Catalog Return CTA */}
          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}