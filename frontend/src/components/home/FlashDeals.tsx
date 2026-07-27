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
  const displayProducts = (flashProducts.length > 0 ? flashProducts : products).slice(0, 4);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-xl text-slate-900 tracking-tight">Today's Flash Deals</h2>
              <span className="text-[9px] font-extrabold px-2 py-0.5 bg-amber-500 text-white rounded-full uppercase tracking-wider">
                Up to 40% Off
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Limited stock items available at wholesale prices.</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-1.5 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/70 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-bold text-slate-700">Ends in:</span>
          <div className="flex items-center gap-1 font-extrabold text-xs text-amber-700">
            <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-md min-w-[24px] text-center shadow-xs">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-md min-w-[24px] text-center shadow-xs">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-md min-w-[24px] text-center shadow-xs animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Product Cards Grid — Standard 4-column layout matching regular product grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
