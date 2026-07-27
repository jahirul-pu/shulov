import React, { useState, useEffect } from 'react';
import { Flame, Clock, Sparkles } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { Product } from '../../types';

interface FlashDealsProps {
  products: Product[];
}

export const FlashDeals: React.FC<FlashDealsProps> = ({ products }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.filter((p) => p.isFlashDeal || p.variants.some((v) => v.originalPrice));

  return (
    <section className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-emerald-500/10 rounded-3xl p-8 border border-amber-200/80 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Flame className="w-7 h-7 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Today's Flash Deals</h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-amber-500 text-white rounded-full uppercase tracking-wider">
                Up to 40% Off
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">Limited stock items available at wholesale prices.</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-200 shadow-sm">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-700">Ends in:</span>
          <div className="flex items-center gap-1 font-extrabold text-sm text-amber-700">
            <span className="px-2 py-1 bg-amber-500 text-white rounded-lg min-w-[28px] text-center shadow-xs">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="px-2 py-1 bg-amber-500 text-white rounded-lg min-w-[28px] text-center shadow-xs">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="px-2 py-1 bg-amber-500 text-white rounded-lg min-w-[28px] text-center shadow-xs animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {flashProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
