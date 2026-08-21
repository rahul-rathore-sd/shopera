import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  Search,
  Star,
  Check,
  Tag,
  Sparkles,
  Flame,
  Zap,
  Package,
  Layers,
  DollarSign,
  Award,
  X,
  Percent,
} from "lucide-react";
import api from "../../api/axiosInstance";

export default function FilterSidebar({
  filters,
  onFilterChange,
  resetFilters,
  isMobile = false,
  onClose,
}) {
  // Accordion open/collapse states
  const [openSections, setOpenSections] = useState({
    deals: true,
    categories: true,
    price: true,
    brands: true,
    ratings: true,
    availability: true,
  });

  // Local search terms inside filter lists
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Custom price input state
  const [customMin, setCustomMin] = useState(filters.minPrice || "");
  const [customMax, setCustomMax] = useState(filters.maxPrice || "");

  // Toggle individual accordion section
  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Toggle all sections at once
  const toggleAllSections = () => {
    const allOpen = Object.values(openSections).every(Boolean);
    const newState = Object.keys(openSections).reduce((acc, key) => {
      acc[key] = !allOpen;
      return acc;
    }, {});
    setOpenSections(newState);
  };

  // 1. Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      return res.data.data;
    },
  });

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!categoriesData) return [];
    if (!categorySearch.trim()) return categoriesData;
    return categoriesData.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearch.trim().toLowerCase())
    );
  }, [categoriesData, categorySearch]);

  // Available brands in the catalog
  const availableBrands = [
    "Signal Works",
    "Aether Audio",
    "Atelier One",
    "Stride Lab",
    "Northstar",
    "Field Notes",
    "Hearth & Co",
    "Nova Tech",
  ];

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return availableBrands;
    return availableBrands.filter((brand) =>
      brand.toLowerCase().includes(brandSearch.trim().toLowerCase())
    );
  }, [brandSearch]);

  // Price presets
  const pricePresets = [
    { label: "All Prices", min: "", max: "" },
    { label: "Under ₹1,000", min: "0", max: "1000" },
    { label: "₹1,000 – ₹3,000", min: "1000", max: "3000" },
    { label: "₹3,000 – ₹8,000", min: "3000", max: "8000" },
    { label: "Above ₹8,000", min: "8000", max: "" },
  ];

  // Professional Deals & Badges Options
  const dealFilterOptions = [
    { id: "all", label: "All Products", icon: Layers, subtitle: "Full catalog" },
    { id: "sale", label: "On Sale", icon: Percent, subtitle: "Discounted items" },
    { id: "deals", label: "Hot Deals", icon: Flame, subtitle: "Special promotions" },
    { id: "bestseller", label: "Bestsellers", icon: Award, subtitle: "Top customer rated" },
    { id: "featured", label: "Featured Picks", icon: Sparkles, subtitle: "Staff selected" },
  ];

  // Handlers
  const handleDealSelect = (id) => {
    onFilterChange({
      dealType: filters.dealType === id || id === "all" ? "" : id,
      tags: id === "deals" || id === "bestseller" ? id : "",
      page: 1,
    });
  };

  const handleCategorySelect = (categorySlug) => {
    onFilterChange({
      category: filters.category === categorySlug ? "" : categorySlug,
      page: 1,
    });
  };

  const handlePricePreset = (min, max) => {
    setCustomMin(min);
    setCustomMax(max);
    onFilterChange({
      minPrice: min,
      maxPrice: max,
      page: 1,
    });
  };

  const handleApplyCustomPrice = (e) => {
    e.preventDefault();
    onFilterChange({
      minPrice: customMin.trim(),
      maxPrice: customMax.trim(),
      page: 1,
    });
  };

  const handleRatingSelect = (rating) => {
    onFilterChange({
      rating: filters.rating === rating.toString() ? "" : rating.toString(),
      page: 1,
    });
  };

  const handleBrandSelect = (brandName) => {
    onFilterChange({
      brand: filters.brand === brandName ? "" : brandName,
      page: 1,
    });
  };

  // Section activity states
  const isDealsActive = Boolean(filters.dealType || filters.tags || filters.featured === "true" || filters.hasDiscount === "true");
  const isCategoryActive = Boolean(filters.category);
  const isPriceActive = Boolean(filters.minPrice !== "" || filters.maxPrice !== "");
  const isBrandActive = Boolean(filters.brand);
  const isRatingActive = Boolean(filters.rating);
  const isAvailabilityActive = Boolean(filters.inStock === "true");

  const totalActiveFilters = [
    isDealsActive,
    isCategoryActive,
    isPriceActive,
    isBrandActive,
    isRatingActive,
    isAvailabilityActive,
  ].filter(Boolean).length;

  const allSectionsOpen = Object.values(openSections).every(Boolean);

  return (
    <aside
      className={`w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 ${
        isMobile ? "border-0 shadow-none bg-transparent" : "p-4 sm:p-5"
      }`}
    >
      {/* 1. SIDEBAR HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Filters
          </span>
          {totalActiveFilters > 0 && (
            <span className="rounded-full bg-slate-900 px-1.5 py-0.2 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">
              {totalActiveFilters}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAllSections}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition"
          >
            {allSectionsOpen ? "Collapse all" : "Expand all"}
          </button>

          {totalActiveFilters > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {/* ========================================================= */}
        {/* 2. DEALS & SPECIAL OFFERS SECTION                         */}
        {/* ========================================================= */}
        <div className="py-3.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleSection("deals")}
              className="flex flex-1 items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <Percent className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Offers & Highlights
                </span>
                {isDealsActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  openSections.deals ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {openSections.deals && (
            <div className="mt-3 space-y-1 animate-in fade-in duration-200">
              {dealFilterOptions.map((opt) => {
                const isSelected =
                  opt.id === "all"
                    ? !filters.dealType && !filters.tags && !filters.featured && !filters.hasDiscount
                    : filters.dealType === opt.id || filters.tags === opt.id;

                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleDealSelect(opt.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                      isSelected
                        ? "bg-slate-900 text-white font-bold dark:bg-white dark:text-slate-900 shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 opacity-80" />
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. CATEGORIES SECTION                                     */}
        {/* ========================================================= */}
        <div className="py-3.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleSection("categories")}
              className="flex flex-1 items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Categories
                </span>
                {isCategoryActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  openSections.categories ? "rotate-180" : ""
                }`}
              />
            </button>
            {isCategoryActive && (
              <button
                type="button"
                onClick={() => handleCategorySelect(filters.category)}
                className="ml-2 text-[10px] font-semibold text-slate-400 hover:text-rose-500"
              >
                Clear
              </button>
            )}
          </div>

          {openSections.categories && (
            <div className="mt-3 space-y-2 animate-in fade-in duration-200">
              {/* Category Search Input */}
              {categoriesData && categoriesData.length > 5 && (
                <div className="relative mb-1.5">
                  <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search category..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-7 pr-2 py-1.5 text-[11px] text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-400"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}

              {/* All Categories Option */}
              <button
                type="button"
                onClick={() => onFilterChange({ category: "", page: 1 })}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                  !filters.category
                    ? "bg-slate-100 font-bold text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40"
                }`}
              >
                <span>All Categories</span>
                {!filters.category && <Check className="h-3.5 w-3.5 text-slate-900 dark:text-white" />}
              </button>

              {/* Dynamic Category List */}
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {categoriesLoading ? (
                  <div className="space-y-1.5 py-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-6 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    ))}
                  </div>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => {
                    const isSelected = filters.category === cat.slug;
                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                          isSelected
                            ? "bg-slate-900 font-bold text-white dark:bg-white dark:text-slate-900 shadow-xs"
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                      </button>
                    );
                  })
                ) : (
                  <p className="py-2 text-center text-[11px] text-slate-400">No categories found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 4. PRICE RANGE SECTION                                    */}
        {/* ========================================================= */}
        <div className="py-3.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleSection("price")}
              className="flex flex-1 items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Price Range
                </span>
                {isPriceActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  openSections.price ? "rotate-180" : ""
                }`}
              />
            </button>
            {isPriceActive && (
              <button
                type="button"
                onClick={() => {
                  setCustomMin("");
                  setCustomMax("");
                  onFilterChange({ minPrice: "", maxPrice: "", page: 1 });
                }}
                className="ml-2 text-[10px] font-semibold text-slate-400 hover:text-rose-500"
              >
                Clear
              </button>
            )}
          </div>

          {openSections.price && (
            <div className="mt-3 space-y-2.5 animate-in fade-in duration-200">
              {/* Presets */}
              <div className="grid grid-cols-1 gap-1">
                {pricePresets.map((preset, idx) => {
                  const isSelected =
                    preset.min === "" && preset.max === ""
                      ? filters.minPrice === "" && filters.maxPrice === ""
                      : filters.minPrice === preset.min && filters.maxPrice === preset.max;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePricePreset(preset.min, preset.max)}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                        isSelected
                          ? "bg-slate-900 font-bold text-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span>{preset.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Min / Max Inputs */}
              <form onSubmit={handleApplyCustomPrice} className="pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5 font-medium">
                  <span>Custom Price (₹)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
                  >
                    Go
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 5. BRANDS SECTION                                         */}
        {/* ========================================================= */}
        <div className="py-3.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleSection("brands")}
              className="flex flex-1 items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Brands
                </span>
                {isBrandActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  openSections.brands ? "rotate-180" : ""
                }`}
              />
            </button>
            {isBrandActive && (
              <button
                type="button"
                onClick={() => handleBrandSelect(filters.brand)}
                className="ml-2 text-[10px] font-semibold text-slate-400 hover:text-rose-500"
              >
                Clear
              </button>
            )}
          </div>

          {openSections.brands && (
            <div className="mt-3 space-y-2 animate-in fade-in duration-200">
              <div className="relative mb-1.5">
                <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Search brand..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-7 pr-2 py-1.5 text-[11px] text-slate-800 placeholder-slate-400 outline-none focus:border-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                />
                {brandSearch && (
                  <button
                    type="button"
                    onClick={() => setBrandSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {filteredBrands.map((brand) => {
                  const isSelected = filters.brand === brand;
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => handleBrandSelect(brand)}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                        isSelected
                          ? "bg-slate-900 font-bold text-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span>{brand}</span>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 6. CUSTOMER RATINGS                                       */}
        {/* ========================================================= */}
        <div className="py-3.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleSection("ratings")}
              className="flex flex-1 items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Rating
                </span>
                {isRatingActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  openSections.ratings ? "rotate-180" : ""
                }`}
              />
            </button>
            {isRatingActive && (
              <button
                type="button"
                onClick={() => handleRatingSelect(filters.rating)}
                className="ml-2 text-[10px] font-semibold text-slate-400 hover:text-rose-500"
              >
                Clear
              </button>
            )}
          </div>

          {openSections.ratings && (
            <div className="mt-3 space-y-1 animate-in fade-in duration-200">
              {[4.5, 4.0, 3.5].map((stars) => {
                const isSelected = filters.rating === stars.toString();
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => handleRatingSelect(stars)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                      isSelected
                        ? "bg-slate-900 font-bold text-white dark:bg-white dark:text-slate-900 shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{stars}★ & above</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 7. AVAILABILITY SECTION                                   */}
        {/* ========================================================= */}
        <div className="py-3.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => toggleSection("availability")}
              className="flex flex-1 items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Availability
                </span>
                {isAvailabilityActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  openSections.availability ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {openSections.availability && (
            <div className="mt-3 space-y-2 animate-in fade-in duration-200">
              <label className="flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  In Stock Only
                </span>
                <input
                  type="checkbox"
                  checked={filters.inStock === "true"}
                  onChange={(e) =>
                    onFilterChange({
                      inStock: e.target.checked ? "true" : "",
                      page: 1,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE DRAWER FOOTER */}
      {isMobile && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-[2] rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900 transition"
          >
            Apply Filters
          </button>
        </div>
      )}
    </aside>
  );
}