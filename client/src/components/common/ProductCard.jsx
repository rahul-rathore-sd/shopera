import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
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

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (product.hasVariants) {
      // If product has variants, navigate to detail page for selection
      window.location.href = `/product/${product.slug}`;
      return;
    }
    await addToCart(product._id, null, 1);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-lg">
      {/* Product Image Frame */}
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-slate-100"
      >
        <img
          src={primaryImage}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />

        {hasDiscount && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-rose-500 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
            <span className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Metadata */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {product.brand || "Generic"}
        </span>

        <Link
          to={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 hover:text-indigo-600"
        >
          {product.title}
        </Link>

        {/* Rating Section */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="ml-1 text-xs font-bold text-slate-700">
              {product.ratingsAverage > 0 ? product.ratingsAverage.toFixed(1) : "New"}
            </span>
          </div>
          {product.ratingsQuantity > 0 && (
            <span className="text-xs text-slate-400">({product.ratingsQuantity})</span>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900">
              ₹{effectivePrice.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-xs font-medium text-slate-400 line-through">
                ₹{product.basePrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            title={product.hasVariants ? "Select Options" : "Add to Cart"}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}