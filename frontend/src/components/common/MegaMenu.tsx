import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Apple, Milk, Cookie, Beef, CupSoda, Wheat, ChevronRight, Sparkles, Tag } from 'lucide-react';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
  'fresh-produce': Apple,
  'dairy-eggs': Milk,
  'bakery-snacks': Cookie,
  'meat-seafood': Beef,
  'beverages': CupSoda,
  'pantry-oil': Wheat,
};

const defaultCategories = [
  {
    name: 'Fresh Fruits & Veggies',
    slug: 'fresh-produce',
    icon: Apple,
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    badge: '100% Organic',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    isActive: true,
    subcategories: [
      'Fresh Fruits',
      'Fresh Vegetables',
      'Organic Salad Greens',
      'Exotic & Seasonal Produce',
    ],
  },
  {
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    icon: Milk,
    iconBg: 'bg-sky-50 text-sky-600 border-sky-200/60',
    badge: 'Farm Fresh',
    badgeBg: 'bg-sky-100 text-sky-800',
    isActive: true,
    subcategories: [
      'Whole Pasteurized Milk',
      'Free Range Farm Eggs',
      'Artisan Butter & Cheese',
      'Fresh Yogurt & Laban',
    ],
  },
  {
    name: 'Bakery & Snacks',
    slug: 'bakery-snacks',
    icon: Cookie,
    iconBg: 'bg-amber-50 text-amber-600 border-amber-200/60',
    badge: 'Baked Daily',
    badgeBg: 'bg-amber-100 text-amber-800',
    isActive: true,
    subcategories: [
      'Artisan Whole Grain Breads',
      'Warm Croissants & Pastries',
      'Cookies & Gourmet Biscuits',
      'Roasted Nuts & Chips',
    ],
  },
  {
    name: 'Meat & Seafood',
    slug: 'meat-seafood',
    icon: Beef,
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200/60',
    badge: '100% Halal',
    badgeBg: 'bg-rose-100 text-rose-800',
    isActive: true,
    subcategories: [
      'Skinless Fresh Chicken',
      'Prime Beef & Mutton Cuts',
      'Fresh Ocean & River Fish',
      'Jumbo Prawns & Seafood',
    ],
  },
  {
    name: 'Beverages & Juices',
    slug: 'beverages',
    icon: CupSoda,
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200/60',
    badge: 'Cold Pressed',
    badgeBg: 'bg-purple-100 text-purple-800',
    isActive: true,
    subcategories: [
      'Cold-Pressed Detox Juices',
      'Organic Green & Black Tea',
      'Roasted Coffee Beans',
      'Sparkling Mineral Water',
    ],
  },
  {
    name: 'Pantry & Oils',
    slug: 'pantry-oil',
    icon: Wheat,
    iconBg: 'bg-orange-50 text-orange-600 border-orange-200/60',
    badge: 'Pure Quality',
    badgeBg: 'bg-orange-100 text-orange-800',
    isActive: true,
    subcategories: [
      'Kalizira & Basmati Rice',
      'Cold-Pressed Mustard Oil',
      'Organic Whole Spices',
      'Pulses & Lentils (Dal)',
    ],
  },
];

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories/megamenu');
        const data = await res.json();
        const parsed = data.categories || [];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = defaultCategories.map((def) => {
            const found = parsed.find((p: any) => p.slug === def.slug);
            if (found) {
              return {
                ...def,
                name: found.name || def.name,
                badge: found.badge || def.badge,
                isActive: found.isActive !== false,
                subcategories: found.subcategories
                  ? found.subcategories.map((s: any) => (typeof s === 'string' ? s : s.name))
                  : def.subcategories,
              };
            }
            return def;
          });
          setCategories(merged);
          return;
        }
      } catch (e) {
        // Fallback to localStorage
      }

      try {
        const saved = localStorage.getItem('shulov_megamenu_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          const merged = defaultCategories.map((def) => {
            const found = parsed.find((p: any) => p.slug === def.slug);
            if (found) {
              return {
                ...def,
                name: found.name || def.name,
                badge: found.badge || def.badge,
                isActive: found.isActive !== false,
                subcategories: found.subcategories
                  ? found.subcategories.map((s: any) => (typeof s === 'string' ? s : s.name))
                  : def.subcategories,
              };
            }
            return def;
          });
          setCategories(merged);
        }
      } catch (e) {}
    };

    if (isOpen) {
      loadConfig();
    }

    loadConfig();
    window.addEventListener('storage', loadConfig);
    window.addEventListener('megamenu_updated', loadConfig);
    return () => {
      window.removeEventListener('storage', loadConfig);
      window.removeEventListener('megamenu_updated', loadConfig);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const visibleCategories = categories.filter((c) => c.isActive !== false);

  return (
    <div
      className="absolute top-full left-0 w-[960px] bg-white shadow-2xl rounded-3xl border border-slate-200/90 z-50 p-7 mt-2 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      onMouseLeave={onClose}
    >
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-lg">
          <Sparkles className="w-5 h-5 text-brand-500 fill-brand-100" />
          <span>Shop by Category</span>
        </div>
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
          <Tag className="w-3.5 h-3.5 text-brand-600" /> All Products Home Delivered All Over Bangladesh
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {visibleCategories.map((cat) => {
          const Icon = cat.icon || iconMap[cat.slug] || Apple;
          return (
            <div
              key={cat.slug}
              className="p-4 rounded-2xl bg-surface-50 border border-slate-100 hover:border-brand-300 hover:shadow-soft transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Category Header */}
                <Link
                  to={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${cat.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-brand-600 transition-colors leading-tight">
                        {cat.name}
                      </h3>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md inline-block mt-0.5 ${cat.badgeBg}`}>
                        {cat.badge}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </Link>

                {/* Subcategory List */}
                <ul className="space-y-1">
                  {cat.subcategories.map((sub) => (
                    <li key={sub}>
                      <Link
                        to={`/category/${cat.slug}?sub=${encodeURIComponent(sub)}`}
                        onClick={onClose}
                        className="text-xs font-semibold text-slate-600 hover:text-brand-700 hover:bg-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between group/sub"
                      >
                        <span>{sub}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover/sub:text-brand-500 transition-all opacity-0 group-hover/sub:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
