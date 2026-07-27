import React from 'react';
import { Link } from 'react-router-dom';
import { Apple, Milk, Cookie, Beef, CupSoda, Wheat, ArrowUpRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const categories = [
    {
      name: 'Fresh Fruits & Veggies',
      slug: 'fresh-produce',
      icon: Apple,
      itemCount: '120+ Items',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
      bgColor: 'bg-emerald-50/70 border-emerald-100 hover:border-emerald-300',
    },
    {
      name: 'Dairy & Eggs',
      slug: 'dairy-eggs',
      icon: Milk,
      itemCount: '85+ Items',
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
      bgColor: 'bg-amber-50/70 border-amber-100 hover:border-amber-300',
    },
    {
      name: 'Bakery & Snacks',
      slug: 'bakery-snacks',
      icon: Cookie,
      itemCount: '90+ Items',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      bgColor: 'bg-orange-50/70 border-orange-100 hover:border-orange-300',
    },
    {
      name: 'Meat & Seafood',
      slug: 'meat-seafood',
      icon: Beef,
      itemCount: '65+ Items',
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
      bgColor: 'bg-rose-50/70 border-rose-100 hover:border-rose-300',
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      icon: CupSoda,
      itemCount: '110+ Items',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
      bgColor: 'bg-sky-50/70 border-sky-100 hover:border-sky-300',
    },
    {
      name: 'Pantry & Oil',
      slug: 'pantry-oil',
      icon: Wheat,
      itemCount: '140+ Items',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      bgColor: 'bg-yellow-50/70 border-yellow-100 hover:border-yellow-300',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Shop by Grocery Category</h2>
          <p className="text-xs text-slate-500 mt-1">Explore our farm-fresh produce and daily household departments.</p>
        </div>
        <Link
          to="/category/fresh-produce"
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
        >
          <span>View All Categories</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className={`p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center group ${cat.bgColor}`}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-soft overflow-hidden p-1 mb-3 group-hover:scale-110 transition-transform">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-full" />
              </div>
              <h3 className="font-bold text-xs text-slate-800 group-hover:text-brand-700 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 mt-1">{cat.itemCount}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
