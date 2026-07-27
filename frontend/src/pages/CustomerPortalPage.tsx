import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  PackageCheck,
  MapPin,
  Settings,
  Clock,
  Plus,
  ArrowRight,
  PhoneCall,
  Mail,
  Check,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const CustomerPortalPage: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'settings'>('overview');

  // Real user orders from DB
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Address state derived from real user object
  const [addresses, setAddresses] = useState<Array<{ id: string; type: string; isDefault: boolean; details: string; phone: string }>>(() => {
    if (user?.address) {
      return [{ id: 'addr-main', type: 'Home', isDefault: true, details: user.address, phone: user.phone || '' }];
    }
    return [];
  });

  const [newAddressText, setNewAddressText] = useState('');
  const [newAddressType, setNewAddressType] = useState('Home');
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  // Settings state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(() => (user?.email && !user.email.endsWith('@shulov.user') ? user.email : ''));
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Real-time order fetcher with auto-polling & focus refresh
  const fetchOrders = React.useCallback(async (showLoading = false) => {
    if (!token) return;
    if (showLoading) setIsLoadingOrders(true);

    try {
      const res = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      if (showLoading) setIsLoadingOrders(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders(orders.length === 0);

    // Auto-poll orders every 3 seconds for real-time status updates without manual refresh
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 3000);

    const handleFocus = () => {
      fetchOrders(false);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchOrders, activeTab]);

  // Update profile fields when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email && !user.email.endsWith('@shulov.user') ? user.email : '');

      if (user.address) {
        setAddresses([
          { id: 'addr-main', type: 'Home', isDefault: true, details: user.address, phone: user.phone || '' },
        ]);
      }
    }
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;

    const fullAddr = newAddressText.trim();
    const newAddr = {
      id: `addr-${Date.now()}`,
      type: newAddressType,
      isDefault: true,
      details: fullAddr,
      phone: phone || '',
    };

    setAddresses([newAddr, ...addresses]);
    setNewAddressText('');
    setIsAddAddressOpen(false);

    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: fullAddr,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        updateUser(data.user);
      }
    } catch (err) {
      console.error('Failed to persist new address:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: addresses[0]?.details || '',
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        updateUser(data.user);
        setIsSavedNotice(true);
        setTimeout(() => setIsSavedNotice(false), 2500);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const pendingOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'COMPLETED');
  const displayEmail = user?.email && !user.email.endsWith('@shulov.user') ? user.email : null;

  return (
    <div className="py-8 space-y-8 max-w-6xl mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-soft border-2 border-white/20">
              {name[0] || 'U'}
            </div>
            <div className="space-y-1">
              <h1 className="font-extrabold text-2xl tracking-tight">{name}</h1>
              <p className="text-xs text-slate-300 flex items-center gap-3 flex-wrap">
                {displayEmail && <span>{displayEmail}</span>}
                {displayEmail && user?.phone && <span>•</span>}
                {user?.phone && <span>{user.phone}</span>}
              </p>
            </div>
          </div>

          {/* Real User Order Counter */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-xs">
            <div className="text-center px-3 border-r border-white/10">
              <span className="block font-bold text-slate-300 text-[10px] uppercase">Pending Orders</span>
              <span className="font-extrabold text-amber-400 text-lg">{pendingOrders.length}</span>
            </div>
            <div className="text-center px-3">
              <span className="block font-bold text-slate-300 text-[10px] uppercase">Completed</span>
              <span className="font-extrabold text-emerald-400 text-lg">{completedOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-brand-500 text-white shadow-soft'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <span className="flex items-center gap-3">
              <User className="w-4 h-4" /> Overview Dashboard
            </span>
            {pendingOrders.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-400 text-slate-900">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-brand-500 text-white shadow-soft'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <span className="flex items-center gap-3">
              <PackageCheck className="w-4 h-4" /> My Orders & Invoices
            </span>
            <span className="text-[11px] opacity-80">({completedOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'addresses'
                ? 'bg-brand-500 text-white shadow-soft'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" /> Delivery Addresses
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-brand-500 text-white shadow-soft'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" /> Profile Settings
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          {/* TAB 1: OVERVIEW — Shows ALL Pending / Active Orders */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Active & Pending Orders</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Live tracking for orders currently in progress.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  {pendingOrders.length} Pending
                </span>
              </div>

              {pendingOrders.length > 0 ? (
                <div className="space-y-4">
                  {pendingOrders.map((ord) => (
                    <div key={ord.id} className="bg-white rounded-3xl p-6 border border-brand-200 shadow-sm space-y-4 relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                          <h4 className="font-extrabold text-base text-slate-900">Order #{ord.orderNumber}</h4>
                          <span className="text-xs text-slate-400 font-medium ml-2">
                            • {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                            {ord.status}
                          </span>
                          <span className="font-extrabold text-slate-900 text-base">
                            ৳{ord.netAmount?.toFixed(2) || ord.totalAmount?.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-1.5 pt-1">
                        {ord.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-700">
                            <span>
                              <strong className="text-slate-900">{item.quantity}x</strong> {item.productName} ({item.variantName})
                            </span>
                            <span className="font-semibold text-slate-900">৳{item.totalPrice?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-brand-600" /> Slot: {ord.deliverySlot}
                        </span>
                        <Link
                          to={`/order-tracking/${ord.orderNumber}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl transition-colors"
                        >
                          <span>Track Order</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-brand-600" /> No Pending Orders
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You have no active or pending orders currently. Explore over 5,000+ organic vegetables, fresh milk, daily fruits, and pantry items with express delivery.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl transition-colors mt-2"
                  >
                    <span>Browse Fresh Produce</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Delivery Address Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600" /> Default Delivery Address
                </h4>
                {addresses.length > 0 ? (
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {addresses.find((a) => a.isDefault)?.details || addresses[0].details}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No delivery address saved yet.</p>
                )}
                <button
                  onClick={() => setActiveTab('addresses')}
                  className="text-xs font-bold text-brand-600 hover:underline pt-1 inline-block"
                >
                  Manage Saved Locations →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS — Shows ONLY Completed / Delivered Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Completed Orders & Invoices</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Orders move here once delivered and completed.</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">{completedOrders.length} completed</span>
              </div>

              {isLoadingOrders ? (
                <div className="p-8 text-center text-xs font-bold text-slate-400">Loading your orders...</div>
              ) : completedOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base text-slate-800">No Completed Orders Yet</h4>
                    <p className="text-xs text-slate-500">
                      Once your pending orders are marked as completed or delivered by the store manager, they will appear here with full invoices.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white font-extrabold text-xs rounded-xl shadow-soft hover:bg-brand-600 transition-colors"
                  >
                    View Pending Orders ({pendingOrders.length})
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedOrders.map((ord) => (
                    <div key={ord.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-mono font-bold text-slate-900 text-sm">{ord.orderNumber}</span>
                          <span className="text-xs text-slate-400 font-medium ml-3">
                            • {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 text-xs font-extrabold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                            {ord.status}
                          </span>
                          <span className="font-extrabold text-slate-900 text-base">৳{ord.netAmount?.toFixed(2) || ord.totalAmount?.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-700">
                            <span>
                              <strong className="text-slate-900">{item.quantity}x</strong> {item.productName} ({item.variantName})
                            </span>
                            <span className="font-semibold text-slate-900">৳{item.totalPrice?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-slate-500 font-medium">Slot: {ord.deliverySlot}</span>
                        <Link
                          to={`/order-tracking/${ord.orderNumber}`}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors"
                        >
                          View Invoice & Tracking
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900">Saved Delivery Locations</h3>
                <button
                  onClick={() => setIsAddAddressOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-soft transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              </div>

              {/* Add Address Form */}
              {isAddAddressOpen && (
                <form onSubmit={handleAddAddress} className="bg-brand-50/60 rounded-3xl p-6 border border-brand-200 space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-900">New Address Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Address Label</label>
                      <select
                        value={newAddressType}
                        onChange={(e) => setNewAddressType(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Parents">Parents House</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Street Address</label>
                      <input
                        type="text"
                        placeholder="House / Apartment no, Road no, Area..."
                        value={newAddressText}
                        onChange={(e) => setNewAddressText(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsAddAddressOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-brand-500 text-white text-xs font-extrabold rounded-xl shadow-soft"
                    >
                      Save Location
                    </button>
                  </div>
                </form>
              )}

              {addresses.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 space-y-3">
                  <p className="text-xs text-slate-500">No saved addresses found.</p>
                  <button
                    onClick={() => setIsAddAddressOpen(true)}
                    className="px-4 py-2 bg-brand-500 text-white font-extrabold text-xs rounded-xl"
                  >
                    + Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`bg-white rounded-3xl p-6 border shadow-sm space-y-3 relative ${
                        addr.isDefault ? 'border-brand-500 bg-brand-50/20' : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-brand-600" /> {addr.type}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-brand-500 text-white rounded-full">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">{addr.details}</p>
                      {addr.phone && <p className="text-[11px] text-slate-400 font-medium">Contact: {addr.phone}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900">Personal Account Details</h3>
                <p className="text-xs text-slate-500">Update your name, contact phone, and email preferences.</p>
              </div>

              {isSavedNotice && (
                <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" /> Profile details updated successfully!
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="e.g. rahim@example.com (Optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-soft transition-colors"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
