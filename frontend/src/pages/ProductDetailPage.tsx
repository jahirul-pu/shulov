import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  Leaf,
  ShieldCheck,
  ChevronRight,
  Heart,
  MessageSquare,
  Sparkles,
  Check,
  Flame,
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { parseProductImages, getPrimaryProductImage } from '../utils/image';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, cart, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch catalog for Relevant & Popular recommendation sections
    fetch('http://localhost:5000/api/products/all-catalog')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) setAllProducts(data.products);
      })
      .catch(() => {});

    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/products/${slug}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
          setSelectedVariant(data.product.variants?.[0] || null);
          const imgs = parseProductImages(data.product.images);
          setSelectedImage(imgs[0]);
          setLoading(false);
          return;
        }
      } catch (e) {}

      setProduct(null);
      setLoading(false);
    };

    loadDetail();
    window.addEventListener('products_updated', loadDetail);
    return () => window.removeEventListener('products_updated', loadDetail);
  }, [slug]);

  if (loading) return <div className="py-24 text-center text-slate-500 font-semibold text-sm">Loading product details...</div>;

  if (!product || !selectedVariant) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-extrabold text-2xl text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested product is not available in the store catalog.
        </p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl transition-colors">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const images = parseProductImages(product.images);

  const cartItem = cart.find((i) => i.variant.id === selectedVariant.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setReviewSuccess(true);
    setTimeout(() => {
      setNewComment('');
      setReviewSuccess(false);
    }, 2000);
  };

  const relevantProducts = allProducts
    .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.category?.name === product.category?.name))
    .slice(0, 4);

  const fallbackRelevant = relevantProducts.length > 0
    ? relevantProducts
    : allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const popularProducts = allProducts
    .filter((p) => p.id !== product.id && (p.isFlashDeal || p.rating >= 4.7))
    .slice(0, 4);

  const fallbackPopular = popularProducts.length > 0
    ? popularProducts
    : allProducts.filter((p) => p.id !== product.id && !fallbackRelevant.some((r) => r.id === p.id)).slice(0, 4);

  return (
    <div className="py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/category/fresh-produce" className="hover:text-brand-600">Fresh Produce</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-800">{product.name}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
            />
            {product.isOrganic && (
              <span className="absolute top-4 left-4 text-xs font-extrabold px-3 py-1 bg-emerald-500 text-white rounded-full flex items-center gap-1 shadow-md">
                <Leaf className="w-3.5 h-3.5 fill-white/20" /> 100% Organic Certified
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImage === img ? 'border-brand-500 shadow-sm scale-95' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: PDP Info */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Brand: <strong className="text-slate-800">{product.brand || 'Shulov Fresh'}</strong></span>
              <span>Origin: <strong className="text-slate-800">{product.origin || 'Bangladesh'}</strong></span>
            </div>
            <h1 className="font-extrabold text-3xl text-slate-900 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 font-bold text-sm text-slate-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 text-xs font-medium">({product.reviewCount} customer reviews)</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                In Stock — Home Delivery All Over Bangladesh
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-surface-50 rounded-2xl border border-slate-100 flex items-baseline gap-3">
            <span className="font-extrabold text-3xl text-slate-900">৳{selectedVariant.price.toFixed(2)}</span>
            {selectedVariant.originalPrice && (
              <span className="text-sm font-semibold text-slate-400 line-through">
                ৳{selectedVariant.originalPrice.toFixed(2)}
              </span>
            )}
            {selectedVariant.originalPrice && (
              <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 ml-auto">
                Save ৳{(selectedVariant.originalPrice - selectedVariant.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Product Overview Box in Top Section */}
          <div className="bg-surface-50 p-4 rounded-2xl border border-slate-200/70 space-y-2.5">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" /> Product Overview
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {product.description || 'Sourced fresh daily from local Bangladeshi farms & partner orchards with 100% freshness guarantee.'}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] font-semibold text-slate-700">
              <div><span className="text-slate-400">Category:</span> <strong className="text-slate-900">{product.category?.name || 'Fresh Produce'}</strong></div>
              <div><span className="text-slate-400">Brand:</span> <strong className="text-slate-900">{product.brand || 'Shulov Fresh'}</strong></div>
              <div><span className="text-slate-400">Origin:</span> <strong className="text-slate-900">{product.origin || 'Bangladesh'}</strong></div>
              <div><span className="text-slate-400">Quality:</span> <strong className="text-emerald-600">{product.isOrganic ? '100% Organic' : 'Premium Fresh'}</strong></div>
            </div>
          </div>

          {/* Variant Selector Tabs */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Package Weight / Size:
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                    selectedVariant.id === v.id
                      ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {v.weight} — ৳{v.price.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-3 bg-slate-100 rounded-2xl p-1.5 border border-slate-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 hover:bg-brand-500 hover:text-white flex items-center justify-center transition-colors font-bold shadow-xs"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-sm text-slate-800 w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 hover:bg-brand-500 hover:text-white flex items-center justify-center transition-colors font-bold shadow-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => addToCart(product, selectedVariant, quantity)}
              className="flex-1 py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-extrabold text-sm rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add {quantity} to Cart</span>
            </button>

            <button
              onClick={() => product && toggleWishlist(product)}
              className={`p-3.5 rounded-2xl border transition-colors ${
                isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'
              }`}
              title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Product Description, Nutrition, Customer Reviews */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-6 border-b border-slate-100 pb-4">
          <button
            onClick={() => setActiveTab('description')}
            className={`font-extrabold text-sm pb-2 border-b-2 transition-colors ${
              activeTab === 'description' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`font-extrabold text-sm pb-2 border-b-2 transition-colors ${
              activeTab === 'nutrition' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Nutritional Information
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`font-extrabold text-sm pb-2 border-b-2 transition-colors ${
              activeTab === 'reviews' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Customer Reviews ({product.reviewCount})
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="prose max-w-none text-slate-600 text-sm leading-relaxed space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Product Description</h3>
            <p>{product.description}</p>
            <div className="bg-surface-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Storage & Handling Instructions</h4>
              <p className="text-xs">
                Keep refrigerated between 2°C and 4°C. Consume within 5 days of opening for optimal crispness and flavor. Wash thoroughly under running cold water before eating.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="max-w-md space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Nutritional Values (Per 100g serving)</h4>
            <div className="space-y-2 text-xs border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <div className="flex justify-between py-1 border-b border-slate-200"><span>Calories</span><span className="font-bold">52 kcal</span></div>
              <div className="flex justify-between py-1 border-b border-slate-200"><span>Dietary Fiber</span><span className="font-bold">2.4 g</span></div>
              <div className="flex justify-between py-1 border-b border-slate-200"><span>Natural Sugars</span><span className="font-bold">10.3 g</span></div>
              <div className="flex justify-between py-1 border-b border-slate-200"><span>Vitamin C</span><span className="font-bold">14% DV</span></div>
              <div className="flex justify-between py-1"><span>Potassium</span><span className="font-bold">107 mg</span></div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-surface-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{r.userName}</span>
                      <span className="text-slate-400">Verified Buyer</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No reviews yet for this product. Be the first to leave one!</p>
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 max-w-lg">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-600" /> Write a Customer Review
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Share details of your experience regarding freshness, taste and packaging..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
              />

              {reviewSuccess && (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Thank you! Your review has been published.
                </p>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Relevant Products Section */}
      {fallbackRelevant.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h2 className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" /> Relevant Products
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Similar items in the grocery catalog</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {fallbackRelevant.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Products Section */}
      {fallbackPopular.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h2 className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" /> Popular Products
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Customer favorites & top-trending items</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {fallbackPopular.map((popProd) => (
              <ProductCard key={popProd.id} product={popProd} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


