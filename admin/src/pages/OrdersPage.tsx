import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, Printer, User, MapPin, ChevronRight, X } from 'lucide-react';
import { io } from 'socket.io-client';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>(mockKanbanOrders);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/orders', {
      headers: { Authorization: `Bearer ${localStorage.getItem('shulov_token') || ''}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orders && data.orders.length > 0) setOrders(data.orders);
      })
      .catch(() => {});

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

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-time Socket Broadcasting Active</span>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((col) => {
          const colOrders = orders.filter((o) => {
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
                      <span className="font-mono font-bold text-slate-900">{ord.orderNumber || ord.id}</span>
                      <span className="font-extrabold text-brand-600">৳{ord.netAmount ? ord.netAmount.toFixed(2) : '345.00'}</span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ord.user ? ord.user.name : 'Valued Customer'}</span>
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
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 h-fit">
                  PAID COD
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800">Customer Details:</span>
                <p>{selectedOrderForInvoice.user?.name || 'Rahim Chowdhury'}</p>
                <p className="text-slate-500">{selectedOrderForInvoice.deliveryAddress || 'Banani, Dhaka'}</p>
              </div>

              <div className="border-t border-b border-slate-100 py-3 space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>1x Organic Red Apples (1kg)</span>
                  <span>৳440.00</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>2x Pasteurized Milk (1L)</span>
                  <span>৳330.00</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>1x Free Range Eggs (12 pcs)</span>
                  <span>৳290.00</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2">
                <span>Total Amount:</span>
                <span className="text-brand-600">৳{selectedOrderForInvoice.netAmount || 1060.00}</span>
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

const mockKanbanOrders = [
  { id: 'SHL-882910-412', orderNumber: 'SHL-882910', status: 'PENDING', netAmount: 34.5, deliveryAddress: 'Banani, Dhaka', user: { name: 'Rahim Chowdhury' } },
  { id: 'SHL-882909-318', orderNumber: 'SHL-882909', status: 'PROCESSING', netAmount: 18.2, deliveryAddress: 'Gulshan-2, Dhaka', user: { name: 'Sabrina Karim' } },
  { id: 'SHL-882908-102', orderNumber: 'SHL-882908', status: 'OUT_FOR_DELIVERY', netAmount: 52.8, deliveryAddress: 'Uttara, Dhaka', user: { name: 'Tanvir Hossain' } },
  { id: 'SHL-882907-994', orderNumber: 'SHL-882907', status: 'DELIVERED', netAmount: 24.9, deliveryAddress: 'Dhanmondi, Dhaka', user: { name: 'Nusrat Jahan' } },
];
