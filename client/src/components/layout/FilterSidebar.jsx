import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import api from "../../api/axiosInstance";

export default function FilterSidebar({ filters, setFilters, resetFilters }) {
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data;
    },
  });

  const handleCategorySelect = (categorySlug) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === categorySlug ? "" : categorySlug,
      page: 1,
    }));
  };

  const handlePriceChange = (min, max) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
      page: 1,
    }));
  };

  const handleRatingSelect = (rating) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === rating ? "" : rating,
      page: 1,
    }));
  };

  return (
    <aside className="w-full space-y-6 rounded-xl border border-slate-200 bg-white p-5 lg:w-64">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h4>
        <div className="mt-3 space-y-1.5">
          {categoriesLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : (
            categoriesData?.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition ${
                  filters.category === cat.slug
                    ? "bg-indigo-50 font-semibold text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Price Range Presets */}
      <div className="border-t border-slate-100 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Range</h4>
        <div className="mt-3 space-y-1.5 text-sm">
          {[
            { label: "Under ₹500", min: 0, max: 500 },
            { label: "₹500 - ₹2,000", min: 500, max: 2000 },
            { label: "₹2,000 - ₹5,000", min: 2000, max: 5000 },
            { label: "Above ₹5,000", min: 5000, max: "" },
          ].map((preset, idx) => {
            const isSelected =
              filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <label
                key={idx}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-50"
              >
                <input
                  type="radio"
                  name="price_filter"
                  checked={isSelected}
                  onChange={() => handlePriceChange(preset.min, preset.max)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>{preset.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Customer Ratings */}
      <div className="border-t border-slate-100 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Rating</h4>
        <div className="mt-3 space-y-1.5">
          {[4, 3, 2].map((stars) => (
            <label
              key={stars}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="rating_filter"
                checked={filters.rating === stars.toString()}
                onChange={() => handleRatingSelect(stars.toString())}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>{stars}★ & above</span>
            </label>
          ))}
        </div>
      </div>

      {/* In-Stock Only Toggle */}
      <div className="border-t border-slate-100 pt-5">
        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-sm font-medium text-slate-700">In Stock Only</span>
          <input
            type="checkbox"
            checked={filters.inStock === "true"}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                inStock: e.target.checked ? "true" : "",
                page: 1,
              }))
            }
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </label>
      </div>
    </aside>
  );
}