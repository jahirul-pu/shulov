import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, Search, ShoppingBag, User, X, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { MegaMenu } from './MegaMenu';
import { Product } from '../../types';
import { getPrimaryProductImage } from '../../utils/image';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, addToCart, setIsCartOpen } = useCart();
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  // Mobile search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState('');
  const [mobileResults, setMobileResults] = useState<Product[]>([]);
  const [isSearchingMobile, setIsSearchingMobile] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Live mobile search fetch
  useEffect(() => {
    if (!mobileQuery.trim()) {
      setMobileResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingMobile(true);
      try {
        const res = await fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(mobileQuery)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setMobileResults(data.products);
        }
      } catch (err) {
        console.error('Mobile search error:', err);
      } finally {
        setIsSearchingMobile(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [mobileQuery]);

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/category/fresh-produce?search=${encodeURIComponent(mobileQuery)}`);
    }
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Categories', path: '#categories', icon: LayoutGrid, action: () => setIsCategoryDrawerOpen(true) },
    { label: 'Search', path: '#search', icon: Search, action: () => setIsSearchOpen(true) },
    { label: 'Cart', path: '#cart', icon: ShoppingBag, badge: totalCartCount, action: () => setIsCartOpen(true) },
    { label: 'Account', path: '/account', icon: User },
  ];

  return (
    <>
      {/* Category Drawer for Mobile */}
      {isCategoryDrawerOpen && (
        <div className="fixed inset-0 z-[110] md:hidden flex flex-col bg-white">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-brand-400" />
              <h2 className="font-extrabold text-base">All Categories</h2>
            </div>
            <button
              onClick={() => setIsCategoryDrawerOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <MegaMenu isOpen={true} onClose={() => setIsCategoryDrawerOpen(false)} isMobileInline={true} />
          </div>
        </div>
      )}

      {/* Full-Screen Search Modal for Mobile */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[120] md:hidden bg-white flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header Search Form */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
            <form onSubmit={handleMobileSearchSubmit} className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                autoFocus
                placeholder="Search products..."
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-brand-500 rounded-2xl text-xs font-semibold focus:outline-none shadow-xs"
              />
              {mobileQuery && (
                <button
                  type="button"
                  onClick={() => setMobileQuery('')}
                  className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear
                </button>
              )}
            </form>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-slate-500 hover:text-slate-900 font-bold text-xs"
            >
              Cancel
            </button>
          </div>

          {/* Search Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Popular Tags */}
            {!mobileQuery && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {['Apples', 'Milk', 'Eggs', 'Spinach', 'Sourdough', 'Chicken', 'Honey', 'Rice'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setMobileQuery(tag)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isSearchingMobile && (
              <div className="text-center py-6 text-xs text-brand-600 font-bold animate-pulse">
                Searching product catalog...
              </div>
            )}

            {/* Mobile Search Results List */}
            {mobileResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Products Found ({mobileResults.length})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {mobileResults.map((product) => {
                    const img = getPrimaryProductImage(product.images);
                    const mainVariant = product.variants?.[0] || { id: 'v1', weight: '1kg', price: 4.49 };

                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigate(`/product/${product.slug}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <img src={img} alt={product.name} className="w-12 h-12 rounded-xl object-contain border border-slate-100 bg-slate-50" />
                          <div>
                            <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{product.name}</h5>
                            <span className="text-[10px] text-slate-400 font-semibold">{mainVariant.weight} • {product.brand}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-xs text-brand-600">৳{Math.round(mainVariant.price)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, mainVariant, 1);
                            }}
                            className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {mobileQuery && !isSearchingMobile && mobileResults.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">
                No products found matching "{mobileQuery}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Fixed Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 md:hidden shadow-lg pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            const content = (
              <div className="relative flex flex-col items-center justify-center w-full h-full gap-0.5">
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-600' : 'text-slate-500'}`} />
                  {item.badge !== undefined && item.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2 bg-brand-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-brand-600' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </div>
            );

            if (item.action) {
              return (
                <button key={item.label} type="button" onClick={item.action} className="w-full h-full">
                  {content}
                </button>
              );
            }

            return (
              <Link key={item.label} to={item.path} className="w-full h-full">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
