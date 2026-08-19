import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import api from "../api/axiosInstance";
import ProductCard from "../components/common/ProductCard";
import FilterSidebar from "../components/layout/FilterSidebar";

export default function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    inStock: "",
    sortBy: "newest",
    page: 1,
    limit: 12,
  });

  const resetFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      rating: "",
      inStock: "",
      sortBy: "newest",
      page: 1,
      limit: 12,
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["products", { ...filters, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice !== "") params.append("minPrice", filters.minPrice);
      if (filters.maxPrice !== "") params.append("maxPrice", filters.maxPrice);
      if (filters.rating) params.append("rating", filters.rating);
      if (filters.inStock) params.append("inStock", filters.inStock);
      params.append("sortBy", filters.sortBy);
      params.append("page", filters.page);
      params.append("limit", filters.limit);

      const res = await api.get(`/products?${params.toString()}`);
      return res.data.data;
    },
    keepPreviousData: true,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />

        {/* Product Catalog Grid */}
        <section className="flex-1">
          {/* Controls Bar */}
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-bold text-slate-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}{" "}
              <span className="text-sm font-normal text-slate-500">
                ({data?.pagination?.totalProducts || 0} items)
              </span>
            </h2>

            {/* Sort Strategy Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sort By:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value, page: 1 }))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Grid Render */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : data?.products?.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
              <p className="text-sm font-medium text-slate-500">No products match your active filters.</p>
              <button
                onClick={resetFilters}
                className="mt-3 rounded-lg bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {data?.pagination?.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={!data.pagination.hasPrevPage}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 text-sm font-medium text-slate-600">
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </span>
              <button
                disabled={!data.pagination.hasNextPage}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
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