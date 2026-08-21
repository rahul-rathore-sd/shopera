import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Search,
  ExternalLink,
  Tag,
  Star,
  Check,
  X,
  Loader2,
  Copy,
  LayoutGrid,
  List,
  Flame,
  Zap,
  Sparkles,
  Award,
  Percent,
  SlidersHorizontal,
  RotateCcw,
  CheckSquare,
  Square,
  Eye,
  AlertTriangle,
  ArrowUpDown,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import api from "../../api/axiosInstance";

export default function AdminProductsTab({ products, categories, isLoading }) {
  const queryClient = useQueryClient();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formError, setFormError] = useState("");

  const initialFormState = {
    title: "",
    description: "",
    brand: "Shopera",
    category: "",
    basePrice: "",
    baseDiscountPrice: "",
    stock: "",
    imageUrl: "",
    tags: "",
    isPublished: true,
    featured: false,
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- MUTATIONS ---

  // 1. Save Product (Create or Update)
  const saveProductMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingProduct) {
        return await api.put(`/products/${editingProduct._id}`, payload);
      }
      return await api.post("/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || "Failed to save product.");
    },
  });

  // 2. Delete Single Product
  const deleteProductMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      setSelectedIds((prev) => prev.filter((i) => i !== deleteProductMutation.variables));
    },
  });

  // 3. Quick Update Single Field (stock, isPublished, featured)
  const quickUpdateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      return await api.put(`/products/${id}`, updates);
    },
    onSuccess: () => queryClient.invalidateQueries(["admin-products"]),
  });

  // 4. Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => api.delete(`/products/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      setSelectedIds([]);
    },
  });

  // 5. Bulk Status Mutation
  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, isPublished }) => {
      await Promise.all(ids.map((id) => api.put(`/products/${id}`, { isPublished })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      setSelectedIds([]);
    },
  });

  // 6. Bulk Stock Mutation
  const bulkStockMutation = useMutation({
    mutationFn: async ({ ids, incrementBy }) => {
      await Promise.all(
        ids.map((id) => {
          const prod = products.find((p) => p._id === id);
          const currentStock = prod?.stock || 0;
          return api.put(`/products/${id}`, { stock: Math.max(0, currentStock + incrementBy) });
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      setSelectedIds([]);
    },
  });

  // --- FILTER & SORT LOGIC ---
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Search
      const s = searchTerm.toLowerCase().trim();
      const matchSearch =
        !s ||
        p.title?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(s));

      // Category
      const catId = typeof p.category === "object" ? p.category?._id : p.category;
      const matchCategory = categoryFilter === "all" || catId === categoryFilter;

      // Stock
      let matchStock = true;
      const stock = p.stock || 0;
      if (stockFilter === "in_stock") matchStock = stock >= 15;
      else if (stockFilter === "low_stock") matchStock = stock > 0 && stock < 15;
      else if (stockFilter === "out_of_stock") matchStock = stock === 0;

      // Status
      let matchStatus = true;
      if (statusFilter === "published") matchStatus = p.isPublished === true;
      else if (statusFilter === "draft") matchStatus = p.isPublished === false;

      // Badges
      let matchBadge = true;
      const tags = (p.tags || []).map((t) => t.toLowerCase());
      if (badgeFilter === "sale") matchBadge = Boolean(p.baseDiscountPrice && p.baseDiscountPrice < p.basePrice);
      else if (badgeFilter === "deals") matchBadge = tags.includes("deals");
      else if (badgeFilter === "bestseller") matchBadge = tags.includes("bestseller") || (p.ratingsAverage >= 4.8);
      else if (badgeFilter === "featured") matchBadge = p.featured === true;

      return matchSearch && matchCategory && matchStock && matchStatus && matchBadge;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "price_asc") return (a.baseDiscountPrice || a.basePrice) - (b.baseDiscountPrice || b.basePrice);
      if (sortBy === "price_desc") return (b.baseDiscountPrice || b.basePrice) - (a.baseDiscountPrice || a.basePrice);
      if (sortBy === "stock_asc") return (a.stock || 0) - (b.stock || 0);
      if (sortBy === "stock_desc") return (b.stock || 0) - (a.stock || 0);
      if (sortBy === "title_asc") return a.title.localeCompare(b.title);
      if (sortBy === "rating_desc") return (b.ratingsAverage || 0) - (a.ratingsAverage || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return result;
  }, [products, searchTerm, categoryFilter, stockFilter, statusFilter, badgeFilter, sortBy]);

  // Derived Summary Counts
  const totalListed = products.length;
  const publishedCount = products.filter((p) => p.isPublished).length;
  const draftCount = totalListed - publishedCount;
  const lowStockCount = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) < 15).length;
  const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;
  const totalValuation = products.reduce((acc, p) => acc + (p.basePrice || 0) * (p.stock || 0), 0);

  // --- MODAL HANDLERS ---
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      category: categories[0]?._id || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      description: product.description || "",
      brand: product.brand || "Shopera",
      category: typeof product.category === "object" ? product.category?._id : product.category,
      basePrice: product.basePrice || "",
      baseDiscountPrice: product.baseDiscountPrice || "",
      stock: product.stock !== undefined ? product.stock : 0,
      imageUrl: product.images?.[0]?.url || "",
      tags: (product.tags || []).join(", "),
      isPublished: product.isPublished ?? true,
      featured: product.featured ?? false,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDuplicate = (product) => {
    setEditingProduct(null);
    setFormData({
      title: `${product.title} (Copy)`,
      description: product.description || "",
      brand: product.brand || "Shopera",
      category: typeof product.category === "object" ? product.category?._id : product.category,
      basePrice: product.basePrice || "",
      baseDiscountPrice: product.baseDiscountPrice || "",
      stock: product.stock || 0,
      imageUrl: product.images?.[0]?.url || "",
      tags: (product.tags || []).join(", "),
      isPublished: false, // Default clone to draft
      featured: false,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.basePrice || !formData.category) {
      setFormError("Title, Category, and Base Price are required.");
      return;
    }

    if (formData.baseDiscountPrice && Number(formData.baseDiscountPrice) >= Number(formData.basePrice)) {
      setFormError("Sale price must be strictly less than the regular base price.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      brand: formData.brand.trim() || "Shopera",
      category: formData.category,
      basePrice: Number(formData.basePrice),
      baseDiscountPrice: formData.baseDiscountPrice ? Number(formData.baseDiscountPrice) : undefined,
      stock: Number(formData.stock) || 0,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      images: formData.imageUrl
        ? [{ url: formData.imageUrl.trim(), publicId: `img-${Date.now()}`, isPrimary: true }]
        : [{ url: "https://placehold.co/600x600?text=Product", publicId: "placeholder", isPrimary: true }],
      isPublished: formData.isPublished,
      featured: formData.featured,
    };

    saveProductMutation.mutate(payload);
  };

  // --- SELECTION HANDLERS ---
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p._id));
    }
  };

  // Tag helper chips
  const commonTags = ["deals", "sale", "bestseller", "featured", "wireless", "gaming", "summer", "basics", "luxury"];
  const handleAppendTag = (tag) => {
    const currentTags = formData.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
      setFormData({ ...formData, tags: currentTags.join(", ") });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Products</span>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{totalListed}</p>
          <span className="text-[10px] text-slate-400">Across {categories.length} categories</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Live on Store</span>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{publishedCount}</p>
          <span className="text-[10px] text-slate-400">Published items</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Drafts / Hidden</span>
          <p className="mt-1 text-2xl font-black text-slate-700 dark:text-slate-300">{draftCount}</p>
          <span className="text-[10px] text-slate-400">Unlisted products</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Low Stock</span>
          <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{lowStockCount}</p>
          <span className="text-[10px] text-slate-400">&lt; 15 units remaining</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Out of Stock</span>
          <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">{outOfStockCount}</p>
          <span className="text-[10px] text-slate-400">0 inventory</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Stock Valuation</span>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white truncate">₹{totalValuation.toLocaleString("en-IN")}</p>
          <span className="text-[10px] text-slate-400">Inventory assets</span>
        </div>
      </div>

      {/* 2. ADVANCED TOOLBAR & MULTI-FACET FILTER CONTROLS */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 space-y-4">
        {/* Top Search & Primary CTA Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, brand, tag, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-950">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            {/* Add Product Button */}
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* 1. Category Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Department
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">All Departments</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Stock Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Stock Level
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">All Inventory</option>
              <option value="in_stock">In Stock (15+)</option>
              <option value="low_stock">Low Stock (&lt; 15)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* 3. Status Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Visibility
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Live</option>
              <option value="draft">Drafts / Hidden</option>
            </select>
          </div>

          {/* 4. Badges Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Deals & Badges
            </label>
            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">All Badges</option>
              <option value="sale">On Sale (Discounted)</option>
              <option value="deals">Hot Deals</option>
              <option value="bestseller">Bestsellers</option>
              <option value="featured">Featured Picks</option>
            </select>
          </div>

          {/* 5. Sort By */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="newest">Newest First</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="stock_desc">Highest Stock</option>
              <option value="stock_asc">Lowest Stock</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. MULTI-SELECTION BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold">Selected Items</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-[11px] text-slate-400 hover:text-white underline ml-2"
            >
              Deselect All
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, isPublished: true })}
              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              Publish Selected
            </button>
            <button
              onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, isPublished: false })}
              className="rounded-xl bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-600 transition"
            >
              Set as Drafts
            </button>
            <button
              onClick={() => bulkStockMutation.mutate({ ids: selectedIds, incrementBy: 10 })}
              className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              +10 Stock to All
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Permanently delete ${selectedIds.length} selected products?`)) {
                  bulkDeleteMutation.mutate(selectedIds);
                }
              }}
              className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
            >
              Delete ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN DATA DISPLAY (TABLE VIEW OR GRID VIEW) */}
      {isLoading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-xs font-semibold text-slate-400">Loading catalog items...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white/50 dark:bg-slate-900/30">
          <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No products found</h3>
          <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setStockFilter("all");
              setStatusFilter("all");
              setBadgeFilter("all");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-4 py-3.5">Product & Brand</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price & Margin</th>
                  <th className="px-4 py-3.5">Stock Level</th>
                  <th className="px-4 py-3.5">Published</th>
                  <th className="px-4 py-3.5">Featured</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p._id);
                  const effectivePrice = p.baseDiscountPrice || p.basePrice;
                  const hasDiscount = Boolean(p.baseDiscountPrice && p.baseDiscountPrice < p.basePrice);
                  const discountPercent = hasDiscount
                    ? Math.round(((p.basePrice - p.baseDiscountPrice) / p.basePrice) * 100)
                    : 0;

                  return (
                    <tr
                      key={p._id}
                      className={`transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                        isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p._id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Product details */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]?.url || "https://placehold.co/80x80?text=No+Img"}
                            alt={p.title}
                            className="h-12 w-12 flex-shrink-0 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                          />
                          <div className="min-w-0 max-w-xs">
                            <Link
                              to={`/product/${p.slug}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-1 flex items-center gap-1 group"
                              title={p.title}
                            >
                              <span>{p.title}</span>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400" />
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {p.brand || "Shopera"}
                              </span>
                              {p.tags?.length > 0 && (
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                                  #{p.tags[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {typeof p.category === "object" ? p.category?.name : "Category"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-slate-900 dark:text-white text-xs">
                              ₹{effectivePrice?.toLocaleString("en-IN")}
                            </span>
                            {hasDiscount && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ₹{p.basePrice?.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          {hasDiscount && (
                            <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Stepper */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={p.stock <= 0}
                            onClick={() =>
                              quickUpdateMutation.mutate({
                                id: p._id,
                                updates: { stock: Math.max(0, (p.stock || 0) - 1) },
                              })
                            }
                            className="h-6 w-6 rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 disabled:opacity-30"
                          >
                            -
                          </button>
                          <span
                            className={`min-w-[36px] text-center font-mono font-bold text-xs px-1.5 py-0.5 rounded-md border ${
                              (p.stock || 0) === 0
                                ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                                : (p.stock || 0) < 15
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                            }`}
                          >
                            {p.stock || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              quickUpdateMutation.mutate({
                                id: p._id,
                                updates: { stock: (p.stock || 0) + 1 },
                              })
                            }
                            className="h-6 w-6 rounded-md border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Published Toggle */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() =>
                            quickUpdateMutation.mutate({
                              id: p._id,
                              updates: { isPublished: !p.isPublished },
                            })
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition border ${
                            p.isPublished
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              p.isPublished ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{p.isPublished ? "Live" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() =>
                            quickUpdateMutation.mutate({
                              id: p._id,
                              updates: { featured: !p.featured },
                            })
                          }
                          className={`p-1.5 rounded-lg transition ${
                            p.featured
                              ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                              : "text-slate-300 hover:text-slate-500 dark:text-slate-600"
                          }`}
                          title={p.featured ? "Featured Item (Click to unfeature)" : "Set as Featured Item"}
                        >
                          <Star className={`h-4 w-4 ${p.featured ? "fill-amber-400" : ""}`} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
                            title="View on Storefront"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(p)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition"
                            title="Duplicate Product"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-indigo-600 hover:bg-indigo-50 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-indigo-400 transition"
                            title="Edit Product"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete product "${p.title}"?`)) {
                                deleteProductMutation.mutate(p._id);
                              }
                            }}
                            className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-600 hover:text-white shadow-xs dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((p) => {
            const isSelected = selectedIds.includes(p._id);
            const effectivePrice = p.baseDiscountPrice || p.basePrice;
            const hasDiscount = Boolean(p.baseDiscountPrice && p.baseDiscountPrice < p.basePrice);

            return (
              <div
                key={p._id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xs transition hover:shadow-md dark:bg-slate-900 ${
                  isSelected
                    ? "border-indigo-600 ring-2 ring-indigo-100 dark:ring-indigo-950"
                    : "border-slate-200/80 dark:border-slate-800"
                }`}
              >
                {/* Image Frame with Badges */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={p.images?.[0]?.url || "https://placehold.co/400x400?text=No+Image"}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />

                  {/* Top-Left Selection Checkbox */}
                  <div className="absolute left-2.5 top-2.5 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(p._id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Top-Right Status Badges */}
                  <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-1 items-end">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        p.isPublished
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-900/80 text-white backdrop-blur-xs"
                      }`}
                    >
                      {p.isPublished ? "Live" : "Draft"}
                    </span>
                    {p.featured && (
                      <span className="rounded-md bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>{p.brand}</span>
                    <span
                      className={`font-mono ${
                        (p.stock || 0) === 0
                          ? "text-rose-600"
                          : (p.stock || 0) < 15
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      Stock: {p.stock || 0}
                    </span>
                  </div>

                  <h4 className="mt-1 line-clamp-1 text-xs font-bold text-slate-900 dark:text-white" title={p.title}>
                    {p.title}
                  </h4>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      ₹{effectivePrice?.toLocaleString("en-IN")}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{p.basePrice?.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicate(p)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <Link
                        to={`/product/${p.slug}`}
                        target="_blank"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${p.title}"?`)) {
                            deleteProductMutation.mutate(p._id);
                          }
                        }}
                        className="rounded-lg bg-rose-50 p-1 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. COMPREHENSIVE PRODUCT CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingProduct ? "Edit Product Details" : "Create New Product"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingProduct ? `Updating SKU & Listing: ${editingProduct.title}` : "Add an item to the store catalog"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="mt-5 space-y-4 text-xs">
              {/* Row 1: Title & Brand */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex 65W GaN Travel Charger"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Signal Works"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 2: Category & Department */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Category Department *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Select a Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 3: Description */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Product Description *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide specifications, features, and dimensions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Row 4: Pricing & Stock */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Regular Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 2999"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>Discount Price (₹)</span>
                    {formData.basePrice && formData.baseDiscountPrice && Number(formData.baseDiscountPrice) < Number(formData.basePrice) && (
                      <span className="text-emerald-600 font-extrabold">
                        {Math.round(((formData.basePrice - formData.baseDiscountPrice) / formData.basePrice) * 100)}% OFF
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 2199"
                    value={formData.baseDiscountPrice}
                    onChange={(e) => setFormData({ ...formData, baseDiscountPrice: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 5: Image Showcase */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Primary Product Image URL
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="h-10 w-10 flex-shrink-0 rounded-lg object-cover border border-slate-200"
                    />
                  )}
                </div>
              </div>

              {/* Row 6: Tags with Clickable Suggestions */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Search & Badges Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="deals, sale, bestseller, featured, gaming"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Suggestions:</span>
                  {commonTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAppendTag(tag)}
                      className="rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 7: Flags (Published, Featured) */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Published Live on Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Editor&apos;s Featured Pick</span>
                </label>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveProductMutation.isLoading}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-100"
                >
                  {saveProductMutation.isLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : editingProduct ? (
                    "Save Changes"
                  ) : (
                    "Create Product"
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
