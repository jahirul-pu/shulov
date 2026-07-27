import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
  Sparkles,
  ExternalLink,
  Bell,
  Search,
  LogOut,
  ShieldCheck,
  LayoutGrid,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Analytics Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Order Dispatch & Kanban', path: '/orders', icon: ShoppingBag, badge: '5 New' },
    { label: 'Products & Inventory', path: '/products', icon: Package },
    { label: 'MegaMenu & Categories', path: '/megamenu', icon: LayoutGrid },
    { label: 'Coupons & Banners', path: '/coupons', icon: Tag },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800 shrink-0">
        <div className="space-y-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-soft">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight">Shulov</span>
              <span className="text-brand-400 font-extrabold text-xl">Admin</span>
              <span className="block text-[9px] text-slate-400 font-bold tracking-widest uppercase -mt-1">
                Store Control Hub
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-soft'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Store Link & Profile */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 text-brand-400 hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            <span>Open Desktop Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-extrabold flex items-center justify-center text-xs">
                AD
              </div>
              <div>
                <span className="font-extrabold text-white block">Manager Hub</span>
                <span className="text-[10px] text-slate-400">admin@shulov.com</span>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search orders, SKUs, customer email, product titles..."
              className="w-full pl-9 pr-4 py-2 bg-surface-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 text-brand-800">
              ● Store Status: Active (15-Min Fleet)
            </span>
          </div>
        </header>

        {/* Body Content */}
        <main className="p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
