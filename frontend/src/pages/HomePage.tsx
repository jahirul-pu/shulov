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
        if (Array.isArray(data.products)) {
          const visible = data.products.filter((p: any) => !p.isHidden);
          setProducts(visible);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to load home products:', e);
      }
      setLoading(false);
    };

    loadHomeProducts();
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
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">No Products Available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              The product catalog is currently empty. Add products from the Admin Panel to feature them here.
            </p>
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


