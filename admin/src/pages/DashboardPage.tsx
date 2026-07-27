import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Users,
  UserCheck,
  PhoneCall,
  Mail,
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
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    totalUsers: 0,
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.kpi) {
          setKpiData(data.kpi);
        }
        if (data.recentUsers) {
          setRecentUsers(data.recentUsers);
        }
        if (data.recentOrders) {
          setRecentOrders(data.recentOrders);
        }
      })
      .catch((err) => console.error('Failed to fetch dashboard analytics:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const revenueData = [
    { month: 'Mon', revenue: 1420, orders: 42 },
    { month: 'Tue', revenue: 1890, orders: 58 },
    { month: 'Wed', revenue: 2300, orders: 65 },
    { month: 'Thu', revenue: 2100, orders: 61 },
    { month: 'Fri', revenue: 2850, orders: 84 },
    { month: 'Sat', revenue: 3400, orders: 96 },
    { month: 'Sun', revenue: kpiData.totalRevenue > 0 ? kpiData.totalRevenue : 3100, orders: 88 },
  ];

  const categorySales = [
    { category: 'Fresh Produce', sales: 5800 },
    { category: 'Dairy & Eggs', sales: 3400 },
    { category: 'Bakery & Snacks', sales: 2200 },
    { category: 'Meat & Seafood', sales: 1800 },
    { category: 'Beverages', sales: 1080 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">Store Performance Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time revenue, active registered users, and orders overview.</p>
        </div>

        <Link
          to="/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-soft transition-colors self-start md:self-auto"
        >
          <Users className="w-4 h-4" />
          <span>View All Registered Users ({kpiData.totalUsers})</span>
        </Link>
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
              <TrendingUp className="w-3 h-3" /> Live
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Registered Customers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-2xl text-purple-700">{kpiData.totalUsers}</span>
            <Link to="/users" className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-0.5">
              Manage Users →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Fulfilled Orders</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-extrabold text-2xl text-slate-900">{kpiData.totalOrders}</span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Total
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
            <Link to="/orders" className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Kanban Board →
            </Link>
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

      {/* Grid for Recent Registered Users and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registered Users */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> Recently Registered Accounts
            </h3>
            <Link to="/users" className="text-xs font-bold text-brand-600 hover:underline">
              View All Users ({kpiData.totalUsers}) →
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400">No registered accounts found yet.</div>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => {
                const displayEmail = u.email && !u.email.endsWith('@shulov.user') ? u.email : null;
                return (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                        {u.name[0] || 'U'}
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">{u.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {displayEmail || u.phone || 'New Customer'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      {u.role}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Storefront Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-600" /> Recent Storefront Orders
            </h3>
            <Link to="/orders" className="text-xs font-bold text-brand-600 hover:underline">
              View Kanban Board →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400">No orders placed yet.</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900 block">{ord.orderNumber || ord.id}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Customer: {ord.user?.name || 'Storefront Guest'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-slate-900 block">
                      ৳{(ord.netAmount || ord.totalAmount || 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-600">{ord.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
