import React, { useState } from 'react';
import { Tag, Plus, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState([
    { code: 'WELCOME20', discount: '20% OFF', minOrder: '৳150.00', status: 'Active' },
    { code: 'FRESH5', discount: '৳50.00 Flat', minOrder: '৳250.00', status: 'Active' },
    { code: 'FLASH30', discount: '30% OFF', minOrder: '৳400.00', status: 'Expired' },
  ]);

  const [banners, setBanners] = useState([
    { title: '100% Organic Farm Produce', tag: 'Fresh Deals', status: 'Active', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' },
    { title: 'Artisan Bakery & Morning Dairy', tag: 'Daily Breakfast', status: 'Active', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
  ]);

  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('15% OFF');

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setCoupons([{ code: newCode.toUpperCase(), discount: newDiscount, minOrder: '৳200.00', status: 'Active' }, ...coupons]);
    setNewCode('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">Coupons & Promotional Banners</h1>
        <p className="text-xs text-slate-500 mt-1">Manage marketing discount codes and homepage hero slider banners.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coupons List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-600" /> Active Coupon Engine
            </h3>
          </div>

          <form onSubmit={handleAddCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="New Coupon Code (e.g. SUMMER15)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="flex-1 p-2.5 bg-surface-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create
            </button>
          </form>

          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c.code} className="p-4 rounded-2xl border border-slate-100 bg-surface-50 flex items-center justify-between">
                <div>
                  <span className="font-mono font-extrabold text-slate-900 text-sm block">{c.code}</span>
                  <span className="text-xs text-slate-500">Min Order: {c.minOrder}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-brand-700 text-sm block">{c.discount}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Slider Banners */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-600" /> Homepage Hero Slider Banners
            </h3>
          </div>

          <div className="space-y-4">
            {banners.map((b) => (
              <div key={b.title} className="p-4 rounded-2xl border border-slate-100 bg-surface-50 flex items-center gap-4">
                <img src={b.image} alt={b.title} className="w-20 h-16 rounded-xl object-cover border border-slate-200" />
                <div className="flex-1">
                  <span className="font-bold text-slate-900 text-xs block">{b.title}</span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1 inline-block">
                    {b.tag}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
