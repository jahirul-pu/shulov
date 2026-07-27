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
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { parseProductImages, getPrimaryProductImage } from '../utils/image';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, cart, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description');

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${slug}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
          setSelectedVariant(data.product.variants[0]);
          const imgs = parseProductImages(data.product.images);
          setSelectedImage(imgs[0]);
          return;
        }
      } catch (e) {}

      try {
        const saved = localStorage.getItem('shulov_shared_products');
        if (saved) {
          const parsed: any[] = JSON.parse(saved);
          const found = parsed.find((p) => p.slug === slug || p.id === slug);
          if (found) {
            setProduct(found);
            setSelectedVariant(found.variants[0]);
            const imgs = JSON.parse(found.images || '[]');
            setSelectedImage(imgs[0] || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80');
            return;
          }
        }
      } catch (e) {}

      setProduct(fallbackProduct);
      setSelectedVariant(fallbackProduct.variants[0]);
      setSelectedImage('https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80');
    };

    loadDetail();
    window.addEventListener('products_updated', loadDetail);
    return () => window.removeEventListener('products_updated', loadDetail);
  }, [slug]);

  if (!product || !selectedVariant) return <div className="p-12 text-center text-slate-500">Loading product details...</div>;

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
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Brand: <strong className="text-slate-800">{product.brand}</strong></span>
              <span>Origin: <strong className="text-slate-800">{product.origin}</strong></span>
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

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Truck className="w-5 h-5 text-brand-500 shrink-0" />
              <span>Home Delivery All Over Bangladesh</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>100% Quality Replacement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Nutrition, Reviews */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-6 border-b border-slate-100 pb-4">
          <button
            onClick={() => setActiveTab('description')}
            className={`font-extrabold text-sm pb-2 border-b-2 transition-colors ${
              activeTab === 'description' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Product Overview
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
            {/* Reviews List */}
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

            {/* Write a Review */}
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
    </div>
  );
};

const fallbackProduct: Product = {
  id: 'p1',
  name: 'Organic Red Crisp Apples',
  slug: 'organic-red-crisp-apples',
  description: 'Hand-picked crisp red apples directly from organic mountain orchards. Rich in fiber, antioxidant vitamins, and natural sweetness.',
  brand: 'Orchard Fresh',
  origin: 'Kashmir Valley',
  isOrganic: true,
  isFlashDeal: true,
  rating: 4.9,
  reviewCount: 48,
  images: JSON.stringify([
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=600&q=80',
  ]),
  categoryId: 'c1',
  variants: [
    { id: 'v1', productId: 'p1', weight: '500g Pack', unit: 'g', price: 2.49, originalPrice: 3.2, stock: 45, sku: 'APP-500G' },
    { id: 'v2', productId: 'p1', weight: '1kg Pack', unit: 'kg', price: 4.49, originalPrice: 5.99, stock: 80, sku: 'APP-1KG' },
  ],
  reviews: [
    { id: 'r1', productId: 'p1', userId: 'u1', userName: 'Sabrina K.', rating: 5, comment: 'Crispy, sweet, and arrived in under 20 minutes! Super impressed.' },
  ],
};
