import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Minus, Heart, Leaf, Flame, Check, ShoppingCart } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getPrimaryProductImage } from '../../utils/image';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || { id: 'v1', productId: product.id, weight: '1kg', unit: 'kg', price: 4.99, originalPrice: 6.0, stock: 50, sku: 'SKU-1' }
  );
  const [justAdded, setJustAdded] = useState(false);

  const mainImage = getPrimaryProductImage(product.images);

  const cartItem = cart.find((item) => item.variant.id === selectedVariant.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const discountPercent = selectedVariant.originalPrice
    ? Math.round(((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-100 hover:border-brand-200 shadow-xs hover:shadow-soft transition-all duration-300 flex flex-col justify-between relative h-full">
      {/* Top Badges & Wishlist */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1 flex-wrap">
          {product.isOrganic && (
            <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60 flex items-center gap-1">
              <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 fill-emerald-100" /> Organic
            </span>
          )}
          {product.isFlashDeal && (
            <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-300" /> Flash Sale
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-200">
              -{discountPercent}%
            </span>
          )}
        </div>

        <button
          onClick={() => toggleWishlist(product)}
          className={`p-1.5 rounded-full transition-colors ${
            isWishlisted ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-500 hover:bg-slate-50'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Image — Object contain for natural uncropped scaling */}
      <Link to={`/product/${product.slug}`} className="block py-3 overflow-hidden rounded-2xl group/img flex items-center justify-center min-h-[140px] sm:min-h-[170px]">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-36 sm:h-44 object-contain group-hover/img:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Info Section */}
      <div className="space-y-2 mt-auto pt-1">
        {/* Title */}
        <Link
          to={`/product/${product.slug}`}
          className="font-bold text-xs sm:text-sm text-slate-900 hover:text-brand-600 line-clamp-2 leading-snug transition-colors block"
        >
          {product.name}
        </Link>

        {/* Rating & Brand */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
          <span className="font-semibold text-slate-500">{product.brand}</span>
          <div className="flex items-center gap-1 font-bold text-slate-700">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            <span className="text-slate-400 text-[9px] sm:text-[10px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Variant Selector */}
        {product.variants.length > 1 && (
          <select
            value={selectedVariant.id}
            onChange={(e) => {
              const found = product.variants.find((v) => v.id === e.target.value);
              if (found) setSelectedVariant(found);
            }}
            className="w-full py-1 px-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] sm:text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.weight} — ৳{Math.round(v.price).toLocaleString()}
              </option>
            ))}
          </select>
        )}

        {/* Price Tag */}
        <div className="flex items-baseline gap-1.5 pt-0.5">
          <span className="font-extrabold text-base sm:text-lg text-brand-600 tracking-tight">
            ৳{Math.round(selectedVariant.price).toLocaleString()}
          </span>
          {selectedVariant.originalPrice && (
            <span className="text-xs text-slate-400 line-through font-medium">
              ৳{Math.round(selectedVariant.originalPrice).toLocaleString()}
            </span>
          )}
        </div>

        {/* Full-Width Outlined Add To Cart Button */}
        <div className="pt-1.5">
          {selectedVariant.stock <= 0 ? (
            <button
              disabled
              className="w-full py-2 sm:py-2.5 font-extrabold text-xs rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-center"
            >
              Out of Stock
            </button>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center justify-between bg-brand-50 rounded-xl border border-brand-200 p-1">
              <button
                onClick={() => updateQuantity(selectedVariant.id, quantityInCart - 1)}
                className="w-7 h-7 rounded-lg bg-white text-brand-700 hover:bg-brand-500 hover:text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-xs text-brand-900 px-2">
                {quantityInCart} in cart
              </span>
              <button
                onClick={() => updateQuantity(selectedVariant.id, Math.min(selectedVariant.stock, quantityInCart + 1))}
                className="w-7 h-7 rounded-lg bg-white text-brand-700 hover:bg-brand-500 hover:text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`w-full py-2 sm:py-2.5 font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 border active:scale-98 shadow-2xs ${
                justAdded
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-brand-500 text-brand-600 hover:text-white border-brand-500 hover:border-brand-500'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add To Cart
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
