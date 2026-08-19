// Admin Dashboard (src/pages/AdminDashboard.jsx) featuring real-time overview metrics, an interactive Product Management table with a
//  Create/Edit Product Modal (including variant toggling & Cloudinary image fields), Stock Depletion Alerts, 
// and an Order Fulfillment Pipeline with live status controls.

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  Clock,
  X,
  Loader2,
  Search,
  ExternalLink,
} from "lucide-react";
import api from "../api/axiosInstance";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "products" | "orders" | "inventory"
  
  // Modal & Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  const initialProductState = {
    title: "",
    description: "",
    brand: "",
    category: "",
    basePrice: "",
    baseDiscountPrice: "",
    stock: "",
    hasVariants: false,
    variants: [],
    tags: "",
    imageUrl: "",
    isPublished: true,
    featured: false,
  };

  const [formData, setFormData] = useState(initialProductState);

  // 1. Fetch Products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await api.get("/products?limit=100");
      return res.data.data.products || [];
    },
  });

  // 2. Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data || [];
    },
  });

  // 3. Fetch Orders (Simulated fetch / Dedicated Admin Orders API)
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data.data || [];
    },
  });

  // Product Mutations
  const saveProductMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingProduct) {
        return await api.put(`/products/${editingProduct._id}`, payload);
      }
      return await api.post("/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      closeProductModal();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
    },
  });

  // Order Status Mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      return await api.put(`/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
    },
  });

  // Modal Handlers
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(initialProductState);
    setIsProductModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      description: product.description || "",
      brand: product.brand || "",
      category: product.category?._id || product.category || "",
      basePrice: product.basePrice || "",
      baseDiscountPrice: product.baseDiscountPrice || "",
      stock: product.stock || 0,
      hasVariants: product.hasVariants || false,
      variants: product.variants || [],
      tags: product.tags ? product.tags.join(", ") : "",
      imageUrl: product.images?.[0]?.url || "",
      isPublished: product.isPublished ?? true,
      featured: product.featured ?? false,
    });
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setFormData(initialProductState);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      basePrice: Number(formData.basePrice),
      baseDiscountPrice: formData.baseDiscountPrice ? Number(formData.baseDiscountPrice) : undefined,
      stock: Number(formData.stock),
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
      images: formData.imageUrl ? [{ url: formData.imageUrl, publicId: "manual_upload", isPrimary: true }] : [],
    };
    saveProductMutation.mutate(payload);
  };

  // Metrics Calculations
  const products = productsData || [];
  const orders = ordersData || [];
  const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.totalAmount || 0), 0);
  const lowStockThreshold = 5;
  const lowStockItems = products.filter((p) => p.stock <= lowStockThreshold);

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "all") return true;
    return o.orderStatus === orderFilter;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Admin Management Portal
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Control center for inventory, order tracking, and sales analytics
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-6 flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: "overview", label: "Overview & Analytics", icon: TrendingUp },
          { id: "products", label: `Products (${products.length})`, icon: Package },
          { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
          {
            id: "inventory",
            label: `Low Stock Alerts (${lowStockItems.length})`,
            icon: AlertTriangle,
            alert: lowStockItems.length > 0,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 font-bold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className={`h-4 w-4 ${tab.alert && !isActive ? "text-amber-500" : ""}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="mt-8 space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </p>
              <span className="mt-1 block text-[11px] text-emerald-600 font-semibold">
                Processed across {orders.length} orders
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <ShoppingBag className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">{orders.length}</p>
              <span className="mt-1 block text-[11px] text-indigo-600 font-semibold">
                {orders.filter((o) => o.orderStatus === "delivered").length} delivered successfully
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Live Catalog</span>
                <Package className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900">{products.length}</p>
              <span className="mt-1 block text-[11px] text-slate-500">
                {products.filter((p) => p.isPublished).length} currently active in storefront
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Stock Alerts</span>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-3 text-2xl font-black text-amber-600">{lowStockItems.length}</p>
              <span className="mt-1 block text-[11px] text-amber-700 font-semibold">
                SKUs requiring immediate restocking
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT */}
      {activeTab === "products" && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const primaryImg = p.images?.[0]?.url || "https://placehold.co/80x80";
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/50">
                        <td className="flex items-center gap-3 px-6 py-4">
                          <img
                            src={primaryImg}
                            alt=""
                            className="h-10 w-10 rounded-lg border border-slate-100 object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                            <p className="text-[10px] text-slate-400 uppercase">{p.brand}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{p.category?.name || "General"}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{p.basePrice?.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              p.stock <= lowStockThreshold
                                ? "bg-rose-50 text-rose-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              p.isPublished
                                ? "bg-indigo-50 text-indigo-600"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {p.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Delete this product permanently?")) {
                                  deleteProductMutation.mutate(p._id);
                                }
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER FULFILLMENT PIPELINE */}
      {activeTab === "orders" && (
        <div className="mt-8 space-y-4">
          <div className="flex gap-2">
            {["all", "placed", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                    orderFilter === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5">Fulfillment Pipeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No orders currently match this status filter
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        #{order._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {order.shippingAddress?.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}
                        </p>
                      </td>
                      <td className="px-6 py-4">{order.orderItems?.length} items</td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        ₹{order.pricing?.totalAmount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            order.paymentInfo?.status === "paid"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {order.paymentInfo?.status} ({order.paymentInfo?.method})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            updateOrderStatusMutation.mutate({
                              orderId: order._id,
                              status: e.target.value,
                            })
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LOW STOCK INVENTORY ALERTS */}
      {activeTab === "inventory" && (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs font-semibold text-amber-800">
            The items below have 5 or fewer units remaining and risk stockout.
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lowStockItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.images?.[0]?.url || "https://placehold.co/80x80"}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="line-clamp-1 text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[10px] text-slate-400">SKU: {item.slug}</p>
                    <span className="text-xs font-bold text-rose-600">
                      Only {item.stock} left in stock
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(item)}
                  className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? "Edit Product" : "Create New Product"}
              </h3>
              <button
                onClick={closeProductModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-600"
                >
                  <option value="">Select Category</option>
                  {categoriesData?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.baseDiscountPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, baseDiscountPrice: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-slate-700">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700">
                  Image URL (CDN / Cloudinary Link)
                </label>
                <input
                  type="url"
                  placeholder="https://res.cloudinary.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-slate-700">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex cursor-pointer items-center gap-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Published on Storefront</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Featured Collection</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveProductMutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saveProductMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingProduct ? "Update Product" : "Create Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}