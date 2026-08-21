import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  SlidersHorizontal,
  X,
  RotateCcw,
  PanelLeftClose,
  PanelLeft,
  ShoppingBag,
} from "lucide-react";
import api from "../api/axiosInstance";
import ProductCard from "../components/common/ProductCard";
import FilterSidebar from "../components/layout/FilterSidebar";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Desktop sidebar collapse toggle state
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract filter parameters from URL
  const filters = useMemo(() => {
    return {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      rating: searchParams.get("rating") || "",
      brand: searchParams.get("brand") || "",
      tags: searchParams.get("tags") || searchParams.get("tag") || "",
      dealType: searchParams.get("dealType") || searchParams.get("deals") || "",
      inStock: searchParams.get("inStock") || "",
      featured: searchParams.get("featured") || "",
      sortBy: searchParams.get("sortBy") || "newest",
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: 12,
    };
  }, [searchParams]);

  // Update filters by syncing directly into URL search parameters
  const updateFilters = (newFilters) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          nextParams.set(key, String(value));
        } else {
          nextParams.delete(key);
        }
      });

      // Reset page to 1 when any non-page filter changes
      if (!("page" in newFilters)) {
        nextParams.delete("page");
      }

      return nextParams;
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchParams({});
  };

  // Remove individual filter chip
  const removeFilterChip = (key) => {
    if (key === "price") {
      updateFilters({ minPrice: "", maxPrice: "" });
    } else if (key === "dealType" || key === "tags") {
      updateFilters({ dealType: "", tags: "", tag: "", deals: "" });
    } else {
      updateFilters({ [key]: "" });
    }
  };

  // 2. Fetch products with current URL parameters
  const { data, isLoading } = useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice !== "") params.append("minPrice", filters.minPrice);
      if (filters.maxPrice !== "") params.append("maxPrice", filters.maxPrice);
      if (filters.rating) params.append("rating", filters.rating);
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.tags) params.append("tags", filters.tags);
      if (filters.dealType) params.append("dealType", filters.dealType);
      if (filters.inStock) params.append("inStock", filters.inStock);
      if (filters.featured) params.append("featured", filters.featured);
      params.append("sortBy", filters.sortBy);
      params.append("page", filters.page);
      params.append("limit", filters.limit);

      const res = await api.get(`/products?${params.toString()}`);
      return res.data.data;
    },
    keepPreviousData: true,
  });

  // Construct active filter chips
  const activeChips = useMemo(() => {
    const chips = [];

    if (filters.search) {
      chips.push({ label: `"${filters.search}"`, key: "search" });
    }
    if (filters.dealType || filters.tags) {
      const dealVal = filters.dealType || filters.tags;
      let label = `Offer: ${dealVal}`;
      if (dealVal === "sale") label = "On Sale";
      if (dealVal === "deals") label = "Hot Deals";
      if (dealVal === "bestseller") label = "Bestsellers";
      if (dealVal === "featured") label = "Featured Picks";
      chips.push({ label, key: "dealType" });
    }
    if (filters.category) {
      chips.push({
        label: `Category: ${filters.category.replace("-", " ")}`,
        key: "category",
      });
    }
    if (filters.minPrice !== "" || filters.maxPrice !== "") {
      let priceLabel = "";
      if (filters.minPrice !== "" && filters.maxPrice !== "") {
        priceLabel = `₹${filters.minPrice} – ₹${filters.maxPrice}`;
      } else if (filters.minPrice !== "") {
        priceLabel = `Above ₹${filters.minPrice}`;
      } else {
        priceLabel = `Under ₹${filters.maxPrice}`;
      }
      chips.push({ label: priceLabel, key: "price" });
    }
    if (filters.brand) {
      chips.push({ label: `Brand: ${filters.brand}`, key: "brand" });
    }
    if (filters.rating) {
      chips.push({ label: `${filters.rating}★ & above`, key: "rating" });
    }
    if (filters.inStock === "true") {
      chips.push({ label: "In Stock Only", key: "inStock" });
    }

    return chips;
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-8">
      {/* 1. TOP HEADER ROW */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {/* Desktop Sidebar Collapse Toggle */}
            <button
              type="button"
              onClick={() => setDesktopSidebarOpen((prev) => !prev)}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
              title={desktopSidebarOpen ? "Hide Filters" : "Show Filters"}
            >
              {desktopSidebarOpen ? (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  <span>Hide Filters</span>
                </>
              ) : (
                <>
                  <PanelLeft className="h-4 w-4" />
                  <span>Show Filters</span>
                  {activeChips.length > 0 && (
                    <span className="ml-1 rounded-full bg-slate-900 px-1.5 py-0.2 text-[10px] text-white dark:bg-white dark:text-slate-900">
                      {activeChips.length}
                    </span>
                  )}
                </>
              )}
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                {filters.search
                  ? `Search: "${filters.search}"`
                  : filters.category
                  ? `${filters.category.replace("-", " ")}`
                  : "All Products"}
              </h1>
              <p className="text-xs text-slate-400">
                Showing {data?.products?.length || 0} of {data?.pagination?.totalProducts || 0} items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-400 lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">
                  {activeChips.length}
                </span>
              )}
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline text-xs font-semibold text-slate-400">Sort:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 shadow-xs cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. ACTIVE FILTER CHIPS BAR */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-slate-400">Active:</span>
            {activeChips.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 pl-2.5 pr-1.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeFilterChip(chip.key)}
                  className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title={`Remove ${chip.label}`}
                >
                  <X className="h-3 w-3 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition ml-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset all</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. MAIN CATALOG LAYOUT */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 items-start">
        {/* Desktop Sidebar */}
        {desktopSidebarOpen && (
          <div className="hidden lg:block lg:w-64 flex-shrink-0 sticky top-24 transition-all duration-300">
            <FilterSidebar
              filters={filters}
              onFilterChange={updateFilters}
              resetFilters={resetFilters}
            />
          </div>
        )}

        {/* Mobile Slide-Over Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-5 shadow-2xl dark:bg-slate-950 overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Filter Products</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex-1">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={updateFilters}
                  resetFilters={resetFilters}
                  isMobile={true}
                  onClose={() => setMobileFilterOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <section className="flex-1 min-w-0 w-full">
          {isLoading ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-slate-900 dark:text-white" />
              <p className="text-xs font-semibold text-slate-400">Loading catalog...</p>
            </div>
          ) : data?.products?.length > 0 ? (
            <div
              className={`grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-3 ${
                desktopSidebarOpen
                  ? "lg:grid-cols-3 xl:grid-cols-4"
                  : "lg:grid-cols-4 xl:grid-cols-5"
              }`}
            >
              {data.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white/40 dark:bg-slate-900/30">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 mb-3">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No products match the selected criteria
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                Try clearing some filters or exploring other categories.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {data?.pagination?.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={!data.pagination.hasPrevPage}
                onClick={() => updateFilters({ page: filters.page - 1 })}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-30 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 hover:border-slate-400 transition"
              >
                Previous
              </button>
              <span className="px-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </span>
              <button
                disabled={!data.pagination.hasNextPage}
                onClick={() => updateFilters({ page: filters.page + 1 })}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-30 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 hover:border-slate-400 transition"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}