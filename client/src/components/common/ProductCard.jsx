import { Link } from "react-router-dom";
import { Star, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://placehold.co/400x400?text=No+Image";

  const effectivePrice = product.baseDiscountPrice || product.basePrice;
  const hasDiscount = Boolean(
    product.baseDiscountPrice && product.baseDiscountPrice < product.basePrice
  );
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - product.baseDiscountPrice) / product.basePrice) * 100)
    : 0;

  const isBestseller =
    product.tags?.includes("bestseller") ||
    (product.ratingsAverage >= 4.8 && product.ratingsQuantity >= 100);
  const isFeatured = product.featured;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 15;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (product.hasVariants) {
      window.location.href = `/product/${product.slug}`;
      return;
    }
    await addToCart(product._id, null, 1);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:shadow-lg hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700">
      {/* Product Image Frame */}
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800/80 block"
      >
        <img
          src={primaryImage}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Primary Status Tag (Clean Single Badge) */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1">
          {hasDiscount ? (
            <span className="inline-flex items-center rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          ) : isBestseller ? (
            <span className="inline-flex items-center rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs border border-slate-700">
              Bestseller
            </span>
          ) : isFeatured ? (
            <span className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
              Featured
            </span>
          ) : null}
        </div>

        {/* Low Stock Indicator */}
        {isLowStock && (
          <div className="absolute right-2.5 top-2.5 z-10">
            <span className="inline-flex items-center rounded-md bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 shadow-xs border border-amber-200 dark:bg-slate-900/95 dark:text-amber-400 dark:border-amber-900/50">
              Only {product.stock} left
            </span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px] z-20">
            <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white border border-slate-700">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Metadata Body */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Brand & Rating Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
            {product.brand || "Shopera"}
          </span>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{product.ratingsAverage > 0 ? product.ratingsAverage.toFixed(1) : "4.8"}</span>
            {product.ratingsQuantity > 0 && (
              <span className="text-[10px] text-slate-400">({product.ratingsQuantity})</span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link
          to={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 transition-colors"
          title={product.title}
        >
          {product.title}
        </Link>

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                ₹{effectivePrice.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 line-through">
                  ₹{product.basePrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Save ₹{(product.basePrice - product.baseDiscountPrice).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-600 dark:hover:text-white"
            title={product.hasVariants ? "Select Options" : "Add to Cart"}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}