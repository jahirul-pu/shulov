import React, { useEffect, useState } from 'react';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { FlashDeals } from '../components/home/FlashDeals';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Award, Leaf } from 'lucide-react';
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

      {/* About Us Section */}
      <section className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden space-y-8">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-extrabold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5" />
              <span>About Shulov Fresh</span>
            </div>

            <h2 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              Bringing Farm-Fresh Organic Goodness Direct to Your Home
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Founded with a mission to make 100% chemical-free, organic produce accessible to every household in Bangladesh. We partner directly with over 50+ certified organic farmers across Bogura, Jessore, Sylhet, and Chittagong Hill Tracts to deliver fresh vegetables, pure dairy, raw honey, and pantry staples within hours of harvest.
            </p>

            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10">
              <div>
                <span className="block font-extrabold text-xl sm:text-2xl text-emerald-400">50+</span>
                <span className="text-[11px] font-semibold text-slate-400">Partner Organic Farms</span>
              </div>
              <div>
                <span className="block font-extrabold text-xl sm:text-2xl text-amber-400">100k+</span>
                <span className="text-[11px] font-semibold text-slate-400">Happy Families</span>
              </div>
              <div>
                <span className="block font-extrabold text-xl sm:text-2xl text-sky-400">100%</span>
                <span className="text-[11px] font-semibold text-slate-400">Chemical-Free</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                alt="Organic farming sourcing"
                className="w-full h-64 sm:h-72 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-5 h-5 fill-white/20" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-white">Harvested Daily</h5>
                    <p className="text-[10px] text-slate-300">From farm to kitchen in under 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


