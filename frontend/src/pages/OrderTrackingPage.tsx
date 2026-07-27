import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, PackageCheck, Truck, MapPin, PhoneCall, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { io } from 'socket.io-client';

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<any | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('PROCESSING');
  const [etaMinutes, setEtaMinutes] = useState(14);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    setIsLoading(true);
    fetch(`http://localhost:5000/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          setOrderStatus(data.order.status || 'PROCESSING');
        }
      })
      .catch((err) => console.error('Failed to fetch order details:', err))
      .finally(() => setIsLoading(false));

    // Socket listener for live tracking updates
    const socket = io('http://localhost:5000');
    socket.emit('join-order', orderId);

    socket.on(`order-status-${orderId}`, (data) => {
      if (data.status) setOrderStatus(data.status);
    });

    const interval = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 15000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [orderId]);

  const steps = [
    { key: 'PENDING', label: 'Order Received', icon: Clock, desc: 'We received your grocery order.' },
    { key: 'PROCESSING', label: 'Processing', icon: PackageCheck, desc: 'Order is being checked & packed.' },
    { key: 'HANDED_TO_COURIER', label: 'Handed to Courier', icon: Truck, desc: 'Package handed over to courier fleet.' },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, desc: 'Package handed over to recipient.' },
  ];

  const normalizedStatus =
    orderStatus === 'OUT_FOR_DELIVERY' || orderStatus === 'HANDED_TO_COURIER'
      ? 'HANDED_TO_COURIER'
      : orderStatus === 'PACKED'
      ? 'PROCESSING'
      : orderStatus;

  const currentStepIndex = steps.findIndex((s) => s.key === normalizedStatus);
  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0;

  const customerName = order?.user?.name || 'Valued Customer';
  const customerAddress = order?.deliveryAddress || 'Address specified at checkout';
  const deliverySlot = order?.deliverySlot || 'Today, 4:00 PM - 6:00 PM';
  const items = order?.items || [];
  const totalAmount = order?.netAmount || order?.totalAmount || 0;

  return (
    <div className="py-8 space-y-8 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-brand-500 text-white font-extrabold text-xs rounded-full uppercase flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 fill-white/20" /> Live Express Tracking
          </span>
          <h1 className="font-extrabold text-3xl">Order #{orderId}</h1>
          <p className="text-xs text-slate-300">Guaranteed Fresh Delivery by Shulov Express Fleet</p>
        </div>
      </div>

      {/* Progress Timeline Nodes */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <h2 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-4">Order Progress Status</h2>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= activeStep;

            return (
              <div key={step.key} className="flex-1 flex flex-row md:flex-col items-center gap-4 relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-brand-500 text-white shadow-soft scale-105'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>

                <div className="text-left md:text-center">
                  <h4 className={`font-extrabold text-xs ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-[140px] mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Items & Summary */}
      {items.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShoppingBag className="w-4 h-4 text-brand-600" /> Ordered Items ({items.length})
          </h3>
          <div className="divide-y divide-slate-100 space-y-2 text-xs">
            {items.map((it: any) => (
              <div key={it.id} className="flex justify-between pt-2">
                <span>
                  <strong className="text-slate-900">{it.quantity}x</strong> {it.productName} ({it.variantName})
                </span>
                <span className="font-bold text-slate-900">৳{it.totalPrice?.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-3 border-t border-slate-100">
            <span>Total Paid Amount:</span>
            <span className="text-brand-600">৳{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Driver & Delivery Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-600" /> Assigned Delivery Partner
          </h3>
          <div className="flex items-center justify-between p-4 bg-surface-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center border border-brand-200">
                KA
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">Kamrul Ahmed</h4>
                <p className="text-[11px] text-slate-500">Express Rider #418 (4.95★)</p>
              </div>
            </div>
            <a
              href="tel:+8801700000000"
              className="p-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-soft transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" /> Destination Address
          </h3>
          <div className="p-4 bg-surface-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
            <span className="font-extrabold text-slate-900 block">{customerName}</span>
            <p className="text-slate-600 leading-relaxed">{customerAddress}</p>
            <span className="text-emerald-600 font-bold block pt-1">Slot: {deliverySlot}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
