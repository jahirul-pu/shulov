import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, Wallet, Check, ShieldCheck, Sparkles, ArrowRight, User as UserIcon, PhoneCall, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, total, subtotal, discountAmount, deliveryFee, tax, clearCart } = useCart();
  const { user, token } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(() => (user?.email && !user.email.endsWith('@shulov.user') ? user.email : ''));
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD' | 'WALLET'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if user loads after mount
  React.useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || '');
      if (!customerPhone) setCustomerPhone(user.phone || '');
      if (!customerEmail && user.email && !user.email.endsWith('@shulov.user')) setCustomerEmail(user.email);
      if (!deliveryAddress) setDeliveryAddress(user.address || '');
    }
  }, [user]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      alert('Please fill out all required fields: Full Name, Phone Number, and Delivery Address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: cart.map((i) => ({ variantId: i.variant.id, quantity: i.quantity })),
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        deliverySlot: 'Today, 4:00 PM - 6:00 PM',
        paymentMethod,
      };

      const token = localStorage.getItem('shulov_token') || '';

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order.');
      }

      const orderNum = data.order.orderNumber;

      // Confetti celebration
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
    <div className="py-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
          <Sparkles className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900">Checkout & Order Confirmation</h1>
          <p className="text-xs text-slate-500">Enter your contact details, delivery address, and choose payment option.</p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Customer Contact & Address Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
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
                    placeholder="e.g. Rahim Chowdhury"
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
                    placeholder="e.g. +880 1700-000000"
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
                <span className="text-[11px] font-normal text-slate-400 font-semibold">(Optional for digital invoice)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="e.g. rahim@example.com"
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
                    <p className="text-[11px] text-slate-500">Instant 256-bit SSL encrypted online payment.</p>
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
                    <p className="text-[11px] text-slate-500">Scan QR code for instant merchant payment.</p>
                  </div>
                </div>
                {paymentMethod === 'WALLET' && <Check className="w-5 h-5 text-brand-600" />}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Submit */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-800 border-b border-slate-100 pb-3">Final Breakdown</h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between"><span>Items Subtotal</span><span className="font-bold text-slate-800">৳{subtotal.toFixed(2)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-emerald-600 font-bold"><span>Discount</span><span>-৳{discountAmount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span>Delivery Fee</span><span className="font-bold text-slate-800">৳{deliveryFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="text-brand-600">৳{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-extrabold text-sm rounded-2xl shadow-soft flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Grocery Order'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Backed by Shulov Fresh Guarantee</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
