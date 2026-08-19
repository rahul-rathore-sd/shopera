import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingBag, Search, ShoppingCart, User, LogOut, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { fetchCart, getTotalItemCount } = useCartStore();

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

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-indigo-600">
          <ShoppingBag className="h-7 w-7" />
          <span>Shopera</span>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden max-w-md flex-1 sm:block">
          <input
            type="text"
            placeholder="Search products, brands, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Cart Trigger */}
          <Link
            to="/cart"
            className="relative flex items-center justify-center rounded-full p-2 text-slate-700 hover:bg-slate-100 transition"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalCartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white shadow-sm">
                {totalCartCount > 99 ? "99+" : totalCartCount}
              </span>
            )}
          </Link>

          {/* User Auth Control */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <span className="hidden text-sm font-semibold text-slate-700 md:inline">
                {user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:px-3 md:py-1.5"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden text-xs font-medium md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <Link
                to="/login"
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}