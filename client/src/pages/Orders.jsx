import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  MapPin,
  Loader2,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Search,
  Copy,
  Check,
  Printer,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Receipt,
  Phone,
  ShieldCheck,
  KeyRound,
  Sun,
  Sunset,
  Sunrise,
  Zap,
  MessageSquare,
  Navigation,
} from "lucide-react";
import api from "../api/axiosInstance";
import { useCartStore } from "../store/useCartStore";

export default function Orders() {
  const { addToCart } = useCartStore();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // "all", "active", "out_for_delivery", "delivered", "cancelled"
  const [searchQuery, setSearchQuery] = useState("");

  // Cancel order modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);

  // Delivery Scheduling Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulingOrder, setSchedulingOrder] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("anytime");
  const [selectedDateOption, setSelectedDateOption] = useState("today");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");

  // Copied Order ID state for visual feedback
  const [copiedId, setCopiedId] = useState(null);

  // Reorder loading state
  const [reorderingId, setReorderingId] = useState(null);
  const [reorderSuccess, setReorderSuccess] = useState("");

  // Expanded items state (accordion)
  const [expandedOrderIds, setExpandedOrderIds] = useState(new Set());

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data.data || []);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to retrieve your orders."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reorder all items in an order
  const handleReorder = async (order) => {
    try {
      setReorderingId(order._id);
      setReorderSuccess("");
      for (const item of order.orderItems || []) {
        if (item.product) {
          const prodId = typeof item.product === "object" ? item.product._id : item.product;
          await addToCart(prodId, item.variantId || null, item.quantity || 1);
        }
      }
      setReorderSuccess(`Items from order #${order._id.slice(-6).toUpperCase()} added to your cart!`);
      setTimeout(() => setReorderSuccess(""), 4000);
    } catch (err) {
      console.error("Failed to reorder items:", err);
    } finally {
      setReorderingId(null);
    }
  };

  const handleOpenCancelModal = (orderId) => {
    setCancellingOrderId(orderId);
    setCancelReason("");
    setCancelError("");
    setCancelModalOpen(true);
  };

  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    if (!cancellingOrderId) return;

    try {
      setIsSubmittingCancel(true);
      setCancelError("");
      await api.put(`/orders/${cancellingOrderId}/cancel`, {
        reason: cancelReason.trim() || "Cancelled by customer",
      });
      setCancelModalOpen(false);
      await fetchOrders();
    } catch (err) {
      setCancelError(
        err.response?.data?.message || "Failed to cancel this order."
      );
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleOpenInvoice = (order) => {
    setActiveInvoiceOrder(order);
    setInvoiceModalOpen(true);
  };

  // Open Delivery Slot Scheduler
  const handleOpenScheduleModal = (order) => {
    setSchedulingOrder(order);
    setSelectedSlot(order.deliveryPreferences?.preferredSlot || "anytime");
    setDeliveryInstructions(order.deliveryPreferences?.deliveryInstructions || "");
    setSelectedDateOption("today");
    setScheduleError("");
    setScheduleSuccess("");
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedulingOrder) return;

    try {
      setIsSubmittingSchedule(true);
      setScheduleError("");

      let targetDate = new Date();
      if (selectedDateOption === "tomorrow") {
        targetDate.setDate(targetDate.getDate() + 1);
      } else if (selectedDateOption === "day_after") {
        targetDate.setDate(targetDate.getDate() + 2);
      }

      const res = await api.patch(`/orders/${schedulingOrder._id}/delivery-preferences`, {
        preferredSlot: selectedSlot,
        preferredDate: targetDate,
        deliveryInstructions: deliveryInstructions.trim(),
      });

      setScheduleSuccess("Delivery preferences saved successfully!");
      setTimeout(() => {
        setScheduleModalOpen(false);
        fetchOrders();
      }, 1200);
    } catch (err) {
      setScheduleError(
        err.response?.data?.message || "Failed to update delivery preferences."
      );
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} at ${timePart}`;
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 30) return `${diffDay}d ago`;
    return past.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const getEstimatedDelivery = (dateString) => {
    const orderDate = new Date(dateString);
    const estStart = new Date(orderDate);
    estStart.setDate(orderDate.getDate() + 3);
    const estEnd = new Date(orderDate);
    estEnd.setDate(orderDate.getDate() + 5);

    return `${estStart.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${estEnd.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case "out_for_delivery":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm animate-pulse">
            <Navigation className="h-3.5 w-3.5 text-white" />
            <span>Out for Delivery</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
            <Truck className="h-3.5 w-3.5 text-purple-600" />
            <span>Shipped</span>
          </span>
        );
      case "confirmed":
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Clock className="h-3.5 w-3.5 text-indigo-600" />
            <span className="capitalize">{status}</span>
          </span>
        );
      case "placed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            <Package className="h-3.5 w-3.5 text-amber-600" />
            <span>Order Placed</span>
          </span>
        );
      case "cancelled":
      case "returned":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            <span className="capitalize">{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  // 5-Step Delivery Stepper
  const getStepProgress = (status) => {
    const steps = [
      { id: "placed", label: "Placed" },
      { id: "confirmed", label: "Confirmed" },
      { id: "shipped", label: "Shipped" },
      { id: "out_for_delivery", label: "Out for Delivery" },
      { id: "delivered", label: "Delivered" },
    ];

    let currentStep = 0;
    if (status === "placed") currentStep = 0;
    else if (status === "confirmed" || status === "processing") currentStep = 1;
    else if (status === "shipped") currentStep = 2;
    else if (status === "out_for_delivery") currentStep = 3;
    else if (status === "delivered") currentStep = 4;

    return { steps, currentStep };
  };

  const getSlotLabel = (slot) => {
    switch (slot) {
      case "morning":
        return "Morning (8 AM - 12 PM)";
      case "afternoon":
        return "Afternoon (12 PM - 4 PM)";
      case "evening":
        return "Evening (4 PM - 8 PM)";
      default:
        return "Anytime (Regular)";
    }
  };

  const filteredOrders = orders.filter((order) => {
    let matchesStatus = true;
    if (selectedFilter === "active") {
      matchesStatus = ["placed", "confirmed", "processing", "shipped"].includes(
        order.orderStatus
      );
    } else if (selectedFilter === "out_for_delivery") {
      matchesStatus = order.orderStatus === "out_for_delivery";
    } else if (selectedFilter === "delivered") {
      matchesStatus = order.orderStatus === "delivered";
    } else if (selectedFilter === "cancelled") {
      matchesStatus = ["cancelled", "returned"].includes(order.orderStatus);
    }

    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const orderIdMatch = order._id.toLowerCase().includes(query);
    const itemMatch = order.orderItems?.some((item) =>
      item.title?.toLowerCase().includes(query) || item.sku?.toLowerCase().includes(query)
    );
    const addressMatch = order.shippingAddress?.city?.toLowerCase().includes(query);

    return orderIdMatch || itemMatch || addressMatch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Order History & Delivery
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time rider tracking, doorstep delivery PIN, custom delivery slots, and invoices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-600 hover:text-indigo-600"
          >
            <MapPin className="h-4 w-4 text-indigo-600" />
            <span>Saved Addresses</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Shop More</span>
          </Link>
        </div>
      </div>

      {/* Global Success Notification */}
      {reorderSuccess && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>{reorderSuccess}</span>
          </div>
          <Link
            to="/cart"
            className="flex items-center gap-1 text-xs font-bold text-emerald-900 underline hover:text-emerald-700"
          >
            <span>View Cart</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Orders", count: orders.length },
            {
              id: "out_for_delivery",
              label: "⚡ Out for Delivery",
              count: orders.filter((o) => o.orderStatus === "out_for_delivery").length,
            },
            {
              id: "active",
              label: "In Progress",
              count: orders.filter((o) =>
                ["placed", "confirmed", "processing", "shipped"].includes(o.orderStatus)
              ).length,
            },
            {
              id: "delivered",
              label: "Delivered",
              count: orders.filter((o) => o.orderStatus === "delivered").length,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: orders.filter((o) => ["cancelled", "returned"].includes(o.orderStatus)).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  selectedFilter === tab.id
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by Order ID, item, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-100"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500">Loading your orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto h-16 w-16 text-slate-300" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">No orders found</h2>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery
              ? `No matching orders for "${searchQuery}".`
              : selectedFilter === "all"
              ? "You haven't placed any orders yet. Discover our collection today!"
              : `No orders matching status '${selectedFilter}'.`}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
          >
            <span>Start Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOrders.map((order) => {
            const isCancellable = ["placed", "confirmed", "processing"].includes(
              order.orderStatus
            );
            const isCancelled = ["cancelled", "returned"].includes(order.orderStatus);
            const isOutForDelivery = order.orderStatus === "out_for_delivery";
            const isDelivered = order.orderStatus === "delivered";
            const isExpanded = expandedOrderIds.has(order._id);
            const { steps, currentStep } = getStepProgress(order.orderStatus);

            return (
              <div
                key={order._id}
                className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
                  isOutForDelivery
                    ? "border-emerald-500 ring-2 ring-emerald-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* 1. Header Bar: Date, Exact Time, Relative Time, Total, Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/90 px-6 py-4 text-xs">
                  <div className="flex flex-wrap items-center gap-6">
                    {/* Timestamp Details */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        ORDER PLACED
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="font-bold text-slate-900">
                          {formatDateTime(order.createdAt)}
                        </p>
                        <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {getRelativeTime(order.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        TOTAL AMOUNT
                      </span>
                      <p className="font-black text-slate-900 text-sm mt-0.5">
                        ₹{(order.pricing?.totalAmount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Ship To */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        DELIVERY TO
                      </span>
                      <p className="font-semibold text-slate-800 truncate max-w-[150px] mt-0.5">
                        {order.shippingAddress?.fullName} ({order.shippingAddress?.city})
                      </p>
                    </div>
                  </div>

                  {/* Order ID & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyOrderId(order._id)}
                      className="group flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[11px] text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition"
                      title="Copy full Order ID"
                    >
                      <span>#{order._id.slice(-8).toUpperCase()}</span>
                      {copiedId === order._id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-slate-400 group-hover:text-indigo-600" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenInvoice(order)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition"
                    >
                      <Receipt className="h-3.5 w-3.5 text-slate-500" />
                      <span>Invoice</span>
                    </button>

                    <Link
                      to={`/order-success/${order._id}`}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition"
                    >
                      <span>Receipt</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </Link>
                  </div>
                </div>

                {/* 2. OUT FOR DELIVERY HERO BANNER (When rider picks package) */}
                {isOutForDelivery && (
                  <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 px-6 py-5">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      {/* Rider Details */}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={
                              order.deliveryAgent?.photoUrl ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                            }
                            alt="Delivery Executive"
                            className="h-14 w-14 rounded-2xl border-2 border-white object-cover shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                            <Navigation className="h-3 w-3" />
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {order.deliveryAgent?.name || "Vikram Sen (Shopera Rider)"}
                            </h4>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Arriving Today
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Vehicle:{" "}
                            <strong className="font-mono text-slate-800">
                              {order.deliveryAgent?.vehicleNumber || "MH-02-DN-7890"}
                            </strong>
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <a
                              href={`tel:${order.deliveryAgent?.phone || "+919876543210"}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                            >
                              <Phone className="h-3 w-3" />
                              <span>Call Rider ({order.deliveryAgent?.phone || "+91 98765 43210"})</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Secure Handover OTP / PIN */}
                      <div className="flex flex-col items-start rounded-2xl border border-emerald-200/80 bg-white/90 p-3.5 shadow-sm md:items-end">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <KeyRound className="h-4 w-4 text-emerald-600" />
                          <span>Delivery Handover PIN (OTP)</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-mono text-xl font-black tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                            {order.deliveryAgent?.deliveryOtp || "5821"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Share this PIN with your rider upon doorstep delivery
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Visual 5-Step Delivery Stepper */}
                {!isCancelled ? (
                  <div className="border-b border-slate-100 bg-white px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        {getStatusBadge(order.orderStatus)}

                        {!isDelivered && (
                          <span className="text-xs font-medium text-slate-500">
                            Estimated Delivery:{" "}
                            <strong className="text-slate-800">
                              {getEstimatedDelivery(order.createdAt)}
                            </strong>
                          </span>
                        )}

                        {/* Preferred Slot Badge */}
                        {order.deliveryPreferences?.preferredSlot && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span>Slot: {getSlotLabel(order.deliveryPreferences.preferredSlot)}</span>
                          </span>
                        )}
                      </div>

                      {/* Reschedule Delivery Slot Button */}
                      {!isDelivered && (
                        <button
                          type="button"
                          onClick={() => handleOpenScheduleModal(order)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Delivery Slot & Instructions</span>
                        </button>
                      )}
                    </div>

                    {/* 5-Step Visual Timeline */}
                    <div className="mt-5 grid grid-cols-5 gap-2">
                      {steps.map((step, idx) => {
                        const isDone = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={step.id} className="relative">
                            <div
                              className={`h-1.5 w-full rounded-full transition-all ${
                                isDone
                                  ? step.id === "out_for_delivery"
                                    ? "bg-emerald-500"
                                    : "bg-indigo-600"
                                  : "bg-slate-100"
                              }`}
                            />
                            <div className="mt-2 flex items-center gap-1.5 text-left">
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                                  isDone
                                    ? step.id === "out_for_delivery"
                                      ? "bg-emerald-600 text-white"
                                      : "bg-indigo-600 text-white"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {isDone ? "✓" : idx + 1}
                              </span>
                              <span
                                className={`text-[10px] sm:text-[11px] font-semibold ${
                                  isCurrent
                                    ? "text-indigo-600 font-bold"
                                    : isDone
                                    ? "text-slate-900"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Cancelled Banner */
                  <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/70 px-6 py-3 text-xs text-rose-800">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-rose-600" />
                      <span>
                        <strong>Order Cancelled</strong>: {order.cancellationReason || "Cancelled by customer"} (
                        {formatDateTime(order.cancelledAt || order.updatedAt)})
                      </span>
                    </div>
                    <span className="font-semibold text-rose-700">Stock Restored</span>
                  </div>
                )}

                {/* 4. Order Items List */}
                <div className="p-6">
                  <div className="divide-y divide-slate-100">
                    {order.orderItems?.map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image || "https://placehold.co/100x100?text=Product"}
                            alt={item.title}
                            className="h-16 w-16 rounded-2xl border border-slate-100 object-cover"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="mt-0.5 text-xs text-slate-400">
                              Quantity: <strong className="text-slate-700">{item.quantity}</strong> × ₹{item.price?.toLocaleString("en-IN")}
                            </p>
                            {item.sku && (
                              <span className="font-mono text-[10px] text-slate-400">
                                SKU: {item.sku}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-right font-bold text-slate-900 text-sm">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 5. Special Delivery Instructions Note (if added) */}
                  {order.deliveryPreferences?.deliveryInstructions && (
                    <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50/70 border border-amber-200/60 p-3.5 text-xs text-amber-900">
                      <MessageSquare className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Customer Delivery Note:</strong>{" "}
                        <span>"{order.deliveryPreferences.deliveryInstructions}"</span>
                      </div>
                    </div>
                  )}

                  {/* 6. Action Toolbar & Delivery / Price Accordion */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    {/* Reorder / Buy Again Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={reorderingId === order._id}
                        onClick={() => handleReorder(order)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                      >
                        {reorderingId === order._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        <span>Buy Again</span>
                      </button>

                      {isCancellable && (
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(order._id)}
                          className="rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>

                    {/* Expand Breakdown Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleOrderExpand(order._id)}
                      className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      <span>{isExpanded ? "Hide Details" : "View Breakdown"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Pricing & Address Section */}
                  {isExpanded && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-xs animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Shipping Address Summary */}
                        <div>
                          <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                            Shipping Address
                          </p>
                          <p className="mt-1.5 font-semibold text-slate-800">
                            {order.shippingAddress?.fullName}
                          </p>
                          <p className="text-slate-600 mt-0.5">
                            {order.shippingAddress?.street}, {order.shippingAddress?.city}
                          </p>
                          <p className="text-slate-600">
                            {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                          </p>
                          <p className="text-slate-600 mt-1">Phone: {order.shippingAddress?.phone}</p>
                        </div>

                        {/* Price Calculations */}
                        <div className="space-y-1.5 border-t border-slate-200/60 pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:border-slate-200 sm:pl-6">
                          <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                            Payment Summary
                          </p>
                          <div className="flex justify-between text-slate-600">
                            <span>Items Subtotal</span>
                            <span>₹{(order.pricing?.itemsPrice || 0).toLocaleString("en-IN")}</span>
                          </div>
                          {order.pricing?.discountPrice > 0 && (
                            <div className="flex justify-between font-semibold text-emerald-600">
                              <span>Discount Savings</span>
                              <span>-₹{order.pricing.discountPrice.toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-600">
                            <span>GST (18%)</span>
                            <span>₹{(order.pricing?.taxPrice || 0).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Shipping</span>
                            <span>
                              {order.pricing?.shippingPrice === 0
                                ? "FREE"
                                : `₹${order.pricing?.shippingPrice}`}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-900 text-sm">
                            <span>Total Paid</span>
                            <span>₹{(order.pricing?.totalAmount || 0).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELIVERY SLOT & INSTRUCTIONS SCHEDULING MODAL */}
      {scheduleModalOpen && schedulingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Delivery Scheduling</h3>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="text-sm font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {scheduleSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{scheduleSuccess}</span>
              </div>
            )}

            {scheduleError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{scheduleError}</span>
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="mt-5 space-y-4">
              {/* 1. Preferred Delivery Date */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Delivery Day
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { id: "today", label: "Today" },
                    { id: "tomorrow", label: "Tomorrow" },
                    { id: "day_after", label: "In 2 Days" },
                  ].map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setSelectedDateOption(d.id)}
                      className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                        selectedDateOption === d.id
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Preferred Delivery Time Slot */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Preferred Time Slot
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "morning", label: "Morning", sub: "8 AM - 12 PM", icon: Sunrise },
                    { id: "afternoon", label: "Afternoon", sub: "12 PM - 4 PM", icon: Sun },
                    { id: "evening", label: "Evening", sub: "4 PM - 8 PM", icon: Sunset },
                    { id: "anytime", label: "Anytime", sub: "Standard Delivery", icon: Zap },
                  ].map((slot) => {
                    const Icon = slot.icon;
                    const isSelected = selectedSlot === slot.id;
                    return (
                      <button
                        type="button"
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-100"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                            isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{slot.label}</p>
                          <p className="text-[10px] text-slate-400">{slot.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Quick Instruction Tags */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quick Delivery Instructions for Rider
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    "Leave with security / doorstep",
                    "Call before arriving",
                    "Ring doorbell twice",
                    "Beware of pet",
                    "Do not ring bell (Baby sleeping)",
                  ].map((instruction) => (
                    <button
                      type="button"
                      key={instruction}
                      onClick={() => setDeliveryInstructions(instruction)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition"
                    >
                      + {instruction}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Custom Instruction Textarea */}
              <div>
                <label className="text-xs font-bold text-slate-700">Custom Note to Rider</label>
                <textarea
                  rows="2"
                  placeholder="e.g., Gate code is #402, please leave near plant..."
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-100"
                >
                  {isSubmittingSchedule ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>Save Delivery Preferences</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceModalOpen && activeInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Tax Invoice</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 text-xs text-slate-700 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xl font-black text-indigo-600">
                    <ShoppingBag className="h-6 w-6" />
                    <span>Shopera</span>
                  </div>
                  <p className="text-slate-400 mt-1">Next-Gen E-Commerce Platform</p>
                  <p className="text-slate-400">GSTIN: 29AABCS1429B1Z8</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">INVOICE</p>
                  <p className="font-mono text-slate-500">#{activeInvoiceOrder._id.toUpperCase()}</p>
                  <p className="text-slate-500 mt-1">{formatDateTime(activeInvoiceOrder.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-6">
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">BILLED / SHIPPED TO</p>
                  <p className="font-bold text-slate-900 mt-1">{activeInvoiceOrder.shippingAddress?.fullName}</p>
                  <p className="text-slate-600">{activeInvoiceOrder.shippingAddress?.street}</p>
                  <p className="text-slate-600">{activeInvoiceOrder.shippingAddress?.city}, {activeInvoiceOrder.shippingAddress?.state} - {activeInvoiceOrder.shippingAddress?.postalCode}</p>
                  <p className="text-slate-600">Phone: {activeInvoiceOrder.shippingAddress?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">PAYMENT INFORMATION</p>
                  <p className="font-semibold text-slate-800 mt-1 uppercase">Method: {activeInvoiceOrder.paymentInfo?.method}</p>
                  <p className="text-slate-600">Status: <strong className="text-emerald-600 uppercase">{activeInvoiceOrder.paymentInfo?.status}</strong></p>
                  {activeInvoiceOrder.paymentInfo?.transactionId && (
                    <p className="font-mono text-[10px] text-slate-500 mt-1">Txn: {activeInvoiceOrder.paymentInfo.transactionId}</p>
                  )}
                </div>
              </div>

              <div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                      <th className="pb-2">Item Description</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Unit Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeInvoiceOrder.orderItems?.map((item) => (
                      <tr key={item._id} className="py-2">
                        <td className="py-2.5 font-medium text-slate-900">{item.title}</td>
                        <td className="py-2.5 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-2.5 text-right text-slate-600">₹{item.price?.toLocaleString("en-IN")}</td>
                        <td className="py-2.5 text-right font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{(activeInvoiceOrder.pricing?.itemsPrice || 0).toLocaleString("en-IN")}</span>
                </div>
                {activeInvoiceOrder.pricing?.discountPrice > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-600">
                    <span>Discount</span>
                    <span>-₹{activeInvoiceOrder.pricing.discountPrice.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST (18% Included)</span>
                  <span>₹{(activeInvoiceOrder.pricing?.taxPrice || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{activeInvoiceOrder.pricing?.shippingPrice === 0 ? "FREE" : `₹${activeInvoiceOrder.pricing?.shippingPrice}`}</span>
                </div>
                <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-black text-slate-900">
                  <span>Total Amount Paid</span>
                  <span>₹{(activeInvoiceOrder.pricing?.totalAmount || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <h3 className="text-lg font-bold text-slate-900">Cancel Order</h3>
            <p className="mt-1 text-xs text-slate-500">
              Are you sure you want to cancel this order? Stock will be restored to inventory immediately.
            </p>

            {cancelError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <form onSubmit={handleCancelOrderSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Reason for Cancellation</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g., Ordered by mistake, found a better price, changed my mind..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCancel}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {isSubmittingCancel ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>Confirm Cancellation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
