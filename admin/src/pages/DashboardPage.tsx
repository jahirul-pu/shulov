import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [kpiData, setKpiData] = useState({
    totalRevenue: 14280.5,
    totalOrders: 412,
    totalProducts: 48,
    pendingOrders: 8,
    lowStockCount: 3,
  });

  const revenueData = [
    { month: 'Mon', revenue: 1420, orders: 42 },
    { month: 'Tue', revenue: 1890, orders: 58 },
    { month: 'Wed', revenue: 2300, orders: 65 },
    { month: 'Thu', revenue: 2100, orders: 61 },
    { month: 'Fri', revenue: 2850, orders: 84 },
    { month: 'Sat', revenue: 3400, orders: 96 },
    { month: 'Sun', revenue: 3100, orders: 88 },
  ];

  const categorySales = [
    { category: 'Fresh Produce', sales: 5800 },
    { category: 'Dairy & Eggs', sales: 3400 },
    { category: 'Bakery & Snacks', sales: 2200 },
    { category: 'Meat & Seafood', sales: 1800 },
    { category: 'Beverages', sales: 1080 },
  ];

  const recentOrders = [
    { id: 'SHL-882910-412', customer: 'Rahim Chowdhury', amount: 34.5, status: 'PROCESSING', time: '10 mins ago' },
    { id: 'SHL-882909-318', customer: 'Sabrina Karim', amount: 18.2, status: 'OUT_FOR_DELIVERY', time: '25 mins ago' },
    { id: 'SHL-882908-102', customer: 'Tanvir Hossain', amount: 52.8, status: 'DELIVERED', time: '1 hour ago' },
    { id: 'SHL-882907-994', customer: 'Nusrat Jahan', amount: 24.9, status: 'DELIVERED', time: '2 hours ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">Store Performance Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time revenue, active orders, and low-stock alerts overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Gross Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-2xl text-slate-900">৳{kpiData.totalRevenue.toFixed(2)}</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Fulfilled Orders</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-2xl text-slate-900">{kpiData.totalOrders}</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +8.5%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Pending Dispatch</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-2xl text-amber-600">{kpiData.pendingOrders}</span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Needs Packing
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Low Stock Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-2xl text-rose-600">{kpiData.lowStockCount}</span>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Restock Needed
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Weekly Sales & Revenue Trend</h3>
              <p className="text-[11px] text-slate-500">Daily breakdown of total store checkout value.</p>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Weekly View
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Sales by Grocery Category</h3>
            <p className="text-[11px] text-slate-500">Highest grossing product departments.</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySales} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: '#475569' }} width={100} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="sales" fill="#059669" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-sm">Recent Storefront Orders</h3>
          <span className="text-xs font-bold text-brand-600 cursor-pointer">View Kanban Board ↗</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{ord.id}</td>
                  <td className="py-3 px-4">{ord.customer}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">৳{ord.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-medium">{ord.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
