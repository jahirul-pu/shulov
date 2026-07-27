import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Leaf, ShieldCheck, Truck, RefreshCw, Mail, MapPin, PhoneCall, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 md:pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Features Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Home Delivery All Over Bangladesh</h4>
              <p className="text-xs text-slate-400 mt-0.5">Reliable doorstep delivery everywhere in BD.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Organic Certified</h4>
              <p className="text-xs text-slate-400 mt-0.5">Directly sourced from trusted farms.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Best Price Guarantee</h4>
              <p className="text-xs text-slate-400 mt-0.5">Always fresh at wholesale rates.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">No-Questions Return</h4>
              <p className="text-xs text-slate-400 mt-0.5">Instant refund if not satisfied.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12 border-b border-slate-800 text-xs">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 fill-white/20" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Shulov<span className="text-brand-400">Fresh</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Shulov Fresh is Bangladesh's premier organic grocery store delivering farm-fresh produce, dairy, bakery, meats, and daily household essentials straight to your home all over Bangladesh.
            </p>

            <div className="pt-2 space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Central Hub: House 42, Road 11, Banani, Dhaka</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+880 9612-000000 / support@shulov.com</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Top Categories</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><Link to="/category/fresh-produce" className="hover:text-brand-400 transition-colors">Fresh Fruits & Vegetables</Link></li>
              <li><Link to="/category/dairy-eggs" className="hover:text-brand-400 transition-colors">Milk, Eggs & Butter</Link></li>
              <li><Link to="/category/bakery-snacks" className="hover:text-brand-400 transition-colors">Artisan Bakery & Breads</Link></li>
              <li><Link to="/category/meat-seafood" className="hover:text-brand-400 transition-colors">Fresh Meat & Seafood</Link></li>
              <li><Link to="/category/pantry-oil" className="hover:text-brand-400 transition-colors">Pantry Staples & Cooking Oil</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><Link to="/order-tracking/SHL-882910-412" className="hover:text-brand-400 transition-colors">Track Your Order</Link></li>
              <li><Link to="/cart" className="hover:text-brand-400 transition-colors">Shipping & Delivery Rates</Link></li>
              <li><a href="http://localhost:3002" target="_blank" rel="noreferrer" className="hover:text-brand-400 transition-colors">Store Manager Portal</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">Terms of Service & Privacy</a></li>
              <li><a href="#" className="hover:text-brand-400 transition-colors">FAQs & Support Hub</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Stay Fresh Deals</h4>
            <p className="text-slate-400 mb-3">Subscribe to get secret coupons & weekly organic offers.</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
              <button className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Shulov Fresh Grocery Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for healthy living</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
