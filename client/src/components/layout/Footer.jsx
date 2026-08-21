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
  Sun,
  Moon,
  X,
  FileText,
  HelpCircle,
  Briefcase,
  Leaf,
  Building,
  Shield,
} from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

export default function Footer() {
  const { theme, toggleTheme } = useThemeStore();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'shipping' | 'returns' | 'faq' | 'story' | 'sustainability' | 'careers' | 'press' | 'partners' | 'investors' | 'privacy' | 'terms' | 'cookies' | 'security'

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

  // Content dictionary for all modal-backed footer links
  const modalContent = {
    shipping: {
      title: "Shipping & Delivery Policy",
      icon: Truck,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p>
            At <strong>Shopera</strong>, we partner with premier logistics carriers (BlueDart, Delhivery, ExpressBee) to ensure secure, rapid delivery across India.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 dark:border-slate-800 dark:bg-slate-900">
            <h5 className="font-bold text-slate-900 dark:text-white">Delivery Timelines:</h5>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li><strong>Metro Cities:</strong> Same-day dispatch with 24–48 hour delivery.</li>
              <li><strong>Tier 2 & 3 Cities:</strong> 2–4 business days with real-time GPS tracking.</li>
              <li><strong>Free Shipping:</strong> Standard free express delivery on all orders above ₹1,000.</li>
            </ul>
          </div>
          <p>
            You will receive live SMS and WhatsApp notifications alongside a 4-digit doorstep delivery PIN when your rider is out for delivery.
          </p>
        </div>
      ),
    },
    returns: {
      title: "Returns & Refund Policy",
      icon: RotateCcw,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
      content: (
        <div className="space-y-4 text-xs leading-relaxed">
          <p>
            We offer a hassle-free <strong>7-Day No-Questions-Asked Return & Exchange Window</strong> for all eligible items.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 dark:border-slate-800 dark:bg-slate-900">
            <h5 className="font-bold text-slate-900 dark:text-white">How Returns Work:</h5>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400">
              <li>Go to <strong>My Orders</strong> and select the order you wish to return.</li>
              <li>Choose your reason and preferred doorstep pickup slot.</li>
              <li>Our rider verifies the intact tags and original packaging at pickup.</li>
              <li>Refund is initiated immediately to your original UPI / Card account within 2 hours.</li>
            </ol>
          </div>
        </div>
      ),
    },
    faq: {
      title: "Frequently Asked Questions (FAQ)",
      icon: HelpCircle,
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          {[
            {
              q: "How do I track my live order?",
              a: "Navigate to the Orders tab in the navbar or footer to view your 5-step delivery tracker, rider details, and doorstep OTP.",
            },
            {
              q: "What payment methods are supported?",
              a: "We accept Visa, Mastercard, RuPay, UPI (GPay, PhonePe, Paytm), NetBanking, and Cash on Delivery (COD).",
            },
            {
              q: "Are the products 100% genuine?",
              a: "All products listed on Shopera are sourced directly from authorized brand distributors and manufacturer guarantees.",
            },
            {
              q: "How can I change my delivery slot?",
              a: "Open your active order and click 'Reschedule Delivery Slot' to pick Morning, Afternoon, or Evening handover.",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-bold text-slate-900 dark:text-white">{item.q}</p>
              <p className="text-slate-600 dark:text-slate-400">{item.a}</p>
            </div>
          ))}
        </div>
      ),
    },
    story: {
      title: "Our Story & Vision",
      icon: Sparkles,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p>
            Founded in 2026, <strong>Shopera</strong> was built with a single mission: to redefine the online shopping paradigm through hyper-speed delivery, verified premium catalog curation, and transparent customer-first service.
          </p>
          <p>
            From hot-swappable mechanical keyboards to handcrafted selvedge denim and luxury timepieces, our team meticulously audits every supplier to ensure uncompromising quality.
          </p>
        </div>
      ),
    },
    sustainability: {
      title: "Sustainability & Eco-Packaging",
      icon: Leaf,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p>
            We are committed to a <strong>100% Plastic-Free & Carbon-Neutral Delivery Chain</strong>.
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>100% biodegradable FSC-certified recycled cardboard boxes and paper tapes.</li>
            <li>Electric Vehicle (EV) delivery fleet for all inner-city last-mile logistics.</li>
            <li>Carbon offset contributions invested in regional reforestation programs.</li>
          </ul>
        </div>
      ),
    },
    careers: {
      title: "Careers at Shopera",
      icon: Briefcase,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p>
            We're building the future of e-commerce commerce engineering and last-mile logistics.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 dark:border-slate-800 dark:bg-slate-900">
            <h5 className="font-bold text-slate-900 dark:text-white">Open Roles:</h5>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>💼 <strong>Full-Stack Engineer (React, Node.js, MongoDB)</strong> — Cyber City / Remote</li>
              <li>🎨 <strong>Senior UI/UX Product Designer</strong> — Cyber City</li>
              <li>🚚 <strong>Logistics Operations Manager</strong> — Mumbai Hub</li>
            </ul>
          </div>
          <p>
            Send your portfolio and resume to <a href="mailto:careers@shopera.com" className="text-indigo-600 font-bold underline">careers@shopera.com</a>.
          </p>
        </div>
      ),
    },
    press: {
      title: "News & Press Releases",
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p className="font-bold text-slate-900 dark:text-white">Recent Media Features:</p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900">
              <strong>TechChronicle (Aug 2026):</strong> "How Shopera's real-time rider OTP architecture is eliminating delivery anxiety."
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900">
              <strong>RetailToday (July 2026):</strong> "Next-gen direct-to-consumer platforms set new standards in packaging."
            </li>
          </ul>
        </div>
      ),
    },
    partners: {
      title: "Merchant & Supplier Partnerships",
      icon: Building,
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p>
            Are you a brand manufacturer or verified designer? Partner with Shopera to reach over 500,000 premium lifestyle and tech enthusiasts across India.
          </p>
          <p>
            Reach our partnership desk at <a href="mailto:partners@shopera.com" className="text-indigo-600 font-bold underline">partners@shopera.com</a>.
          </p>
        </div>
      ),
    },
    investors: {
      title: "Investor Relations",
      icon: Building,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p>
            Shopera is backed by leading venture capital firms. For quarterly reports, investor decks, and shareholder communications, please contact <a href="mailto:ir@shopera.com" className="text-indigo-600 font-bold underline">ir@shopera.com</a>.
          </p>
        </div>
      ),
    },
    privacy: {
      title: "Privacy Policy",
      icon: Lock,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p>
            Your privacy is of paramount importance to us. We adhere to stringent end-to-end data encryption and data protection guidelines under the Digital Personal Data Protection Act.
          </p>
          <p>
            We never sell or monetize your personal information. Payment transactions are tokenized and processed via certified PCI-DSS Level 1 compliant payment gateways.
          </p>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      icon: Shield,
      color: "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p>
            By accessing and shopping on Shopera, you agree to our standard terms of use, warranty protections, and acceptable usage criteria.
          </p>
          <p>
            All products sold carry manufacturer warranties and authentic provenance guarantees.
          </p>
        </div>
      ),
    },
    cookies: {
      title: "Cookie & Tracking Policy",
      icon: Shield,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p>
            We use essential session cookies to remember your shopping cart items, selected theme preference (Light/Dark mode), and secure login tokens.
          </p>
        </div>
      ),
    },
    security: {
      title: "Security & Trust Compliance",
      icon: ShieldCheck,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10",
      content: (
        <div className="space-y-3 text-xs leading-relaxed">
          <p>
            Shopera infrastructure is safeguarded with 256-bit TLS/SSL encryption, automated intrusion detection, and isolated database clusters.
          </p>
        </div>
      ),
    },
  };

  const currentModal = activeModal ? modalContent[activeModal] : null;

  return (
    <footer className="relative border-t border-slate-200/80 bg-white text-slate-700 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      {/* 1. TOP TRUST & PERKS HIGHLIGHTS BANNER (Responsive Grid) */}
      <div className="border-b border-slate-200/80 bg-slate-50/70 py-6 sm:py-8 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Perk 1 */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-3.5 sm:p-4 shadow-sm transition hover:border-indigo-500 hover:shadow dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:border-indigo-500/40 dark:hover:bg-slate-900/80">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-600/10 dark:text-indigo-400 dark:border-indigo-500/20">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Free Express Shipping</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">On all orders above ₹1,000</p>
              </div>
            </div>

            {/* Perk 2 */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-3.5 sm:p-4 shadow-sm transition hover:border-emerald-500 hover:shadow dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:border-emerald-500/40 dark:hover:bg-slate-900/80">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-600/10 dark:text-emerald-400 dark:border-emerald-500/20">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">7-Day Easy Returns</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant refunds, no questions asked</p>
              </div>
            </div>

            {/* Perk 3 */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-3.5 sm:p-4 shadow-sm transition hover:border-purple-500 hover:shadow dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:border-purple-500/40 dark:hover:bg-slate-900/80">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-600/10 dark:text-purple-400 dark:border-purple-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">100% Secure Checkout</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">256-Bit Bank-grade encryption</p>
              </div>
            </div>

            {/* Perk 4 */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-3.5 sm:p-4 shadow-sm transition hover:border-amber-500 hover:shadow dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:border-amber-500/40 dark:hover:bg-slate-900/80">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-600/10 dark:text-amber-400 dark:border-amber-500/20">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">24/7 Priority Support</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Dedicated concierge assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN STRUCTURED FOOTER LINKS */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12">
          {/* Column 1: Brand & Contact Info (4 cols) */}
          <div className="space-y-4 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span>Shopera</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 max-w-sm">
              Discover a curated next-generation shopping universe with verified high-tech gadgets,
              premium fashion, and lifestyle essentials with lightning-fast doorstep delivery.
            </p>

            {/* Contact details */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span>Shopera HQ, Tech Park Avenue, Cyber City, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <a href="mailto:support@shopera.com" className="hover:text-indigo-600 dark:hover:text-white transition font-medium">
                  support@shopera.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <a href="tel:+911800123456" className="hover:text-indigo-600 dark:hover:text-white transition font-medium">
                  1800-123-SHOP (Toll-Free 24x7)
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Connect With Us
              </p>
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
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:bg-indigo-600 dark:hover:text-white"
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/?category=electronics" className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Electronics & Audio</span>
                </Link>
              </li>
              <li>
                <Link to="/?category=fashion" className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Fashion & Apparel</span>
                </Link>
              </li>
              <li>
                <Link to="/?category=home" className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Home & Living</span>
                </Link>
              </li>
              <li>
                <Link to="/?category=watches" className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Watches & Tech</span>
                </Link>
              </li>
              <li>
                <Link to="/?sortBy=rating" className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Best Sellers ⭐</span>
                </Link>
              </li>
              <li>
                <Link to="/?sortBy=newest" className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>New Arrivals 🚀</span>
                </Link>
              </li>
              <li>
                <Link to="/?tag=deals" className="text-rose-600 dark:text-amber-400 hover:underline transition flex items-center gap-1.5 font-bold">
                  <ChevronRight className="h-3 w-3 text-rose-500 dark:text-amber-500" />
                  <span>Flash Deals 🔥</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Interactive Modals (2 cols) */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/orders" className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Track Your Order 🚚</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>My Account & Profile</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium">
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Shopping Cart</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("shipping")}
                  className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium text-left"
                >
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Shipping & Delivery</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("returns")}
                  className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium text-left"
                >
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Returns & Refunds</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("faq")}
                  className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium text-left"
                >
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Help & FAQs</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: About Company & Interactive Modals (2 cols) */}
          <div className="space-y-3 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("story")}
                  className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium text-left"
                >
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Our Story & Vision</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("sustainability")}
                  className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium text-left"
                >
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Sustainability</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("careers")}
                  className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium text-left"
                >
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Careers (Hiring)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("press")}
                  className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium text-left"
                >
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>News & Press</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("partners")}
                  className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium text-left"
                >
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Merchant Partners</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("investors")}
                  className="hover:text-indigo-600 dark:hover:text-white transition flex items-center gap-1.5 font-medium text-left"
                >
                  <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  <span>Investor Relations</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: VIP Newsletter (2 cols) */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                VIP Club
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Subscribe to unlock <strong>15% OFF</strong> your first order + early access to flash sales.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>You're subscribed! Code: <strong>SHOPERA15</strong></span>
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-9 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white"
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
      <div className="border-t border-slate-200/80 bg-slate-50/70 py-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          {/* Copyright & Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 text-xs text-slate-500 sm:justify-start">
            <span>© {new Date().getFullYear()} Shopera Inc. All rights reserved.</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveModal("privacy")}
              className="hover:text-slate-900 dark:hover:text-slate-300 transition"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveModal("terms")}
              className="hover:text-slate-900 dark:hover:text-slate-300 transition"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveModal("cookies")}
              className="hover:text-slate-900 dark:hover:text-slate-300 transition"
            >
              Cookies
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveModal("security")}
              className="hover:text-slate-900 dark:hover:text-slate-300 transition"
            >
              Security
            </button>
          </div>

          {/* Payment & Region Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
              title={theme === "dark" ? "Switch to White / Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-600" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {/* Currency Pill */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <Globe className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>🇮🇳 India (INR ₹)</span>
            </div>

            {/* Payment Method Badges */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-400">
              <span className="rounded border border-slate-200 bg-white px-2 py-0.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">VISA</span>
              <span className="rounded border border-slate-200 bg-white px-2 py-0.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">MASTERCARD</span>
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 font-bold dark:border-slate-800 dark:bg-slate-900 dark:text-emerald-400">UPI</span>
              <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-indigo-700 font-bold dark:border-slate-800 dark:bg-slate-900 dark:text-indigo-400">RAZORPAY</span>
              <span className="rounded border border-purple-200 bg-purple-50 px-2 py-0.5 text-purple-700 font-bold dark:border-slate-800 dark:bg-slate-900 dark:text-purple-400">RUPAY</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE INFORMATIONAL MODAL (For Policy & Company links) */}
      {currentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${currentModal.color}`}>
                  <currentModal.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {currentModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 text-slate-600 dark:text-slate-300">
              {currentModal.content}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING BACK TO TOP BUTTON */}
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
