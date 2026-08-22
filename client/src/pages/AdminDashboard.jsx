import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Truck,
  Clock,
  X,
  Loader2,
  Search,
  ExternalLink,
  Users,
  Tag,
  Shield,
  ShieldCheck,
  DollarSign,
  Layers,
  ArrowUpRight,
  Sparkles,
  Phone,
  KeyRound,
  Navigation,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Gift,
  Zap,
  BarChart3,
  Calendar,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import api from "../api/axiosInstance";
import AdminProductsTab from "../components/admin/AdminProductsTab";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { tab } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active Tab State (derived from URL pathname, path param, or search query)
  const activeTab = useMemo(() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "admin" && pathParts[1]) {
      const sub = pathParts[1];
      if (sub === "dashboard") return "overview";
      return sub;
    }

    if (tab) {
      if (tab === "dashboard") return "overview";
      return tab;
    }
    const queryTab = searchParams.get("tab");
    if (queryTab) return queryTab;
    return "overview";
  }, [tab, location.pathname, searchParams]);

  const handleTabChange = (tabId) => {
    if (tabId === "overview") {
      navigate("/admin/dashboard");
    } else {
      navigate(`/admin/${tabId}`);
    }
  };

  // Filter & Search States
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });

  // Rider Dispatch Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [dispatchData, setDispatchData] = useState({
    name: "Vikram Sen",
    phone: "+91 98765 43210",
    vehicleNumber: "MH-02-DN-7890",
    carrier: "BlueDart Express",
    trackingNumber: "BD-9821043",
  });

  // Packing Slip / Order Detail Drawer State
  const [packingSlipOrder, setPackingSlipOrder] = useState(null);

  // Coupon Generator State
  const [coupons, setCoupons] = useState([
    {
      code: "SHOPERA15",
      discountType: "percentage",
      value: 15,
      minOrder: 1000,
      active: true,
      uses: 142,
    },
    {
      code: "WELCOME500",
      discountType: "flat",
      value: 500,
      minOrder: 2500,
      active: true,
      uses: 89,
    },
    {
      code: "FLASH50",
      discountType: "percentage",
      value: 50,
      minOrder: 5000,
      active: false,
      uses: 210,
    },
    {
      code: "FESTIVE20",
      discountType: "percentage",
      value: 20,
      minOrder: 3000,
      active: true,
      uses: 64,
    },
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponVal, setNewCouponVal] = useState("");
  const [newCouponType, setNewCouponType] = useState("percentage");
  const [newCouponMin, setNewCouponMin] = useState("1000");
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  // --- API QUERIES ---

  // 1. Fetch Products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await api.get("/products?limit=100");
      return res.data.data?.products || [];
    },
  });

  // 2. Fetch Categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data || [];
    },
  });

  // 3. Fetch Orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data.data || [];
    },
  });

  // 4. Fetch Users (CRM)
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/auth/admin/users");
      return res.data.data || [];
    },
  });

  // --- MUTATIONS ---

  // Quick Stock Adjust Mutation
  const adjustStockMutation = useMutation({
    mutationFn: async ({ productId, newStock }) => {
      return await api.put(`/products/${productId}`, { stock: Math.max(0, newStock) });
    },
    onSuccess: () => queryClient.invalidateQueries(["admin-products"]),
  });

  // Update Order Status Mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, trackingInfo, deliveryAgent }) => {
      return await api.put(`/orders/${orderId}/status`, {
        status,
        trackingInfo,
        deliveryAgent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      setDispatchModalOpen(false);
    },
  });

  // Create or Update Category Mutation
  const saveCategoryMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingCategory) {
        return await api.put(`/categories/${editingCategory._id}`, payload);
      }
      return await api.post("/categories", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryFormData({ name: "", description: "" });
    },
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["admin-categories"]),
  });

  // Update User Role Mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      return await api.patch(`/auth/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => queryClient.invalidateQueries(["admin-users"]),
  });

  // --- DERIVED METRICS ---
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.paymentInfo?.status === "paid" || o.orderStatus === "delivered")
      .reduce((acc, o) => acc + (o.pricing?.totalAmount || 0), 0);
  }, [orders]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.basePrice || 0) * (p.stock || 0), 0);
  }, [products]);

  const lowStockItems = useMemo(() => {
    return products.filter((p) => (p.stock || 0) < 15 && (p.stock || 0) > 0);
  }, [products]);

  const outOfStockItems = useMemo(() => {
    return products.filter((p) => (p.stock || 0) === 0);
  }, [products]);

  const avgOrderValue = useMemo(() => {
    if (orders.length === 0) return 0;
    return Math.round(totalRevenue / (orders.length || 1));
  }, [orders, totalRevenue]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = orderFilter === "all" || o.orderStatus === orderFilter;
      const matchSearch =
        o._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shippingAddress?.city?.toLowerCase().includes(orderSearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, orderFilter, orderSearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      return (
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.role?.toLowerCase().includes(userSearch.toLowerCase())
      );
    });
  }, [users, userSearch]);

  // Handlers
  const getNextStatusConfig = (status) => {
    switch (status) {
      case "placed":
        return {
          nextStatus: "confirmed",
          label: "Mark Confirmed",
          shortLabel: "Confirm",
          icon: CheckCircle2,
          buttonClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-xs",
        };
      case "confirmed":
      case "processing":
        return {
          nextStatus: "shipped",
          label: "Mark Shipped",
          shortLabel: "Ship",
          icon: Truck,
          buttonClass: "bg-purple-600 hover:bg-purple-700 text-white shadow-xs",
        };
      case "shipped":
        return {
          nextStatus: "out_for_delivery",
          label: "Out for Delivery",
          shortLabel: "Dispatch",
          icon: Navigation,
          buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs",
        };
      case "out_for_delivery":
        return {
          nextStatus: "delivered",
          label: "Mark Delivered",
          shortLabel: "Deliver",
          icon: Check,
          buttonClass: "bg-teal-600 hover:bg-teal-700 text-white shadow-xs",
        };
      default:
        return null;
    }
  };

  const handleAdvanceStatus = (order) => {
    const config = getNextStatusConfig(order.orderStatus);
    if (!config) return;

    if (config.nextStatus === "out_for_delivery") {
      updateOrderStatusMutation.mutate({
        orderId: order._id,
        status: "out_for_delivery",
      });
    } else {
      updateOrderStatusMutation.mutate({
        orderId: order._id,
        status: config.nextStatus,
      });
    }
  };

  const handleOpenDispatchModal = (order) => {
    setDispatchOrder(order);
    setDispatchData({
      name: order.deliveryAgent?.name || "Vikram Sen",
      phone: order.deliveryAgent?.phone || "+91 98765 43210",
      vehicleNumber: order.deliveryAgent?.vehicleNumber || "MH-02-DN-7890",
      carrier: order.trackingInfo?.carrier || "BlueDart Express",
      trackingNumber: order.trackingInfo?.trackingNumber || "BD-" + order._id.slice(-6).toUpperCase(),
    });
    setDispatchModalOpen(true);
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (!dispatchOrder) return;

    updateOrderStatusMutation.mutate({
      orderId: dispatchOrder._id,
      status: "out_for_delivery",
      trackingInfo: {
        carrier: dispatchData.carrier,
        trackingNumber: dispatchData.trackingNumber,
      },
      deliveryAgent: {
        name: dispatchData.name,
        phone: dispatchData.phone,
        vehicleNumber: dispatchData.vehicleNumber,
        deliveryOtp:
          dispatchOrder.deliveryAgent?.deliveryOtp ||
          Math.floor(1000 + Math.random() * 9000).toString(),
      },
    });
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponVal) return;

    const newC = {
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      value: Number(newCouponVal),
      minOrder: Number(newCouponMin) || 0,
      active: true,
      uses: 0,
    };

    setCoupons([newC, ...coupons]);
    setNewCouponCode("");
    setNewCouponVal("");
  };

  const handleToggleCoupon = (code) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
  };

  const handleDeleteCoupon = (code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      setCoupons((prev) => prev.filter((c) => c.code !== code));
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({ name: "", description: "" });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({ name: cat.name || "", description: cat.description || "" });
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* 1. TOP ADMIN COMMAND BAR */}
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-600/20 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
                  Shopera Admin Console
                </h1>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Enterprise E-Commerce Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-indigo-600 hover:bg-white hover:text-indigo-600 transition shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Storefront</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>

            <button
              onClick={() => handleTabChange("products")}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Catalog Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 7-PORTAL NAVIGATION TABS */}
      <div className="border-b border-slate-200/80 bg-white px-4 dark:border-slate-800 dark:bg-slate-950/50 sm:px-8">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto py-2 no-scrollbar">
          {[
            { id: "overview", label: "Analytics & Overview", icon: BarChart3 },
            { id: "products", label: `Catalog (${products.length})`, icon: Package },
            { id: "orders", label: `Orders (${orders.length})`, icon: Truck },
            { id: "categories", label: `Categories (${categories.length})`, icon: Layers },
            { id: "crm", label: `Customers (${users.length})`, icon: Users },
            { id: "discounts", label: `Coupons (${coupons.length})`, icon: Gift },
            {
              id: "inventory",
              label: `Stock Radar (${lowStockItems.length + outOfStockItems.length})`,
              icon: AlertTriangle,
              alert: lowStockItems.length + outOfStockItems.length > 0,
            },
          ].map((tabItem) => {
            const Icon = tabItem.icon;
            const isActive = activeTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                onClick={() => handleTabChange(tabItem.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${tabItem.alert && !isActive ? "text-amber-500 animate-bounce" : ""}`} />
                <span>{tabItem.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT BODY */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top 4 KPI Widgets */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div
                onClick={() => handleTabChange("orders")}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs relative overflow-hidden dark:border-slate-800 dark:bg-slate-950/60 cursor-pointer hover:border-emerald-300 transition"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Gross Sales (GMV)</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </p>
                <span className="mt-2 block text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span>Across {orders.length} total orders</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>

              <div
                onClick={() => handleTabChange("orders")}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs relative overflow-hidden dark:border-slate-800 dark:bg-slate-950/60 cursor-pointer hover:border-indigo-300 transition"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{orders.length}</p>
                <span className="mt-2 block text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                  <span>{orders.filter((o) => o.orderStatus === "delivered").length} delivered</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>

              <div
                onClick={() => handleTabChange("orders")}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs relative overflow-hidden dark:border-slate-800 dark:bg-slate-950/60 cursor-pointer hover:border-purple-300 transition"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Average Ticket (AOV)</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                  ₹{avgOrderValue.toLocaleString("en-IN")}
                </p>
                <span className="mt-2 block text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                  <span>Per customer transaction</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>

              <div
                onClick={() => handleTabChange("inventory")}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs relative overflow-hidden dark:border-slate-800 dark:bg-slate-950/60 cursor-pointer hover:border-amber-300 transition"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Warehouse Stock Value</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
                  ₹{totalInventoryValue.toLocaleString("en-IN")}
                </p>
                <span className="mt-2 block text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                  <span>{products.reduce((acc, p) => acc + (p.stock || 0), 0)} total units in stock</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>

            {/* Quick Operational Launchpad */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Quick Operational Hub
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct access to core administrative workflows
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <button
                  onClick={() => handleTabChange("products")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-indigo-50/60 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition group dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-indigo-950/30"
                >
                  <Package className="h-6 w-6 text-indigo-600 mb-2 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold text-center">Manage Catalog</span>
                  <span className="text-[10px] text-slate-400">{products.length} products</span>
                </button>

                <button
                  onClick={() => handleTabChange("orders")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50/60 hover:border-emerald-200 text-slate-700 hover:text-emerald-600 transition group dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-emerald-950/30"
                >
                  <Truck className="h-6 w-6 text-emerald-600 mb-2 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold text-center">Orders & Dispatch</span>
                  <span className="text-[10px] text-slate-400">{orders.length} orders</span>
                </button>

                <button
                  onClick={() => handleTabChange("categories")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-purple-50/60 hover:border-purple-200 text-slate-700 hover:text-purple-600 transition group dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-purple-950/30"
                >
                  <Layers className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold text-center">Taxonomy</span>
                  <span className="text-[10px] text-slate-400">{categories.length} categories</span>
                </button>

                <button
                  onClick={() => handleTabChange("crm")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-200 text-slate-700 hover:text-blue-600 transition group dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-blue-950/30"
                >
                  <Users className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold text-center">Customers & CRM</span>
                  <span className="text-[10px] text-slate-400">{users.length} users</span>
                </button>

                <button
                  onClick={() => handleTabChange("discounts")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-amber-50/60 hover:border-amber-200 text-slate-700 hover:text-amber-600 transition group dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-amber-950/30"
                >
                  <Gift className="h-6 w-6 text-amber-600 mb-2 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold text-center">Promo Vouchers</span>
                  <span className="text-[10px] text-slate-400">{coupons.length} coupons</span>
                </button>

                <button
                  onClick={() => handleTabChange("inventory")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-rose-50/60 hover:border-rose-200 text-slate-700 hover:text-rose-600 transition group dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-rose-950/30"
                >
                  <AlertTriangle className="h-6 w-6 text-rose-600 mb-2 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold text-center">Stock Radar</span>
                  <span className="text-[10px] text-slate-400">
                    {lowStockItems.length + outOfStockItems.length} alerts
                  </span>
                </button>
              </div>
            </div>

            {/* Charts & Category Breakdowns */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Category Breakdown Bar Chart */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950/60 lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Category Distribution & Catalog Share
                  </h3>
                  <button
                    onClick={() => handleTabChange("categories")}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View All Categories →
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Live distribution of products across departments
                </p>

                <div className="space-y-4">
                  {categories.map((cat) => {
                    const catProducts = products.filter((p) =>
                      (typeof p.category === "object" ? p.category?._id : p.category) === cat._id
                    );
                    const percentage =
                      products.length > 0 ? Math.round((catProducts.length / products.length) * 100) : 0;

                    return (
                      <div
                        key={cat._id}
                        onClick={() => handleTabChange("products")}
                        className="cursor-pointer group"
                      >
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition">
                            {cat.name}
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {catProducts.length} items ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Fulfillment Status
                  </h3>
                  <button
                    onClick={() => handleTabChange("orders")}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    All Orders →
                  </button>
                </div>
                <div className="space-y-2.5 text-xs">
                  {[
                    {
                      label: "Out for Delivery",
                      status: "out_for_delivery",
                      color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
                    },
                    {
                      label: "Shipped & In Transit",
                      status: "shipped",
                      color: "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20",
                    },
                    {
                      label: "Placed & Processing",
                      status: "placed",
                      color: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
                    },
                    {
                      label: "Delivered",
                      status: "delivered",
                      color: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
                    },
                    {
                      label: "Cancelled",
                      status: "cancelled",
                      color: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20",
                    },
                  ].map((s) => {
                    const count = orders.filter((o) =>
                      s.status === "placed"
                        ? ["placed", "confirmed", "processing"].includes(o.orderStatus)
                        : o.orderStatus === s.status
                    ).length;

                    return (
                      <div
                        key={s.status}
                        onClick={() => {
                          setOrderFilter(s.status);
                          handleTabChange("orders");
                        }}
                        className={`flex items-center justify-between p-3 rounded-2xl border ${s.color} cursor-pointer hover:opacity-90 transition`}
                      >
                        <span className="font-bold">{s.label}</span>
                        <span className="font-black text-sm">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG */}
        {activeTab === "products" && (
          <div className="animate-in fade-in duration-200">
            <AdminProductsTab
              products={products}
              categories={categories}
              isLoading={productsLoading}
            />
          </div>
        )}

        {/* TAB 3: ORDER FULFILLMENT & RIDER PIPELINE */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter Toolbar */}
            <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-950/60 md:flex-row md:items-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by Order ID, customer, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "placed", label: "Placed" },
                  { id: "confirmed", label: "Confirmed" },
                  { id: "processing", label: "Processing" },
                  { id: "shipped", label: "Shipped" },
                  { id: "out_for_delivery", label: "⚡ Out for Delivery" },
                  { id: "delivered", label: "Delivered" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setOrderFilter(s.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      orderFilter === s.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-950/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Order ID & Date</th>
                      <th className="px-6 py-4">Customer & City</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Fulfillment Status</th>
                      <th className="px-6 py-4">Rider / Delivery OTP</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No orders matching current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                          <td className="px-6 py-4">
                            <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              #{o._id.slice(-8).toUpperCase()}
                            </p>
                            <span className="text-[10px] text-slate-500">
                              {new Date(o.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {o.shippingAddress?.fullName}
                            </p>
                            <span className="text-[10px] text-slate-500">
                              {o.shippingAddress?.city}, {o.shippingAddress?.state}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-black text-slate-900 dark:text-white text-xs">
                              ₹{(o.pricing?.totalAmount || 0).toLocaleString("en-IN")}
                            </p>
                            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                              {o.paymentInfo?.method} ({o.paymentInfo?.status})
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2 min-w-[170px]">
                              <select
                                value={o.orderStatus}
                                onChange={(e) => {
                                  const newStat = e.target.value;
                                  if (newStat === "out_for_delivery") {
                                    handleOpenDispatchModal(o);
                                  } else {
                                    updateOrderStatusMutation.mutate({
                                      orderId: o._id,
                                      status: newStat,
                                    });
                                  }
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                              >
                                <option value="placed">Placed</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">⚡ Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              {/* Order Status Progression Button */}
                              {(() => {
                                const nextConfig = getNextStatusConfig(o.orderStatus);
                                const isUpdatingThisOrder =
                                  updateOrderStatusMutation.isLoading &&
                                  updateOrderStatusMutation.variables?.orderId === o._id;

                                if (nextConfig) {
                                  const IconComponent = nextConfig.icon;
                                  return (
                                    <button
                                      type="button"
                                      disabled={isUpdatingThisOrder}
                                      onClick={() => handleAdvanceStatus(o)}
                                      className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${nextConfig.buttonClass} disabled:opacity-60`}
                                      title={`Advance status to ${nextConfig.nextStatus}`}
                                    >
                                      {isUpdatingThisOrder ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <IconComponent className="h-3.5 w-3.5" />
                                      )}
                                      <span>{nextConfig.label}</span>
                                    </button>
                                  );
                                } else if (o.orderStatus === "delivered") {
                                  return (
                                    <span className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>Delivered</span>
                                    </span>
                                  );
                                } else if (o.orderStatus === "cancelled") {
                                  return (
                                    <span className="inline-flex items-center justify-center gap-1 rounded-xl bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                                      <X className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                      <span>Cancelled</span>
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {o.orderStatus === "out_for_delivery" ? (
                              <div>
                                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                  {o.deliveryAgent?.name || "Rider Assigned"}
                                </p>
                                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                                  <KeyRound className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>OTP: {o.deliveryAgent?.deliveryOtp || "7649"}</span>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenDispatchModal(o)}
                                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                <Navigation className="h-3 w-3" />
                                <span>Assign Rider</span>
                              </button>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setPackingSlipOrder(o)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                            >
                              Manifest / Slip
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORIES MANAGEMENT */}
        {activeTab === "categories" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Store Taxonomy & Departments
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage catalog categories and departments
                </p>
              </div>
              <button
                onClick={handleOpenCreateCategory}
                className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const prodCount = products.filter((p) =>
                  (typeof p.category === "object" ? p.category?._id : p.category) === cat._id
                ).length;

                return (
                  <div
                    key={cat._id}
                    className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs relative overflow-hidden dark:border-slate-800 dark:bg-slate-950/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-600/10 dark:text-indigo-400 dark:border-indigo-500/20">
                            <Layers className="h-5 w-5" />
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cat.name}</h4>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                          {prodCount} items
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {cat.description || "No description provided."}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400 mt-1">Slug: /{cat.slug}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleTabChange("products")}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Browse {prodCount} Items →
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          title="Edit Category"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete category "${cat.name}"?`)) {
                              deleteCategoryMutation.mutate(cat._id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOMER CRM */}
        {activeTab === "crm" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-950/60 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Registered Customer Directory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  View user history and manage staff permissions
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search customer name, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-950/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Member Since</th>
                      <th className="px-6 py-4">System Role</th>
                      <th className="px-6 py-4 text-right">Role Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 font-black text-white text-xs">
                                {u.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase() || "U"}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {u.email}
                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                u.role === "admin"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                const newRole = u.role === "admin" ? "customer" : "admin";
                                if (window.confirm(`Change role of ${u.name} to "${newRole}"?`)) {
                                  updateUserRoleMutation.mutate({ userId: u._id, role: newRole });
                                }
                              }}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-indigo-600 hover:bg-white hover:text-indigo-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                            >
                              {u.role === "admin" ? "Demote to Customer" : "Promote to Admin"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DISCOUNTS & COUPON ENGINE */}
        {activeTab === "discounts" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Create Coupon Form */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950/60 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Create Promotional Voucher
              </h3>
              <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., SUMMER25"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 uppercase outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Discount Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Discount Value</label>
                  <input
                    type="number"
                    required
                    placeholder="15 or 500"
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Min Spend (₹)</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-xs"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>

            {/* Coupons List */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {coupons.map((c) => (
                <div
                  key={c.code}
                  className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between relative overflow-hidden dark:border-slate-800 dark:bg-slate-950/60 space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-black tracking-wider text-amber-600 dark:text-amber-400">
                        {c.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleCoupon(c.code)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition border ${
                          c.active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {c.active ? "Active" : "Disabled"}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {c.discountType === "percentage" ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`} on orders &gt; ₹
                      {c.minOrder}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Redeemed {c.uses} times</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyCode(c.code)}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {copiedCoupon === c.code ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedCoupon === c.code ? "Copied!" : "Copy Code"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete Coupon"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: INVENTORY HEALTH & LOW STOCK MONITOR */}
        {activeTab === "inventory" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 flex items-center justify-between shadow-xs dark:border-amber-500/20 dark:bg-amber-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Inventory Depletion Radar
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Items needing urgent warehouse restocking (&lt; 15 units or Out of Stock)
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-200/80 px-3 py-1 font-mono text-sm font-black text-amber-900 dark:bg-amber-400/20 dark:text-amber-300">
                {lowStockItems.length + outOfStockItems.length} Products Alerted
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...outOfStockItems, ...lowStockItems].map((p) => (
                <div
                  key={p._id}
                  className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 dark:border-slate-800 dark:bg-slate-950/60"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images?.[0]?.url || "https://placehold.co/80x80"}
                      alt={p.title}
                      className="h-14 w-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
                    />
                    <div className="overflow-hidden flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-slate-500">{p.brand}</p>
                      <span
                        className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          p.stock === 0
                            ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30"
                            : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
                        }`}
                      >
                        {p.stock === 0 ? "OUT OF STOCK" : `${p.stock} units remaining`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() =>
                        adjustStockMutation.mutate({ productId: p._id, newStock: (p.stock || 0) + 15 })
                      }
                      className="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition"
                    >
                      +15 Units
                    </button>
                    <button
                      onClick={() =>
                        adjustStockMutation.mutate({ productId: p._id, newStock: (p.stock || 0) + 50 })
                      }
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-white hover:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition"
                    >
                      +50 Units
                    </button>
                    <button
                      onClick={() => handleTabChange("products")}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 transition"
                      title="Manage in Products Tab"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIDER DISPATCH MODAL */}
      {dispatchModalOpen && dispatchOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Dispatch Order & Assign Rider
                </h3>
              </div>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">
                  Order #{dispatchOrder._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-slate-500 mt-0.5">
                  Ship To: {dispatchOrder.shippingAddress?.fullName} ({dispatchOrder.shippingAddress?.city})
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Rider Full Name</label>
                <input
                  type="text"
                  required
                  value={dispatchData.name}
                  onChange={(e) => setDispatchData({ ...dispatchData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Rider Phone</label>
                  <input
                    type="text"
                    required
                    value={dispatchData.phone}
                    onChange={(e) => setDispatchData({ ...dispatchData, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={dispatchData.vehicleNumber}
                    onChange={(e) => setDispatchData({ ...dispatchData, vehicleNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Carrier Partner</label>
                  <input
                    type="text"
                    value={dispatchData.carrier}
                    onChange={(e) => setDispatchData({ ...dispatchData, carrier: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Tracking Code</label>
                  <input
                    type="text"
                    value={dispatchData.trackingNumber}
                    onChange={(e) => setDispatchData({ ...dispatchData, trackingNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDispatchModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateOrderStatusMutation.isLoading}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  {updateOrderStatusMutation.isLoading ? "Dispatching..." : "Dispatch Out for Delivery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PACKING SLIP DRAWER */}
      {packingSlipOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-xs space-y-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Warehouse Packing Slip</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Print Slip
                </button>
                <button
                  onClick={() => setPackingSlipOrder(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">
                  {packingSlipOrder.orderStatus.replace(/_/g, " ")}
                </span>
              </div>
              {(() => {
                const nextConfig = getNextStatusConfig(packingSlipOrder.orderStatus);
                if (!nextConfig) return null;
                const IconComponent = nextConfig.icon;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      handleAdvanceStatus(packingSlipOrder);
                      setPackingSlipOrder({
                        ...packingSlipOrder,
                        orderStatus: nextConfig.nextStatus,
                      });
                    }}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${nextConfig.buttonClass}`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <span>{nextConfig.label}</span>
                  </button>
                );
              })()}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-1 dark:bg-slate-900 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white">
                Ship To: {packingSlipOrder.shippingAddress?.fullName}
              </p>
              <p className="text-slate-500">
                {packingSlipOrder.shippingAddress?.street}, {packingSlipOrder.shippingAddress?.city},{" "}
                {packingSlipOrder.shippingAddress?.state} - {packingSlipOrder.shippingAddress?.postalCode}
              </p>
              <p className="text-slate-500">Phone: {packingSlipOrder.shippingAddress?.phone}</p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
              {packingSlipOrder.orderItems?.map((item) => (
                <div key={item._id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-[10px] text-slate-400">Quantity: {item.quantity} units</p>
                  </div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 dark:text-white text-sm dark:border-slate-800">
              <span>Order Total Payable</span>
              <span>₹{(packingSlipOrder.pricing?.totalAmount || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create Category Department"}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!categoryFormData.name) return;
                saveCategoryMutation.mutate(categoryFormData);
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gaming & VR"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Description</label>
                <textarea
                  rows="2"
                  placeholder="Short description of department..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveCategoryMutation.isLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs"
                >
                  {saveCategoryMutation.isLoading
                    ? "Saving..."
                    : editingCategory
                    ? "Save Changes"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}