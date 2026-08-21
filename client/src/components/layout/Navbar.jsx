import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User,
  LogOut,
  X,
  ChevronDown,
  Package,
  ShieldCheck,
  Flame,
  Zap,
  Sparkles,
  Star,
  Truck,
  Shield,
  HelpCircle,
  Laptop,
  Shirt,
  Home,
  Watch,
  Grid,
  Tag,
  Headphones,
  Smartphone,
  Gift,
  ArrowRight,
  Globe,
  Compass,
  Moon,
  Sun,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useThemeStore } from "../../store/useThemeStore";

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);

  const activeCategory = searchParams.get("category") || "";
  const activeSort = searchParams.get("sortBy") || "";
  const activeTag = searchParams.get("tag") || "";

  const { user, isAuthenticated, logout } = useAuthStore();
  const { fetchCart, getTotalItemCount } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/");
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    navigate("/");
  };

  const totalCartCount = getTotalItemCount();

  const allCategories = [
    {
      name: "Electronics & Gadgets",
      slug: "electronics",
      icon: Laptop,
      description: "Laptops, audio, mechanical keyboards, accessories",
      badge: "Popular",
    },
    {
      name: "Fashion & Apparel",
      slug: "fashion",
      icon: Shirt,
      description: "Men & Women styles, streetwear, sneakers",
      badge: "Trending",
    },
    {
      name: "Home & Living",
      slug: "home",
      icon: Home,
      description: "Modern decor, smart appliances, lighting",
    },
    {
      name: "Luxury Watches & Tech",
      slug: "watches",
      icon: Watch,
      description: "Chronographs, smart wearables, straps",
      badge: "Premium",
    },
    {
      name: "Smart Audio & Speakers",
      slug: "audio",
      icon: Headphones,
      description: "Noise-cancelling headphones, earbuds",
    },
    {
      name: "Mobile Accessories",
      slug: "accessories",
      icon: Smartphone,
      description: "Fast chargers, MagSafe cases, power banks",
    },
  ];

  const curatedNavLinks = [
    { label: "Trending Deals", icon: Flame, tag: "deals", badge: "HOT" },
    { label: "Flash Sale", icon: Zap, tag: "sale" },
    { label: "Electronics", icon: Laptop, category: "electronics" },
    { label: "Fashion", icon: Shirt, category: "fashion" },
    { label: "Home & Living", icon: Home, category: "home" },
    { label: "Watches & Tech", icon: Watch, category: "watches" },
    { label: "Best Sellers", icon: Star, sortBy: "rating" },
    { label: "New Arrivals", icon: Sparkles, sortBy: "newest" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      {/* 1. TOP ANNOUNCEMENT & UTILITY BAR */}
      <div className="border-b border-slate-900/10 bg-slate-950 px-4 py-1.5 text-xs text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left Promo Message */}
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-medium text-slate-300">
              ⚡ Flash Deal: Use coupon <strong className="text-amber-400 font-bold">SHOPERA15</strong> for 15% OFF • Free Delivery &gt; ₹1,000
            </span>
          </div>

          {/* Right Utilities */}
          <div className="hidden items-center gap-4 text-[11px] font-medium text-slate-400 sm:flex">
            {user?.role === "admin" && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 rounded-lg bg-purple-600/20 px-2 py-0.5 font-bold text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 hover:text-white transition"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                  <span>Admin Console</span>
                </Link>
                <span>•</span>
              </>
            )}
            <Link
              to="/orders"
              className="flex items-center gap-1 hover:text-white transition"
            >
              <Truck className="h-3 w-3 text-indigo-400" />
              <span>Track Orders</span>
            </Link>
            <span>•</span>
            <Link
              to="/profile"
              className="flex items-center gap-1 hover:text-white transition"
            >
              <Shield className="h-3 w-3 text-emerald-400" />
              <span>Buyer Protection</span>
            </Link>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-indigo-400" />
              <span>🇮🇳 IN (₹)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BRAND & SEARCH ROW */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-slate-900 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-indigo-600 leading-tight">Shopera</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Next-Gen Store
              </span>
            </div>
          </Link>

          {/* Centered Expanded Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden max-w-xl flex-1 md:block"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search premium electronics, luxury watches, fashion, sneakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-24 text-xs font-medium text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
              <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />

              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-16 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 top-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-600 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Admin Dashboard Quick Button for Admins */}
            {user?.role === "admin" && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:opacity-95 transition"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Admin Dashboard</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            )}

            {/* Quick Track Order Link */}
            <Link
              to="/orders"
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-indigo-600 hover:bg-white hover:text-indigo-600 transition shadow-sm"
            >
              <Package className="h-4 w-4 text-indigo-600" />
              <span>Orders</span>
            </Link>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-slate-700 shadow-sm transition hover:border-indigo-600 hover:text-indigo-600"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white shadow-sm animate-in zoom-in">
                    {totalCartCount > 99 ? "99+" : totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden text-xs font-bold sm:inline">Cart</span>
            </Link>

            {/* User Account / Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-700 shadow-sm transition hover:border-indigo-600 hover:bg-slate-50 focus:outline-none"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-sm">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "U"}
                  </div>
                  <span className="hidden text-xs font-bold text-slate-900 md:inline max-w-[90px] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-3xl border border-slate-200 bg-white p-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                      <div className="border-b border-slate-100 px-3 py-2">
                        <p className="truncate text-xs font-bold text-slate-900">
                          {user?.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        >
                          <Package className="h-4 w-4" />
                          <span>My Orders & Delivery</span>
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        >
                          <User className="h-4 w-4" />
                          <span>Account & Address Book</span>
                        </Link>

                        {user?.role === "admin" && (
                          <>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                              Admin Controls
                            </div>
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/40 transition"
                            >
                              <ShieldCheck className="h-4 w-4 text-purple-600" />
                              <span>Admin Console</span>
                            </Link>
                            <Link
                              to="/admin/products"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                            >
                              <Package className="h-4 w-4 text-indigo-600" />
                              <span>Products Management</span>
                            </Link>
                            <Link
                              to="/admin/orders"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                            >
                              <Truck className="h-4 w-4 text-emerald-600" />
                              <span>Orders & Dispatch</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (under brand on small devices) */}
        <form onSubmit={handleSearchSubmit} className="mt-3 block md:hidden">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search products, brands, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-xs outline-none focus:border-indigo-600 focus:bg-white"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-2.5 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 3. LOWER CATEGORY & EXPLORE LINKS BAR (Doubled Navbar with NO scrollbar) */}
      <div className="border-t border-slate-100 bg-slate-50/90 px-4 py-2 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          {/* Left: All Categories Dropdown + Curated Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* All Categories Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  categoriesMenuOpen
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-300/80 bg-white text-slate-800 hover:border-indigo-600 hover:text-indigo-600 shadow-sm"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>All Categories</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${
                    categoriesMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Categories Mega Dropdown Menu */}
              {categoriesMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCategoriesMenuOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="border-b border-slate-100 px-3 pb-2.5 pt-1">
                      <p className="text-xs font-black text-slate-900">Explore Catalog</p>
                      <p className="text-[11px] text-slate-400">
                        Select a department to filter products instantly
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-2">
                      {allCategories.map((cat) => {
                        const Icon = cat.icon;
                        const isCatActive = activeCategory === cat.slug;

                        return (
                          <Link
                            key={cat.slug}
                            to={`/?category=${cat.slug}`}
                            onClick={() => setCategoriesMenuOpen(false)}
                            className={`flex items-start gap-2.5 rounded-2xl p-2.5 transition ${
                              isCatActive
                                ? "bg-indigo-50 text-indigo-900 font-bold ring-1 ring-indigo-200"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-xs font-bold text-slate-900">
                                  {cat.name}
                                </p>
                                {cat.badge && (
                                  <span className="rounded bg-indigo-100 px-1 py-0.2 text-[9px] font-bold text-indigo-700">
                                    {cat.badge}
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-[10px] text-slate-400">
                                {cat.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 pt-2 px-2">
                      <Link
                        to="/"
                        onClick={() => setCategoriesMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        <span>View All Products in Catalog</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Curated Direct Links */}
            {curatedNavLinks.map((item) => {
              const Icon = item.icon;
              let isActive = false;
              let targetUrl = "/";

              if (item.tag) {
                isActive = activeTag === item.tag;
                targetUrl = `/?tag=${item.tag}`;
              } else if (item.category) {
                isActive = activeCategory === item.category;
                targetUrl = `/?category=${item.category}`;
              } else if (item.sortBy) {
                isActive = activeSort === item.sortBy;
                targetUrl = `/?sortBy=${item.sortBy}`;
              }

              return (
                <Link
                  key={item.label}
                  to={targetUrl}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-indigo-600 text-white font-bold shadow-sm"
                      : item.badge === "HOT"
                      ? "border border-rose-200 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100"
                      : "border border-slate-200/70 bg-white text-slate-700 hover:border-indigo-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isActive
                        ? "text-white"
                        : item.badge === "HOT"
                        ? "text-rose-600"
                        : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Perk highlights */}
          <div className="hidden items-center gap-2 xl:flex">
            <Link
              to="/?tag=deals"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-300/40 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100/60 transition"
            >
              <Gift className="h-3.5 w-3.5 text-amber-600" />
              <span>Coupon Hub: WELCOME500</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}