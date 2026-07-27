import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Flame } from 'lucide-react';

export const HeroCarousel: React.FC = () => {
  const slides = [
    {
      id: 1,
      title: '100% Certified Organic Farm Produce',
      subtitle: 'Harvested directly from local organic farms & delivered straight to your home all over Bangladesh.',
      tag: 'Fresh Morning Picks',
      discount: 'UP TO 30% OFF',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      link: '/category/fresh-produce',
      bgColor: 'from-emerald-900/90 via-emerald-800/80 to-slate-900/90',
    },
    {
      id: 2,
      title: 'Artisan Morning Bakery & Pure Dairy Milk',
      subtitle: 'Start your morning with fresh pasteurized cow milk and warm whole grain sourdough.',
      tag: 'Daily Breakfast Essentials',
      discount: 'BUY 1 GET 1 FREE',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      link: '/category/dairy-eggs',
      bgColor: 'from-amber-900/90 via-slate-900/80 to-slate-900/90',
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[activeSlide];

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 min-h-[340px] sm:min-h-[380px] md:h-[420px] flex items-center">
      {/* Background Image with Gradient Overlay */}
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-700"
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} backdrop-blur-xs`} />

      {/* Content */}
      <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-8 space-y-4 sm:space-y-5 text-white">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 bg-brand-500 text-white font-extrabold text-[11px] sm:text-xs rounded-full uppercase tracking-wider flex items-center gap-1 shadow-soft">
            <Sparkles className="w-3.5 h-3.5" /> {slide.tag}
          </span>
          <span className="px-3 py-1 bg-amber-400 text-slate-900 font-extrabold text-[11px] sm:text-xs rounded-full uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-slate-900" /> {slide.discount}
          </span>
        </div>

        <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-5xl leading-tight tracking-tight text-white">
          {slide.title}
        </h1>

        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-lg line-clamp-2 sm:line-clamp-none">
          {slide.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2">
          <Link
            to={slide.link}
            className="px-5 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all w-full sm:w-auto"
          >
            <span>Shop Organic Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold sm:pl-2">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Home Delivery All Over BD</span>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            className={`h-2.5 rounded-full transition-all ${
              activeSlide === idx ? 'w-8 bg-brand-400' : 'w-2.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
