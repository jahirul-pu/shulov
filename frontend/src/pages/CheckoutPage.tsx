import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, Wallet, Check, ShieldCheck, Sparkles, ArrowRight, User as UserIcon, PhoneCall, Mail, Truck, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, discountAmount, tax, clearCart, appliedCoupon, setAppliedCoupon } = useCart();
  const { user, token } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(() => (user?.email && !user.email.endsWith('@shulov.user') ? user.email : ''));
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryZone, setDeliveryZone] = useState<'INSIDE_DHAKA' | 'OUTSIDE_DHAKA'>('INSIDE_DHAKA');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD' | 'WALLET'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Delivery settings from Admin API
  const [deliverySettings, setDeliverySettings] = useState({
    insideDhaka: 80,
    outsideDhaka: 120,
    notice: 'Standard delivery: Inside Dhaka ৳80, Outside Dhaka ৳120.',
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/settings/delivery')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setDeliverySettings({
            insideDhaka: data.settings.insideDhaka ?? 80,
            outsideDhaka: data.settings.outsideDhaka ?? 120,
            notice: data.settings.notice || '',
          });
        }
      })
      .catch((err) => console.error('Failed to load delivery settings:', err));
  }, []);

  // Sync user details when auth loads
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerPhone) setCustomerPhone(user.phone || '');
      if (!customerEmail && user.email && !user.email.endsWith('@shulov.user')) setCustomerEmail(user.email);
      if (!deliveryAddress) setDeliveryAddress(user.address || '');
    }
  }, [user]);

  const activeDeliveryFee = deliveryZone === 'OUTSIDE_DHAKA' ? deliverySettings.outsideDhaka : deliverySettings.insideDhaka;
  const computedNetTotal = Math.round((subtotal - discountAmount + activeDeliveryFee + tax) * 100) / 100;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.toUpperCase();
    if (code === 'WELCOME20') {
      const discount = Math.round(subtotal * 0.2 * 100) / 100;
      setAppliedCoupon({ code: 'WELCOME20', discountAmount: discount });
      setCouponSuccess('20% discount applied successfully!');
    } else if (code === 'FRESH5') {
      setAppliedCoupon({ code: 'FRESH5', discountAmount: 50.0 });
      setCouponSuccess('৳50.00 discount applied!');
    } else {
      setCouponError('Invalid coupon code. Try "WELCOME20" or "FRESH5".');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      alert('Please fill out all required fields: Full Name, Phone Number, and Delivery Address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        userId: user?.id,
        items: cart.map((i) => ({ variantId: i.variant.id, quantity: i.quantity })),
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        deliveryZone,
        deliveryFee: activeDeliveryFee,
        deliverySlot: 'Standard Express Dispatch',
        paymentMethod,
      };

      const tokenStr = localStorage.getItem('shulov_token') || '';

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenStr}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      const orderNum = data.order.orderNumber;

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
      setIsSubmitting(false);
      navigate(`/order-tracking/${orderNum}`);
    } catch (err: any) {
      console.error('Order placement failed:', err);
      alert(err.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-4 md:py-8 space-y-6 md:space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">
          <Sparkles className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900">Checkout & Order Confirmation</h1>
          <p className="text-xs text-slate-500">Enter your contact details, select delivery area, and choose payment option.</p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Customer Contact & Address Section */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserIcon className="w-5 h-5 text-brand-600" /> Customer & Shipping Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Jahirul Islam"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="e.g. +880 1900-000000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Address (Optional) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[11px] text-slate-400 font-semibold">(Optional for digital invoice)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="e.g. user@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-1 pt-1">
              <label className="block text-xs font-bold text-slate-700">
                Full Delivery Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={2}
                  placeholder="House number, road number, area / landmark, city..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Zone Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" /> Select Delivery Category / Area
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Inside Dhaka Option */}
              <div
                onClick={() => setDeliveryZone('INSIDE_DHAKA')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  deliveryZone === 'INSIDE_DHAKA'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
                    Dhaka
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Inside Dhaka</h4>
                    <p className="text-[11px] text-slate-500">Metropolitan Express Fleet</p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-emerald-700">৳{deliverySettings.insideDhaka}.00</span>
              </div>

              {/* Outside Dhaka Option */}
              <div
                onClick={() => setDeliveryZone('OUTSIDE_DHAKA')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  deliveryZone === 'OUTSIDE_DHAKA'
                    ? 'border-purple-500 bg-purple-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-xs">
                    BD
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Outside Dhaka</h4>
                    <p className="text-[11px] text-slate-500">Divisional & District Fleet</p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-purple-700">৳{deliverySettings.outsideDhaka}.00</span>
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-600" /> Choose Payment Option
            </h3>

            <div className="space-y-3">
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'COD' ? 'border-brand-500 bg-brand-50/60 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Cash on Delivery (COD)</h4>
                    <p className="text-[11px] text-slate-500">Pay cash or mobile scan upon rider arrival.</p>
                  </div>
                </div>
                {paymentMethod === 'COD' && <Check className="w-5 h-5 text-brand-600" />}
              </div>

              <div
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'CARD' ? 'border-brand-500 bg-brand-50/60 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Credit / Debit Card (Visa, MasterCard)</h4>
                    <p className="text-[11px] text-slate-500">Instant online card payment.</p>
                  </div>
                </div>
                {paymentMethod === 'CARD' && <Check className="w-5 h-5 text-brand-600" />}
              </div>

              <div
                onClick={() => setPaymentMethod('WALLET')}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'WALLET' ? 'border-brand-500 bg-brand-50/60 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Mobile Wallet (bKash / Nagad / Rocket)</h4>
                    <p className="text-[11px] text-slate-500">Instant mobile wallet checkout.</p>
                  </div>
                </div>
                {paymentMethod === 'WALLET' && <Check className="w-5 h-5 text-brand-600" />}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">Order Summary</h3>

            {/* Cart Items List */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto space-y-2 text-xs">
              {cart.map((item) => (
                <div key={item.variant.id} className="flex items-center justify-between pt-2">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.product.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {item.quantity}x {item.variant.weight}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-900">৳{(item.variant.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">৳{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-৳{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>
                  Delivery Charge ({deliveryZone === 'OUTSIDE_DHAKA' ? 'Outside Dhaka' : 'Inside Dhaka'}):
                </span>
                <span className="font-extrabold text-slate-900">৳{activeDeliveryFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>VAT / Tax (5%):</span>
                <span className="font-semibold text-slate-900">৳{tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount:</span>
                <span className="text-brand-600">৳{computedNetTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="pt-1 border-t border-slate-100 space-y-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <div>
                      <span className="text-xs font-extrabold text-emerald-700">{appliedCoupon.code}</span>
                      <p className="text-[11px] text-emerald-600">-৳{appliedCoupon.discountAmount.toFixed(2)} off</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Promo / coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 text-xs font-semibold bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 uppercase tracking-wider"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                  <X className="w-3 h-3" /> {couponError}
                </p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> {couponSuccess}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-soft flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe & Encrypted Grocery Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
