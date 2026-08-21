import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Send,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Lock,
  Globe,
  ExternalLink,
  ChevronRight,
  Heart,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Monitor scroll for Back-to-Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <footer className="relative border-t border-slate-200 bg-slate-950 text-slate-300">
      {/* 1. TOP TRUST & PERKS HIGHLIGHTS BANNER */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Perk 1 */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 transition hover:border-indigo-500/40 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Free Express Shipping</h4>
                <p className="text-xs text-slate-400">On all orders above ₹1,000</p>
              </div>
            </div>

            {/* Perk 2 */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 transition hover:border-emerald-500/40 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">7-Day Easy Returns</h4>
                <p className="text-xs text-slate-400">Instant refunds, no questions asked</p>
              </div>
            </div>

            {/* Perk 3 */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 transition hover:border-purple-500/40 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Secure Checkout</h4>
                <p className="text-xs text-slate-400">256-Bit Bank-grade encryption</p>
              </div>
            </div>

            {/* Perk 4 */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 transition hover:border-amber-500/40 hover:bg-slate-900/80">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-600/10 text-amber-400 border border-amber-500/20">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">24/7 Priority Support</h4>
                <p className="text-xs text-slate-400">Dedicated concierge assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN STRUCTURED FOOTER LINKS */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12">
          {/* Column 1: Brand & Contact Info (4 cols) */}
          <div className="space-y-4 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span>Shopera</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Discover a curated next-generation shopping universe with verified high-tech gadgets,
              premium fashion, and lifestyle essentials with lightning-fast doorstep delivery.
            </p>

            {/* Contact details */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <span>Shopera HQ, Tech Park Avenue, Cyber City, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <a href="mailto:support@shopera.com" className="hover:text-white transition">
                  support@shopera.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                <a href="tel:+911800123456" className="hover:text-white transition">
                  1800-123-SHOP (Toll-Free 24x7)
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Connect With Us</p>
              <div className="mt-2.5 flex items-center gap-2">
                {[
                  { name: "Twitter", label: "𝕏", url: "https://twitter.com" },
                  { name: "Instagram", label: "IG", url: "https://instagram.com" },
                  { name: "LinkedIn", label: "IN", url: "https://linkedin.com" },
                  { name: "GitHub", label: "GH", url: "https://github.com" },
                  { name: "Discord", label: "DC", url: "https://discord.com" },
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-400 transition hover:border-indigo-500 hover:bg-indigo-600 hover:text-white"
                    title={s.name}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Shop & Categories (2 cols) */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Categories</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/?category=electronics" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Electronics & Audio</span>
                </Link>
              </li>
              <li>
                <Link to="/?category=fashion" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Fashion & Apparel</span>
                </Link>
              </li>
              <li>
                <Link to="/?category=home" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Home & Living</span>
                </Link>
              </li>
              <li>
                <Link to="/?category=watches" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Watches & Tech</span>
                </Link>
              </li>
              <li>
                <Link to="/?sortBy=rating" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Best Sellers ⭐</span>
                </Link>
              </li>
              <li>
                <Link to="/?sortBy=newest" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>New Arrivals 🚀</span>
                </Link>
              </li>
              <li>
                <Link to="/?tag=deals" className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5 font-bold">
                  <ChevronRight className="h-3 w-3 text-amber-500" />
                  <span>Flash Deals 🔥</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Services (2 cols) */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Customer Care</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/orders" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Track Your Order 🚚</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>My Account & Profile</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Shopping Cart</span>
                </Link>
              </li>
              <li>
                <a href="#shipping-policy" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Shipping & Delivery Policy</span>
                </a>
              </li>
              <li>
                <a href="#return-policy" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Returns & Refunds</span>
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Help & FAQ Center</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: About Company (2 cols) */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#story" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Our Story & Vision</span>
                </a>
              </li>
              <li>
                <a href="#sustainability" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Sustainability</span>
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Careers (We're Hiring!)</span>
                </a>
              </li>
              <li>
                <a href="#press" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>News & Press Releases</span>
                </a>
              </li>
              <li>
                <a href="#partners" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Merchant Partnerships</span>
                </a>
              </li>
              <li>
                <a href="#investors" className="hover:text-white transition flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span>Investor Relations</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: VIP Newsletter (2 cols) */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">VIP Club</h4>
            </div>
            <p className="text-xs text-slate-400">
              Subscribe to unlock <strong>15% OFF</strong> your first order + early access to flash sales.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>You're subscribed! Use code: <strong>SHOPERA15</strong></span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-3 pr-9 text-xs text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700"
                    title="Subscribe"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  No spam ever. Unsubscribe anytime with 1 click.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR & PAYMENT BADGES */}
      <div className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          {/* Copyright & Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 sm:justify-start">
            <span>© {new Date().getFullYear()} Shopera Inc. All rights reserved.</span>
            <span>•</span>
            <a href="#privacy" className="hover:text-slate-300 transition">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-slate-300 transition">Terms of Service</a>
            <span>•</span>
            <a href="#cookies" className="hover:text-slate-300 transition">Cookies</a>
            <span>•</span>
            <a href="#security" className="hover:text-slate-300 transition">Security</a>
          </div>

          {/* Payment & Region Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Pill */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
              <Globe className="h-3.5 w-3.5 text-indigo-400" />
              <span>🇮🇳 India (INR ₹)</span>
            </div>

            {/* Payment Method Badges */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <span className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5">VISA</span>
              <span className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5">MASTERCARD</span>
              <span className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-emerald-400 font-bold">UPI</span>
              <span className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-indigo-400">RAZORPAY</span>
              <span className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-purple-400">RUPAY</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FLOATING BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95 animate-in fade-in zoom-in duration-200"
          title="Back to Top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  );
}
