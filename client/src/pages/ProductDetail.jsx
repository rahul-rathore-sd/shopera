import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Check,
  Loader2,
  ChevronRight,
  AlertCircle,
  Flame,
  Award,
  Sparkles,
  Tag,
  Clock,
  CheckCircle2,
} from "lucide-react";
import api from "../api/axiosInstance";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();

  // Selected State
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Fetch product data by slug
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await api.get(`/products/slug/${slug}`);
      return res.data.data;
    },
  });

  // Initialize gallery image & variant attributes on product load
  useEffect(() => {
    if (product) {
      const primaryImg =
        product.images?.find((img) => img.isPrimary)?.url ||
        product.images?.[0]?.url ||
        "https://placehold.co/600x600?text=No+Image";
      setSelectedImage(primaryImg);

      if (product.hasVariants && product.variants?.length > 0) {
        // Default to first variant
        const firstVariant = product.variants[0];
        setSelectedVariant(firstVariant);
        setSelectedAttributes(firstVariant.attributes || {});
        if (firstVariant.image?.url) {
          setSelectedImage(firstVariant.image.url);
        }
      }
    }
  }, [product]);

  // Handle variant selection when picking size/color
  const handleAttributeChange = (key, value) => {
    const nextAttributes = { ...selectedAttributes, [key]: value };
    setSelectedAttributes(nextAttributes);

    // Find the matching variant from available variants
    const matched = product.variants.find((v) =>
      Object.entries(nextAttributes).every(
        ([attrKey, attrVal]) => v.attributes[attrKey] === attrVal
      )
    );

    if (matched) {
      setSelectedVariant(matched);
      if (matched.image?.url) {
        setSelectedImage(matched.image.url);
      }
      // Reset quantity if it exceeds variant stock
      if (quantity > matched.stock) {
        setQuantity(1);
      }
    } else {
      setSelectedVariant(null);
    }
  };

  // Derive active price and stock based on variant or base product
  const effectivePrice = selectedVariant
    ? selectedVariant.discountPrice || selectedVariant.price
    : product?.baseDiscountPrice || product?.basePrice;

  const originalPrice = selectedVariant
    ? selectedVariant.discountPrice
      ? selectedVariant.price
      : null
    : product?.baseDiscountPrice
    ? product?.basePrice
    : null;

  const currentStock = selectedVariant
    ? selectedVariant.stock
    : product?.stock || 0;

  const hasDiscount = Boolean(originalPrice && originalPrice > effectivePrice);
  const savings = hasDiscount ? originalPrice - effectivePrice : 0;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;

  // Derive badge tags
  const tags = Array.isArray(product?.tags) ? product.tags.map((t) => t.toLowerCase()) : [];
  const isHotDeal = tags.includes("deals") || discountPercent >= 25;
  const isFlashSale = tags.includes("sale");
  const isBestseller = tags.includes("bestseller") || (product?.ratingsAverage >= 4.8 && product?.ratingsQuantity >= 100);
  const isFeatured = product?.featured || tags.includes("featured");
  const isLowStock = currentStock > 0 && currentStock <= 20;

  // Extract distinct attribute keys and values for selector buttons
  const availableAttributes = {};
  if (product?.hasVariants) {
    product.variants.forEach((v) => {
      Object.entries(v.attributes || {}).forEach(([k, val]) => {
        if (!availableAttributes[k]) availableAttributes[k] = new Set();
        availableAttributes[k].add(val);
      });
    });
  }

  // Handle Add to Cart
  const handleAddToCart = async (redirectToCart = false) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (product.hasVariants && !selectedVariant) {
      setFeedbackMessage({
        type: "error",
        text: "Please select an available variant combination",
      });
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(
        product._id,
        selectedVariant ? selectedVariant._id : null,
        quantity
      );
      setFeedbackMessage({ type: "success", text: "Added to cart successfully!" });

      if (redirectToCart) {
        navigate("/cart");
      }
    } catch (err) {
      setFeedbackMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to add item to cart",
      });
    } finally {
      setIsAdding(false);
      setTimeout(() => setFeedbackMessage(null), 3500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Product Not Found</h2>
        <p className="mt-2 text-slate-500">
          The requested product is unlisted or does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-md"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to={`/?category=${product.category?.slug}`}
          className="hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {product.category?.name || "Catalog"}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-slate-900 dark:text-slate-200">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          {/* Thumbnails list */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-y-auto md:max-h-[520px] scrollbar-thin">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    selectedImage === img.url
                      ? "border-indigo-600 shadow-md ring-2 ring-indigo-100 dark:ring-indigo-950"
                      : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.title} preview ${idx + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Large Main Showcase Image */}
          <div className="relative aspect-square flex-1 overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <img
              src={selectedImage}
              alt={product.title}
              className="h-full w-full object-cover object-center transition-all duration-300"
            />

            {/* Top-Left Clean Badge */}
            <div className="absolute left-4 top-4 z-10">
              {hasDiscount ? (
                <span className="inline-flex items-center rounded-xl bg-rose-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                  {discountPercent}% OFF
                </span>
              ) : isBestseller ? (
                <span className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                  Bestseller
                </span>
              ) : isFeatured ? (
                <span className="inline-flex items-center rounded-xl bg-indigo-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                  Featured
                </span>
              ) : null}
            </div>

            {/* Out of stock banner */}
            {currentStock <= 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
                <span className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-black uppercase tracking-wider text-rose-400 border border-slate-700 shadow-xl">
                  Currently Out of Stock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Information, Badges, Variants & Actions */}
        <div className="flex flex-col">
          {/* Top Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              {product.brand}
            </span>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {product.category?.name}
            </span>
            {isBestseller && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <Award className="h-3 w-3" />
                <span>Bestseller #1</span>
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                <Sparkles className="h-3 w-3" />
                <span>Editor&apos;s Pick</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-white tracking-tight">
            {product.title}
          </h1>

          {/* Ratings & SKU */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 px-2.5 py-1 rounded-lg">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-amber-800 dark:text-amber-300">
                {product.ratingsAverage > 0 ? product.ratingsAverage.toFixed(1) : "4.8"}
              </span>
              <span className="text-xs text-slate-400">
                ({product.ratingsQuantity} customer reviews)
              </span>
            </div>
            {selectedVariant?.sku && (
              <span className="border-l border-slate-200 dark:border-slate-800 pl-4 text-xs text-slate-400">
                SKU: <strong className="text-slate-700 dark:text-slate-300">{selectedVariant.sku}</strong>
              </span>
            )}
          </div>

          {/* Pricing Block with Savings Calculator */}
          <div className="mt-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                ₹{effectivePrice?.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <span className="text-lg font-medium text-slate-400 line-through">
                  ₹{originalPrice?.toLocaleString("en-IN")}
                </span>
              )}
              {hasDiscount && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>You Save ₹{savings.toLocaleString("en-IN")} ({discountPercent}% OFF)</span>
                </span>
              )}
            </div>

            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Inclusive of all GST & taxes • Free delivery available
            </p>

            {/* Promo Banner */}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 px-3 py-1.5 text-xs text-amber-900 dark:text-amber-300">
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>
                Use code <strong className="font-bold underline">SHOPERA15</strong> at checkout for an extra 15% discount!
              </span>
            </div>
          </div>

          {/* Variant Attribute Selectors */}
          {product.hasVariants && Object.keys(availableAttributes).length > 0 && (
            <div className="mt-6 space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
              {Object.entries(availableAttributes).map(([attrKey, attrValues]) => (
                <div key={attrKey}>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Select {attrKey}:{" "}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {selectedAttributes[attrKey]}
                    </span>
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from(attrValues).map((val) => {
                      const isSelected = selectedAttributes[attrKey] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleAttributeChange(attrKey, val)}
                          className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-500"
                              : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Low Stock Urgency */}
          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Quantity
              </span>
              <span
                className={`text-xs font-bold ${
                  currentStock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                }`}
              >
                {currentStock > 0
                  ? `In Stock (${currentStock} available)`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Low stock alert banner */}
            {isLowStock && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Hurry! Only {currentStock} units left in stock.</span>
              </div>
            )}

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <button
                  type="button"
                  disabled={quantity <= 1 || currentStock <= 0}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 rounded-l-xl transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= currentStock || currentStock <= 0}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 rounded-r-xl transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMessage && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-xl p-3.5 text-xs font-bold ${
                feedbackMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
              }`}
            >
              {feedbackMessage.type === "success" ? (
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={currentStock <= 0 || isAdding}
              onClick={() => handleAddToCart(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-indigo-600 bg-white py-3.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 dark:bg-slate-900 dark:hover:bg-indigo-950/40"
            >
              {isAdding ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={currentStock <= 0 || isAdding}
              onClick={() => handleAddToCart(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:shadow-none"
            >
              <Zap className="h-5 w-5" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-6 text-center text-slate-600 dark:text-slate-400">
            <div className="flex flex-col items-center">
              <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">Free Delivery</span>
              <span className="text-[10px] text-slate-400">Orders &gt; ₹1,000</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">7-Day Returns</span>
              <span className="text-[10px] text-slate-400">Hassle-free guarantee</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">100% Genuine</span>
              <span className="text-[10px] text-slate-400">Direct from brands</span>
            </div>
          </div>

          {/* Product Overview Description */}
          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Product Overview & Specifications
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {product.description}
            </p>

            {/* Clickable Product Tags Bar */}
            {tags.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                  <Tag className="h-3 w-3" />
                  <span>Tags:</span>
                </span>
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}