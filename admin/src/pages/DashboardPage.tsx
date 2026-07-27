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
  PieChart as PieChartIcon,
  Percent,
  Boxes,
  Sparkles,
  Flame,
  Layers,
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
  const [selectedRange, setSelectedRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalCogs: 0,
    netProfit: 0,
    profitMargin: 0,
    inventoryValuation: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    totalUsers: 0,
  });

  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [topProfitableProducts, setTopProfitableProducts] = useState<any[]>([]);
  const [financialTrends, setFinancialTrends] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = React.useCallback((range: string, showLoading = false) => {
    if (showLoading) setIsLoading(true);
    fetch(`http://localhost:5000/api/admin/analytics?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.kpi) setKpiData(data.kpi);
        if (data.lowStockItems) setLowStockItems(data.lowStockItems);
        if (data.topProfitableProducts) setTopProfitableProducts(data.topProfitableProducts);
        if (data.financialTrends) setFinancialTrends(data.financialTrends);
        if (data.recentUsers) setRecentUsers(data.recentUsers);
        if (data.recentOrders) setRecentOrders(data.recentOrders);
      })
      .catch((err) => console.error('Failed to fetch dashboard analytics:', err))
      .finally(() => {
        if (showLoading) setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchAnalytics(selectedRange, true);

    const interval = setInterval(() => {
      fetchAnalytics(selectedRange, false);
    }, 3000);

    const handleFocus = () => {
      fetchAnalytics(selectedRange, false);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedRange, fetchAnalytics]);

  return (
    <div className="space-y-8">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            Store Performance & Financial Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time profit & loss calculations, supplier cost analysis, inventory asset valuation, and stock controls.
          </p>
        </div>

        {/* Time Range Filter Selector */}
        <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs self-start md:self-auto">
          <span className="text-[11px] font-bold text-slate-400 px-3 uppercase tracking-wider hidden sm:inline">Range:</span>
          {(['today', 'week', 'month', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRange(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all capitalize ${
                selectedRange === r
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
        {/* Product Sales Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Product Sales Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">৳{kpiData.totalRevenue.toFixed(2)}</div>
          <p className="text-[10px] text-slate-400 font-medium">Excludes delivery fees</p>
        </div>

        {/* Cost of Goods Sold (COGS) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Cost of Goods (COGS)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">৳{kpiData.totalCogs.toFixed(2)}</div>
          <p className="text-[10px] text-slate-400 font-medium">Supplier purchase costs</p>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span>Net Profit</span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-400">৳{kpiData.netProfit.toFixed(2)}</div>
          <p className="text-[10px] text-slate-400 font-medium">Sales Revenue - COGS</p>
        </div>

        {/* Profit Margin % */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Net Profit Margin</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-purple-700">{kpiData.profitMargin}%</div>
          <p className="text-[10px] text-slate-400 font-medium">Margin percentage</p>
        </div>

        {/* Inventory Asset Valuation */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Inventory Asset Value</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">৳{kpiData.inventoryValuation.toFixed(2)}</div>
          <p className="text-[10px] text-slate-400 font-medium">Stock at cost value</p>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-amber-900 text-sm">
                Attention: {lowStockItems.length} Product Variant(s) Running Low on Stock (≤ 10 units)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Replenish inventory to prevent customer order cancellations and storefront Out-of-Stock badges.
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            Manage & Restock Inventory →
          </Link>
        </div>
      )}

      {/* Financial Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue vs COGS vs Net Profit Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Financial Profit & Loss Trends</h3>
              <p className="text-[11px] text-slate-500">Comparison of Gross Sales Revenue, COGS, and Net Profit.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Live Financial Report
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialTrends}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCogs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" name="Sales Revenue (৳)" stroke="#059669" strokeWidth={2} fillOpacity={0.1} fill="#059669" />
                <Area type="monotone" dataKey="cogs" name="COGS Cost (৳)" stroke="#f43f5e" strokeWidth={2} fillOpacity={0.2} fill="url(#colorCogs)" />
                <Area type="monotone" dataKey="profit" name="Net Profit (৳)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Profitable Products Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" /> Top Profitable Products
            </h3>
            <p className="text-[11px] text-slate-500">Highest net margin revenue generators.</p>
          </div>

          {topProfitableProducts.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400">
              No sales recorded for profit ranking yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topProfitableProducts.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 block truncate max-w-[150px]">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{p.unitsSold} units sold</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-600 block">+৳{p.netProfit.toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-slate-500">{p.profitMargin}% margin</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
