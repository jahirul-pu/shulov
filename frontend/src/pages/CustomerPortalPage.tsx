import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  PackageCheck,
  MapPin,
  CreditCard,
  Settings,
  Sparkles,
  Truck,
  Check,
  Plus,
  Trash2,
  Edit2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Gift,
  PhoneCall,
  Mail,
  Lock,
  ArrowRight,
  Wallet,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const CustomerPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'payments' | 'settings'>('overview');

  // Address State
  const [addresses, setAddresses] = useState([
    { id: 'addr-1', type: 'Home', isDefault: true, details: 'House 42, Road 11, Banani, Dhaka (1213)', phone: '+880 1812-345678' },
    { id: 'addr-2', type: 'Office', isDefault: false, details: 'Level 5, South Breeze Tower, Gulshan-2, Dhaka (1212)', phone: '+880 1711-998877' },
  ]);
  const [newAddressText, setNewAddressText] = useState('');
  const [newAddressType, setNewAddressType] = useState('Home');
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  // Settings State
  const [name, setName] = useState(user?.name || 'Rahim Chowdhury');
  const [phone, setPhone] = useState('+880 1812-345678');
  const [email, setEmail] = useState(user?.email || 'rahim@example.com');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const mockOrders = [
    {
      id: 'SHL-882910-412',
      date: 'Today, 2:30 PM',
      status: 'PROCESSING',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      total: 759.0,
      deliverySlot: 'Today, 4:00 PM - 6:00 PM',
      itemsCount: 3,
      items: [
        { name: 'Organic Red Crisp Apples', weight: '1kg Pack', price: 440.0, qty: 1 },
        { name: 'Farm-Fresh Whole Milk', weight: '1L Bottle', price: 169.0, qty: 1 },
        { name: 'Omega-3 Free Range Eggs', weight: '12 Eggs', price: 150.0, qty: 1 },
      ],
    },
    {
      id: 'SHL-882909-318',
      date: 'Yesterday, 11:15 AM',
      status: 'DELIVERED',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      total: 1240.0,
      deliverySlot: 'Yesterday, 12:00 PM - 2:00 PM',
      itemsCount: 4,
      items: [
        { name: 'Cold-Pressed Olive Oil', weight: '500ml', price: 799.0, qty: 1 },
        { name: 'Artisan Sourdough Bread', weight: '400g', price: 329.0, qty: 1 },
        { name: 'Fresh Cavendish Bananas', weight: '1 Dozen', price: 189.0, qty: 1 },
      ],
    },
    {
      id: 'SHL-882908-102',
      date: '24 Jul 2026',
      status: 'DELIVERED',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      total: 580.0,
      deliverySlot: '24 Jul, 6:00 PM - 8:00 PM',
      itemsCount: 2,
      items: [
        { name: 'Hydroponic Baby Spinach', weight: '250g', price: 199.0, qty: 2 },
        { name: 'Organic Red Crisp Apples', weight: '1kg Pack', price: 381.0, qty: 1 },
      ],
    },
  ];

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;
    setAddresses([
      ...addresses,
      { id: `addr-${Date.now()}`, type: newAddressType, isDefault: false, details: newAddressText, phone },
    ]);
    setNewAddressText('');
    setIsAddAddressOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <div className="py-8 space-y-8 max-w-6xl mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-white flex items-center justify-center font-extrabold text-2xl shadow-soft border-2 border-white/20">
              {name[0] || 'R'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-2xl tracking-tight">{name}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-emerald-300" /> VIP Green Member
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-3">
                <span>{email}</span>
                <span>•</span>
                <span>{phone}</span>
              </p>
            </div>
          </div>

          {/* Quick Member Stats */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-xs">
            <div className="text-center px-3 border-r border-white/10">
              <span className="block font-bold text-slate-300 text-[10px] uppercase">Reward Points</span>
              <span className="font-extrabold text-brand-300 text-base flex items-center justify-center gap-1">
                <Gift className="w-4 h-4 text-brand-400" /> 480 pts
              </span>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <span className="block font-bold text-slate-300 text-[10px] uppercase">Total Orders</span>
              <span className="font-extrabold text-white text-base">14</span>
            </div>
            <div className="text-center px-3">
              <span className="block font-bold text-slate-300 text-[10px] uppercase">Total Saved</span>
              <span className="font-extrabold text-emerald-400 text-base">৳1,250</span>
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'overview'
              ? 'bg-brand-500 text-white shadow-soft'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
              }`}
          >
            <User className="w-4 h-4" /> Overview Dashboard
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'orders'
              ? 'bg-brand-500 text-white shadow-soft'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
              }`}
          >
            <PackageCheck className="w-4 h-4" /> My Orders & Invoices
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'addresses'
              ? 'bg-brand-500 text-white shadow-soft'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
              }`}
          >
            <MapPin className="w-4 h-4" /> Delivery Addresses
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'payments'
              ? 'bg-brand-500 text-white shadow-soft'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
              }`}
          >
            <CreditCard className="w-4 h-4" /> Payment & Wallets
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'settings'
              ? 'bg-brand-500 text-white shadow-soft'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-100'
              }`}
          >
            <Settings className="w-4 h-4" /> Profile Settings
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Active Live Order Tracker Banner */}
              <div className="bg-white rounded-3xl p-6 border border-brand-200 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <h3 className="font-extrabold text-base text-slate-900">Active Order #SHL-882910-412</h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                    PROCESSING & PACKING
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Your organic produce & fresh milk are currently being packed in cold insulated boxes at our Banani Hub.
                </p>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-500 to-amber-500 h-full rounded-full w-2/3 transition-all" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-600" /> Expected Delivery: Today, 4:00 PM - 6:00 PM
                  </span>
                  <Link
                    to="/order-tracking/SHL-882910-412"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl transition-colors"
                  >
                    <span>View Live Rider Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-600" /> Default Delivery Address
                  </h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {addresses.find((a) => a.isDefault)?.details}
                  </p>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className="text-xs font-bold text-brand-600 hover:underline pt-2 inline-block"
                  >
                    Change Default Address →
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-brand-600" /> Default Payment Method
                  </h4>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-extrabold text-xs">
                      bKash
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">bKash Mobile Wallet</span>
                      <span className="text-[11px] text-slate-400 font-medium">+880 1812-345678</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900">Grocery Order History</h3>
                <span className="text-xs font-semibold text-slate-500">{mockOrders.length} orders found</span>
              </div>

              <div className="space-y-4">
                {mockOrders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm">{ord.id}</span>
                        <span className="text-xs text-slate-400 font-medium ml-3">• {ord.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${ord.statusColor}`}>
                          {ord.status}
                        </span>
                        <span className="font-extrabold text-slate-900 text-base">৳{ord.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="space-y-2">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700">
                          <span>
                            <strong className="text-slate-900">{item.qty}x</strong> {item.name} ({item.weight})
                          </span>
                          <span className="font-semibold text-slate-900">৳{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">Slot: {ord.deliverySlot}</span>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/order-tracking/${ord.id}`}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors"
                        >
                          View Status
                        </Link>
                        <button
                          onClick={() => alert(`Re-ordered items from ${ord.id}`)}
                          className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors"
                        >
                          Re-Order Basket
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

              {/* Add Address Modal Form */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white rounded-3xl p-6 border shadow-sm space-y-3 relative ${addr.isDefault ? 'border-brand-500 bg-brand-50/20' : 'border-slate-100'
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
                    <p className="text-[11px] text-slate-400 font-medium">Contact: {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900">Saved Mobile Wallets & Cards</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-3xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base tracking-wider">bKash Merchant Account</span>
                    <Sparkles className="w-5 h-5 opacity-80" />
                  </div>
                  <div>
                    <span className="block text-[11px] opacity-80 uppercase">Linked Wallet</span>
                    <span className="font-mono font-extrabold text-lg">+880 1812-345678</span>
                  </div>
                  <div className="text-[11px] opacity-90 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> 1-Click Instant Payment Authorization
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base tracking-wider">Visa Debit Card</span>
                    <CreditCard className="w-5 h-5 opacity-80" />
                  </div>
                  <div>
                    <span className="block text-[11px] opacity-80 uppercase">Card Number</span>
                    <span className="font-mono font-extrabold text-lg">**** **** **** 4892</span>
                  </div>
                  <div className="text-[11px] opacity-90 flex items-center justify-between">
                    <span>Exp: 09/28</span>
                    <span className="font-bold text-emerald-400">Verified SSL</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-lg text-slate-900">Personal Account Details</h3>
                <p className="text-xs text-slate-500">Update your name, contact email, and password preferences.</p>
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
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                      required
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
