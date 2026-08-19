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
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
    : 0;

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
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="mt-2 text-slate-500">
          The requested product is unlisted or does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to={`/?category=${product.category?.slug}`}
          className="hover:text-indigo-600"
        >
          {product.category?.name || "Catalog"}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-slate-900">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          {/* Thumbnails list */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-y-auto md:max-h-[500px]">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    selectedImage === img.url
                      ? "border-indigo-600 ring-2 ring-indigo-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.title} view ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Large Main Showcase Image */}
          <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <img
              src={selectedImage}
              alt={product.title}
              className="h-full w-full object-cover object-center transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute left-4 top-4 rounded-md bg-rose-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Information, Variants & Actions */}
        <div className="flex flex-col">
          {/* Brand & Category */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <span>{product.brand}</span>
            <span>•</span>
            <span className="text-slate-500">{product.category?.name}</span>
          </div>

          <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
            {product.title}
          </h1>

          {/* Ratings & SKU */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold text-slate-900">
                {product.ratingsAverage > 0 ? product.ratingsAverage.toFixed(1) : "New"}
              </span>
              <span className="text-slate-400">
                ({product.ratingsQuantity} reviews)
              </span>
            </div>
            {selectedVariant?.sku && (
              <span className="border-l border-slate-200 pl-4 text-xs text-slate-400">
                SKU: <strong className="text-slate-600">{selectedVariant.sku}</strong>
              </span>
            )}
          </div>

          {/* Pricing Block */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">
              ₹{effectivePrice?.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-lg font-medium text-slate-400 line-through">
                ₹{originalPrice?.toLocaleString("en-IN")}
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-600">
              Inclusive of all taxes
            </span>
          </div>

          {/* Variant Attribute Selectors */}
          {product.hasVariants && Object.keys(availableAttributes).length > 0 && (
            <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
              {Object.entries(availableAttributes).map(([attrKey, attrValues]) => (
                <div key={attrKey}>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select {attrKey}:{" "}
                    <span className="font-semibold text-indigo-600">
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
                          className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100"
                              : "border-slate-200 text-slate-700 hover:border-slate-300"
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

          {/* Quantity & Stock Availability */}
          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Quantity
              </span>
              <span
                className={`text-xs font-semibold ${
                  currentStock > 0 ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {currentStock > 0
                  ? `In Stock (${currentStock} available)`
                  : "Out of Stock"}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-slate-200">
                <button
                  type="button"
                  disabled={quantity <= 1 || currentStock <= 0}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= currentStock || currentStock <= 0}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMessage && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-sm ${
                feedbackMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {feedbackMessage.type === "success" ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600" />
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
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 bg-white py-3.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
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
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:shadow-none"
            >
              <Zap className="h-5 w-5" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6 text-center text-slate-600">
            <div className="flex flex-col items-center">
              <Truck className="h-5 w-5 text-indigo-600" />
              <span className="mt-1 text-xs font-semibold">Free Delivery</span>
              <span className="text-[10px] text-slate-400">On orders over ₹1,000</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="h-5 w-5 text-indigo-600" />
              <span className="mt-1 text-xs font-semibold">7-Day Returns</span>
              <span className="text-[10px] text-slate-400">Easy refund process</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <span className="mt-1 text-xs font-semibold">100% Genuine</span>
              <span className="text-[10px] text-slate-400">Verified inventory</span>
            </div>
          </div>

          {/* Long Description */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Product Overview
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}