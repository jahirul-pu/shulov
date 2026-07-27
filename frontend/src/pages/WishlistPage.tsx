import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const WishlistPage: React.FC = () => {
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <Heart className="w-10 h-10 fill-rose-500/20" />
        </div>
        <h2 className="font-extrabold text-2xl text-slate-900">Your Saved Items is Empty</h2>
        <p className="text-xs text-slate-500">
          Save your favorite organic fruits, daily milk, or artisan breads to quickly re-order them anytime.
        </p>
        <Link
          to="/category/fresh-produce"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-soft transition-colors"
        >
          Explore Fresh Grocery
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-3xl text-slate-900 tracking-tight">Saved Favorites</h1>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                {wishlist.length} items
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Quickly access and add your favorite daily groceries to cart.</p>
          </div>
        </div>

        <button
          onClick={clearWishlist}
          className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Trash2 className="w-4 h-4" /> Clear All Saved
        </button>
      </div>

      {/* Saved Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const images = JSON.parse(product.images || '[]');
          const img = images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
          const mainVariant = product.variants[0] || { weight: '1kg', price: 440.0, originalPrice: 500.0 };

          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-card hover:shadow-soft transition-all duration-300 flex flex-col justify-between relative group"
            >
              {/* Remove Button */}
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors z-10"
                title="Remove from saved"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                {/* Image */}
                <Link to={`/product/${product.slug}`} className="block py-2 overflow-hidden rounded-2xl">
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-44 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Details */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{product.brand}</span>
                    <div className="flex items-center gap-1 font-bold text-slate-700">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <Link
                    to={`/product/${product.slug}`}
                    className="font-bold text-sm text-slate-900 hover:text-brand-600 line-clamp-2 leading-snug transition-colors block"
                  >
                    {product.name}
                  </Link>

                  <span className="text-xs text-slate-500 font-semibold block">Pack: {mainVariant.weight}</span>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-base text-slate-900">৳{mainVariant.price.toFixed(2)}</span>
                  {mainVariant.originalPrice && (
                    <span className="text-xs text-slate-400 line-through font-medium">
                      ৳{mainVariant.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => addToCart(product, mainVariant, 1)}
                  className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-soft flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
