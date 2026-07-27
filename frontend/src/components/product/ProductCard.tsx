import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Minus, Heart, Leaf, Flame, Check } from 'lucide-react';
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
    <div className="group bg-white rounded-2xl p-4 border border-slate-100/90 shadow-card hover:shadow-soft hover:border-brand-200 transition-all duration-300 flex flex-col justify-between relative">
      {/* Badges */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.isOrganic && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60 flex items-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-500 fill-emerald-100" /> Organic
            </span>
          )}
          {product.isFlashDeal && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-300" /> Flash Sale
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-200">
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
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block py-4 overflow-hidden rounded-xl group/img">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-44 object-cover rounded-xl group-hover/img:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Info Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{product.brand}</span>
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            <span className="text-slate-400 text-[10px]">({product.reviewCount})</span>
          </div>
        </div>

        <Link
          to={`/product/${product.slug}`}
          className="font-bold text-sm text-slate-800 hover:text-brand-600 line-clamp-2 leading-snug transition-colors block"
        >
          {product.name}
        </Link>

        {/* Variant Selector */}
        {product.variants.length > 1 ? (
          <select
            value={selectedVariant.id}
            onChange={(e) => {
              const found = product.variants.find((v) => v.id === e.target.value);
              if (found) setSelectedVariant(found);
            }}
            className="w-full py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.weight} — ৳{v.price.toFixed(2)}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-slate-500 font-medium block">Pack: {selectedVariant.weight}</span>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base text-slate-900">
                ৳{selectedVariant.price.toFixed(2)}
              </span>
              {selectedVariant.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ৳{selectedVariant.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {selectedVariant.stock > 0 ? (
              <span className="text-[10px] text-emerald-600 font-bold block">In Stock ({selectedVariant.stock})</span>
            ) : (
              <span className="text-[10px] text-rose-600 font-bold block">Out of Stock</span>
            )}
          </div>

          {selectedVariant.stock <= 0 ? (
            <button
              disabled
              className="px-3 py-1.5 font-extrabold text-xs rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center gap-2 bg-brand-50 rounded-xl border border-brand-200 p-1">
              <button
                onClick={() => updateQuantity(selectedVariant.id, quantityInCart - 1)}
                className="w-6 h-6 rounded-lg bg-white text-brand-700 hover:bg-brand-500 hover:text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-xs text-brand-900 w-4 text-center">
                {quantityInCart}
              </span>
              <button
                onClick={() => updateQuantity(selectedVariant.id, Math.min(selectedVariant.stock, quantityInCart + 1))}
                className="w-6 h-6 rounded-lg bg-white text-brand-700 hover:bg-brand-500 hover:text-white flex items-center justify-center transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className={`px-3.5 py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-50 hover:bg-brand-500 text-brand-700 hover:text-white border border-brand-200/80 hover:border-brand-500'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
