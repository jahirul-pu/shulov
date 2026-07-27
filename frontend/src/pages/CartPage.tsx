import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Tag, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getPrimaryProductImage } from '../utils/image';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    tax,
    appliedCoupon,
    setAppliedCoupon,
  } = useCart();

  const FREE_SHIPPING_THRESHOLD = 3000;
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const effectiveDeliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 60;
  const effectiveTotal = Math.max(0, Math.round((subtotal - discountAmount + effectiveDeliveryFee) * 100) / 100);

  const [selectedSlot, setSelectedSlot] = useState('Today, 4:00 PM - 6:00 PM');
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  const slots = [
    'Today, 4:00 PM - 6:00 PM (Standard Delivery)',
    'Today, 7:00 PM - 9:00 PM',
    'Tomorrow Morning, 8:00 AM - 10:00 AM',
    'Tomorrow Afternoon, 12:00 PM - 2:00 PM',
  ];

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.toUpperCase() === 'WELCOME20') {
      const discount = Math.round(subtotal * 0.2 * 100) / 100;
      setAppliedCoupon({ code: 'WELCOME20', discountAmount: discount });
      setCouponMsg('20% Discount applied!');
    } else {
      setCouponMsg('Invalid code. Try WELCOME20');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-extrabold text-2xl text-slate-900">Your Basket is Empty</h2>
        <p className="text-xs text-slate-500">Add fresh organic produce, milk, or bakery treats to view your cart items.</p>
        <Link
          to="/category/fresh-produce"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-soft transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      {/* Free Shipping Banner Tracker */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-3xl border border-emerald-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          {subtotal >= FREE_SHIPPING_THRESHOLD ? (
            <span className="font-extrabold text-emerald-700 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 fill-emerald-500/20 shrink-0" />
              🎉 Congratulations! You've unlocked FREE Express Delivery on this order!
            </span>
          ) : (
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
              Add <strong className="text-emerald-700 font-extrabold">৳{amountNeeded.toFixed(0)}</strong> more in groceries to get <span className="underline decoration-emerald-400 font-extrabold">FREE Shipping</span>!
            </span>
          )}
          <span className="font-extrabold text-emerald-700 text-xs sm:text-sm">{freeShippingPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${freeShippingPercent}%` }}
          />
        </div>
      </div>

      <h1 className="font-extrabold text-3xl text-slate-900 tracking-tight">Shopping Cart & Delivery Slot</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-800 border-b border-slate-100 pb-3">
              Items in Basket ({cart.length})
            </h3>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.variant.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={getPrimaryProductImage(item.product.images)}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{item.product.name}</h4>
                      <span className="text-xs text-slate-500 font-medium">Size: {item.variant.weight}</span>
                      <span className="block text-xs font-extrabold text-slate-900 mt-1">
                        ৳{item.variant.price.toFixed(2)} each
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                        className="text-slate-600 hover:text-brand-600 p-1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-extrabold text-xs text-slate-800 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                        className="text-slate-600 hover:text-brand-600 p-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-extrabold text-sm text-slate-900 w-20 text-right">
                      ৳{(item.variant.price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.variant.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Slot Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600" /> Select Express Delivery Slot
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
                    selectedSlot === slot
                      ? 'border-brand-500 bg-brand-50/60 text-brand-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Side Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-extrabold text-base text-slate-800 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Promo code (e.g. WELCOME20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-bold focus:outline-none focus:border-brand-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Apply
              </button>
            </form>

            {couponMsg && <p className="text-[11px] font-bold text-emerald-600">{couponMsg}</p>}

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">৳{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-৳{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Delivery Fee</span>
                {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                  <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                    FREE SHIPPING
                  </span>
                ) : (
                  <span className="font-bold text-slate-800">৳{effectiveDeliveryFee.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total</span>
                <span className="text-brand-600">৳{effectiveTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm rounded-xl shadow-soft flex items-center justify-center gap-2 group transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Encrypted 256-Bit Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
