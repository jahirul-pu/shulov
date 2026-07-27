import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPrimaryProductImage } from '../../utils/image';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  MapPin,
  ChevronDown,
  LayoutGrid,
  Sparkles,
  X,
  Check,
  Truck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { MegaMenu } from './MegaMenu';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { totalItemCount, subtotal, total, setIsCartOpen, addToCart } = useCart();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('Banani, Dhaka (1213)');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const addresses = [
    'House 42, Road 11, Banani, Dhaka (1213)',
    'Flat 4B, Tower 9, Gulshan-2, Dhaka (1212)',
    'Plot 15, Sector 4, Uttara, Dhaka (1230)',
  ];

  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Live search effect
  React.useEffect(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      // Fetch top 4 catalog items for search recommendation
      fetch('http://localhost:5000/api/products/all-catalog')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.products)) {
            setSearchResults(data.products.filter((p: any) => !p.isHidden).slice(0, 4));
          } else {
            setSearchResults([]);
          }
        })
        .catch(() => setSearchResults([]));
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(() => {
      fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.products && Array.isArray(data.products)) {
            setSearchResults(data.products.filter((p: any) => !p.isHidden));
          } else {
            setSearchResults([]);
          }
        })
        .catch(() => {
          setSearchResults([]);
        })
        .finally(() => setIsSearching(false));
    }, 100);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/category/fresh-produce?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-md transition-all">
      {/* Prominent Free Shipping Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-brand-600 to-emerald-700 text-white text-[11px] sm:text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
        <Truck className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
        <span>
          FREE Express Shipping on all orders over <strong className="underline decoration-amber-300 decoration-2 font-extrabold text-amber-300">৳3,000</strong>!
        </span>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-6">
        <div className="flex items-center justify-center md:justify-start w-full md:w-auto py-0.5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Shulov<span className="text-brand-500">Fresh</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Categories Mega Menu Trigger (Desktop Only) */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100/80 text-brand-800 font-semibold text-xs rounded-xl border border-brand-200/60 transition-all"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-brand-600" />
            <span>All Categories</span>
            <ChevronDown className={`w-3.5 h-3.5 text-brand-600 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
        </div>

        {/* Search Bar (Desktop Only) */}
        <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-xl relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search 5,000+ organic vegetables, milk, fruits, meat..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full pl-3.5 pr-10 py-1.5 bg-surface-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl text-xs transition-all focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
            <button
              type="submit"
              className="absolute right-1 p-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Live Search Results Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-200 z-[100] overflow-hidden max-h-[420px] flex flex-col animate-in fade-in slide-in-from-top-2">
              {/* Popular Search Tags */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400">Popular:</span>
                {['Apples', 'Milk', 'Eggs', 'Spinach', 'Sourdough', 'Chicken'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      setShowSearchDropdown(true);
                    }}
                    className="text-[11px] font-bold px-2 py-0.5 bg-white text-slate-700 hover:bg-brand-500 hover:text-white rounded-md border border-slate-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="px-4 py-1.5 bg-slate-100/60 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <span>{searchQuery ? `Results for "${searchQuery}"` : 'Recommended Products'}</span>
                {isSearching ? (
                  <span className="text-brand-600 font-bold animate-pulse">Searching...</span>
                ) : (
                  <span>{searchResults.length} items found</span>
                )}
              </div>

              <div className="overflow-y-auto divide-y divide-slate-100 p-2">
                {searchResults.length === 0 && !isSearching ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium">
                    No products found matching "{searchQuery}"
                  </div>
                ) : (
                  searchResults.map((product) => {
                    const img = getPrimaryProductImage(product.images);
                    const mainVariant = product.variants?.[0] || { weight: '1kg', price: 4.49 };

                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-50/70 transition-colors group cursor-pointer"
                        onClick={() => {
                          setShowSearchDropdown(false);
                          navigate(`/product/${product.slug}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <img src={img} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
                          <div>
                            <h4 className="font-bold text-xs text-slate-800 group-hover:text-brand-700 transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                              <span>Brand: {product.brand}</span>
                              <span>•</span>
                              <span className="text-slate-600 font-semibold">{mainVariant.weight}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-extrabold text-sm text-brand-700">৳{mainVariant.price.toFixed(2)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, mainVariant, 1);
                            }}
                            className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-[11px] rounded-lg shadow-xs transition-colors"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {searchResults.length > 0 && (
                <button
                  onClick={handleSearchSubmit}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-brand-700 font-extrabold text-xs text-center border-t border-slate-100 transition-colors"
                >
                  View All Search Results ({searchResults.length}+) ↗
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons (Desktop Only) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 relative transition-colors"
            title="Saved Items"
          >
            <Heart className="w-4.5 h-4.5" />
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* User Account */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl hover:bg-slate-100 text-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-extrabold text-xs border border-brand-200">
                {user ? user.name[0] : <UserIcon className="w-3.5 h-3.5 text-slate-600" />}
              </div>
              <div className="text-left hidden lg:block">
                <span className="block text-[10px] text-slate-400 font-medium">
                  {user ? 'Welcome,' : 'Customer Portal'}
                </span>
                <span className="block text-xs font-extrabold text-slate-800 -mt-0.5">
                  {user ? user.name.split(' ')[0] : 'Sign In / Register'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                {user ? (
                  <>
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email || user.phone}</p>
                    </div>
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Account & Orders 🚚
                    </Link>
                    <a
                      href="http://localhost:3002"
                      target="_blank"
                      rel="noreferrer"
                      className="block px-4 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 font-medium transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Admin Web Panel ↗
                    </a>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold border-t border-slate-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">Welcome to Shulov Fresh</p>
                      <p className="text-[11px] text-slate-500">Sign in to track orders & earn rewards</p>
                    </div>
                    <div className="p-2 space-y-1.5">
                      <Link
                        to="/login"
                        className="block w-full py-1.5 text-center bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl transition-colors shadow-xs"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="block w-full py-1.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Create Account
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 p-1.5 px-2.5 rounded-xl hover:bg-slate-100 text-slate-800 transition-colors"
          >
            <div className="relative">
              <ShoppingBag className="w-4.5 h-4.5 text-brand-600" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItemCount}
                </span>
              )}
            </div>
            <div className="text-left border-l border-slate-200 pl-2">
              <span className="block text-[10px] text-slate-400 font-medium">My Cart</span>
              <span className="block text-xs font-extrabold text-slate-800 -mt-0.5">৳{subtotal.toFixed(2)}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Delivery Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" /> Choose Delivery Location
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setIsAddressModalOpen(false);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedAddress === addr
                      ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-xs leading-relaxed">{addr}</span>
                  {selectedAddress === addr && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}
    </header>
  );
};



