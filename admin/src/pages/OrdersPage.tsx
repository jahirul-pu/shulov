import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, Printer, User, MapPin, ChevronRight, X, PhoneCall } from 'lucide-react';
import { io } from 'socket.io-client';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch((err) => console.error('Failed to fetch admin orders:', err));

    const socket = io('http://localhost:5000');
    socket.on('new-order', (newOrd) => {
      setOrders((prev) => [newOrd, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('shulov_token') || ''}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to persist order status update:', err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedTimeRange === 'all') return true;
    if (!o.createdAt) return true;
    const orderDate = new Date(o.createdAt);
    const now = new Date();

    if (selectedTimeRange === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return orderDate >= todayStart;
    }
    if (selectedTimeRange === 'week') {
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= weekStart;
    }
    if (selectedTimeRange === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return orderDate >= monthStart;
    }
    return true;
  });

  const columns = [
    { key: 'PENDING', title: 'Order Received', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { key: 'PROCESSING', title: 'Processing', color: 'bg-sky-50 text-sky-800 border-sky-200' },
    { key: 'HANDED_TO_COURIER', title: 'Handed to Courier', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    { key: 'DELIVERED', title: 'Delivered', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">Order Fulfillment Kanban</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time status workflow for packing, rider dispatch and delivery.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter Buttons */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">Filter:</span>
            {(['today', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all capitalize ${
                  selectedTimeRange === range
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Broadcasting</span>
          </div>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colOrders = filteredOrders.filter((o) => {
            if (col.key === 'HANDED_TO_COURIER') {
              return o.status === 'HANDED_TO_COURIER' || o.status === 'OUT_FOR_DELIVERY';
            }
            if (col.key === 'PROCESSING') {
              return o.status === 'PROCESSING' || o.status === 'PACKED';
            }
            return o.status === col.key;
          });

          return (
            <div key={col.key} className="bg-slate-100/60 p-4 rounded-3xl border border-slate-200/80 space-y-4 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-extrabold text-slate-500">{colOrders.length}</span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-slate-900">{ord.orderNumber || ord.id}</span>
                        {ord.paymentStatus === 'PAID' ? (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 uppercase">
                            PAID
                          </span>
                        ) : ord.paymentMethod === 'COD' ? (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200 uppercase">
                            COD
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200 uppercase">
                            UNPAID
                          </span>
                        )}
                      </div>
                      <span className="font-extrabold text-brand-600">৳{ord.netAmount ? ord.netAmount.toFixed(2) : '0.00'}</span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ord.user ? ord.user.name : (ord.customerName || 'Valued Customer')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                        <PhoneCall className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>{ord.user?.phone || ord.customerPhone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ord.deliveryAddress || 'Banani, Dhaka'}</span>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <select
                        value={ord.status === 'OUT_FOR_DELIVERY' ? 'HANDED_TO_COURIER' : ord.status === 'PACKED' ? 'PROCESSING' : ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        className="text-[11px] font-bold py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        <option value="PENDING">Order Received</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="HANDED_TO_COURIER">Handed to Courier</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>

                      <button
                        onClick={() => setSelectedOrderForInvoice(ord)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-lg">Packing Slip & Invoice</h3>
              <button onClick={() => setSelectedOrderForInvoice(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="font-mono font-bold text-slate-900 block text-sm">
                    #{selectedOrderForInvoice.orderNumber || selectedOrderForInvoice.id}
                  </span>
                  <span className="text-slate-400">Date: {new Date().toLocaleDateString()}</span>
                </div>
                {selectedOrderForInvoice.paymentStatus === 'PAID' ? (
                  <span className="font-extrabold text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 h-fit uppercase">
                    PAID
                  </span>
                ) : selectedOrderForInvoice.paymentMethod === 'COD' ? (
                  <span className="font-extrabold text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 h-fit uppercase">
                    COD
                  </span>
                ) : (
                  <span className="font-extrabold text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 h-fit uppercase">
                    UNPAID
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-extrabold text-slate-900 block border-b border-slate-100 pb-1 uppercase tracking-wider text-[10px]">Customer Details:</span>
                <p className="font-bold text-slate-900">Name: {selectedOrderForInvoice.user?.name || selectedOrderForInvoice.customerName || 'Customer'}</p>
                <p className="font-bold text-slate-900">Phone: {selectedOrderForInvoice.user?.phone || selectedOrderForInvoice.customerPhone || 'N/A'}</p>
                <p className="font-bold text-slate-900">Address: {selectedOrderForInvoice.deliveryAddress || 'Dhaka, Bangladesh'}</p>
              </div>

              <div className="border-t border-b border-slate-100 py-3 space-y-2 max-h-48 overflow-y-auto">
                {selectedOrderForInvoice.items && selectedOrderForInvoice.items.length > 0 ? (
                  selectedOrderForInvoice.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between font-semibold text-slate-800 text-xs">
                      <span>
                        {item.quantity}x {item.productName || 'Grocery Item'} ({item.variantName || 'Pack'})
                      </span>
                      <span>৳{(item.totalPrice || item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 font-medium">Standard Grocery Items Package</div>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-slate-800">৳{(selectedOrderForInvoice.totalAmount || 0).toFixed(2)}</span>
                </div>
                {selectedOrderForInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>-৳{selectedOrderForInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold text-slate-800">৳{(selectedOrderForInvoice.deliveryFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-brand-600">৳{(selectedOrderForInvoice.netAmount || selectedOrderForInvoice.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Packing Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
