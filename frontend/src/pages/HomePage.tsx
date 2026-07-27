import React, { useEffect, useState } from 'react';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FlashDeals } from '../components/home/FlashDeals';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/all-catalog');
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
          const visible = data.products.filter((p: any) => !p.isHidden);
          setProducts(visible);
          setLoading(false);
          return;
        }
      } catch (e) {}

      try {
        const saved = localStorage.getItem('shulov_shared_products');
        if (saved) {
          const parsed: any[] = JSON.parse(saved);
          const visible = parsed.filter((p) => !p.isHidden);
          setProducts(visible);
          setLoading(false);
          return;
        }
      } catch (e) {}

      setProducts(mockProducts);
      setLoading(false);
    };

    loadHomeProducts();
    window.addEventListener('storage', loadHomeProducts);
    window.addEventListener('products_updated', loadHomeProducts);
    return () => {
      window.removeEventListener('storage', loadHomeProducts);
      window.removeEventListener('products_updated', loadHomeProducts);
    };
  }, []);

  return (
    <div className="space-y-14 py-8">
      {/* Hero Slider */}
      <HeroCarousel />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Flash Deals */}
      <FlashDeals products={products} />

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500 fill-brand-100" />
              <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Fresh Picked for You</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Recommended daily fresh produce based on popular demand.</p>
          </div>
          <Link
            to="/category/fresh-produce"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>



      {/* Freshness Commitment Guarantee */}
      <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-slate-900">100% Freshness Guarantee or Instant Refund</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              If any fruit, vegetable, or dairy item does not meet your freshness standard upon delivery, our rider will replace or refund it on the spot.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Award className="w-5 h-5 text-amber-500" />
            <span>ISO 22000 Certified Hygiene</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <HeartHandshake className="w-5 h-5 text-emerald-500" />
            <span>Direct Farm Sourcing</span>
          </div>
        </div>
      </section>
    </div>
  );
};

// Fallback Mock Data
const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Organic Red Crisp Apples',
    slug: 'organic-red-crisp-apples',
    description: 'Hand-picked crisp red apples directly from mountain orchards.',
    brand: 'Orchard Fresh',
    origin: 'Kashmir',
    isOrganic: true,
    isFlashDeal: true,
    rating: 4.9,
    reviewCount: 48,
    images: JSON.stringify(['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80']),
    categoryId: 'c1',
    variants: [
      { id: 'v1', productId: 'p1', weight: '500g', unit: 'g', price: 2.49, originalPrice: 3.2, stock: 45, sku: 'APP-500G' },
      { id: 'v2', productId: 'p1', weight: '1kg', unit: 'kg', price: 4.49, originalPrice: 5.99, stock: 80, sku: 'APP-1KG' },
    ],
  },
  {
    id: 'p2',
    name: 'Farm-Fresh Whole Pasteurized Milk',
    slug: 'farm-fresh-whole-pasteurized-milk',
    description: '100% pure cow milk homogenised and pasteurized.',
    brand: 'MilkyWay',
    origin: 'Pabna Dairy',
    isOrganic: true,
    isFlashDeal: true,
    rating: 4.85,
    reviewCount: 75,
    images: JSON.stringify(['https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80']),
    categoryId: 'c2',
    variants: [
      { id: 'v3', productId: 'p2', weight: '1 Liter Bottle', unit: 'L', price: 1.69, originalPrice: 2.1, stock: 150, sku: 'MLK-1L' },
    ],
  },
  {
    id: 'p3',
    name: 'Omega-3 Free Range Brown Eggs',
    slug: 'omega-3-free-range-brown-eggs',
    description: 'Fresh brown eggs laid by cage-free hens fed on natural grain.',
    brand: 'Happy Hens',
    origin: 'Sylhet',
    isOrganic: true,
    isFlashDeal: false,
    rating: 4.9,
    reviewCount: 60,
    images: JSON.stringify(['https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=600&q=80']),
    categoryId: 'c2',
    variants: [
      { id: 'v4', productId: 'p3', weight: '12 Eggs Pack', unit: 'pcs', price: 2.99, originalPrice: 3.75, stock: 100, sku: 'EGG-12P' },
    ],
  },
  {
    id: 'p4',
    name: 'Artisan Whole Wheat Sourdough Bread',
    slug: 'artisan-whole-wheat-sourdough-bread',
    description: 'Slow-fermented whole wheat sourdough loaf.',
    brand: 'Bakehouse 42',
    origin: 'In-House Bakery',
    isOrganic: true,
    isFlashDeal: false,
    rating: 4.75,
    reviewCount: 19,
    images: JSON.stringify(['https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80']),
    categoryId: 'c3',
    variants: [
      { id: 'v5', productId: 'p4', weight: '400g Loaf', unit: 'g', price: 3.29, originalPrice: 4.0, stock: 25, sku: 'BRD-400G' },
    ],
  },
];
