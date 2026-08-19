import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { ShoppingBag, User, LogOut, Loader2 } from 'lucide-react';
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

export default function App() {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [checkAuth, logout]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen flex-col">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-indigo-600">
              <ShoppingBag className="h-6 w-6" />
              <span>Shopera</span>
            </Link>

            <nav className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">Hi, {user?.name}</span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <User className="h-4 w-4" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                  <h1 className="text-3xl font-extrabold text-slate-900">Welcome to Shopera</h1>
                  <p className="mt-2 text-slate-600">Modern MERN E-Commerce Storefront</p>
                </div>
              }
            />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}