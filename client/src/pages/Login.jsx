import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve destination redirect
  const queryRedirect = new URLSearchParams(location.search).get("redirect");
  const stateRedirect = location.state?.from;
  const rawRedirect = queryRedirect || stateRedirect;

  useEffect(() => {
    if (isAuthenticated && user) {
      if (rawRedirect && rawRedirect !== "/") {
        navigate(rawRedirect, { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, rawRedirect]);

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
    if (apiError) setApiError("");
  };

  const executeLogin = async (credentials) => {
    try {
      setIsSubmitting(true);
      setApiError("");
      const res = await login(credentials);
      const loggedUser = res.data.user;

      if (rawRedirect && rawRedirect !== "/") {
        navigate(rawRedirect, { replace: true });
      } else if (loggedUser?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message || "Invalid credentials. Please verify your email and password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await executeLogin(formData);
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Sign in to manage your orders, wishlist, and cart
          </p>
        </div>

        {apiError && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                  formErrors.email
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                    : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-100"
                }`}
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
            {formErrors.email && (
              <span className="mt-1 block text-[11px] font-medium text-rose-500">
                {formErrors.email}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                  formErrors.password
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                    : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-100"
                }`}
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formErrors.password && (
              <span className="mt-1 block text-[11px] font-medium text-rose-500">
                {formErrors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Quick Demo Credentials Autofill */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 pt-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
              Instant One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setFormData({
                    email: "admin@shopera.demo",
                    password: "Admin@12345",
                  });
                  executeLogin({
                    email: "admin@shopera.demo",
                    password: "Admin@12345",
                  });
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/80 px-2.5 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition shadow-xs"
              >
                <span>🔑 Login as Admin</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setFormData({
                    email: "customer@shopera.demo",
                    password: "Customer@12345",
                  });
                  executeLogin({
                    email: "customer@shopera.demo",
                    password: "Customer@12345",
                  });
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-2.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition shadow-xs"
              >
                <span>🛍️ Login as Customer</span>
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            to={rawRedirect && rawRedirect !== "/" ? `/register?redirect=${encodeURIComponent(rawRedirect)}` : "/register"}
            className="font-bold text-indigo-600 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}