import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, Heart, User, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { MegaMenu } from './MegaMenu';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { cart, total, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Categories', path: '#categories', icon: LayoutGrid, action: () => setIsCategoryDrawerOpen(true) },
    { label: 'Cart', path: '#cart', icon: ShoppingBag, badge: totalCartCount, action: () => setIsCartOpen(true) },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlist.length },
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
