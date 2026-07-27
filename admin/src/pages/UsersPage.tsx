import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShoppingBag,
  DollarSign,
  PhoneCall,
  Mail,
  MapPin,
  X,
  UserCheck,
  Package,
  ArrowUpRight,
  Edit2,
  Check,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  netAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliverySlot: string;
  createdAt: string;
  items: OrderItem[];
}

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address: string;
  createdAt: string;
  totalOrdersCount: number;
  lifetimeSpend: number;
  lastOrderDate: string | null;
  orders: Order[];
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [selectedUserForHistory, setSelectedUserForHistory] = useState<UserData | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editRole, setEditRole] = useState('CUSTOMER');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/admin/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('shulov_token') || ''}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          setUsers(data.users);
        }
      })
      .catch((err) => console.error('Failed to fetch admin users:', err))
      .finally(() => setIsLoading(false));
  };

  const handleOpenEdit = (user: UserData) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditEmail(user.email);
    setEditAddress(user.address);
    setEditRole(user.role);
    setUpdateSuccess('');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdating(true);

    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('shulov_token') || ''}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim(),
          address: editAddress.trim(),
          role: editRole,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUpdateSuccess('User details updated in database!');
        fetchUsers();
        setTimeout(() => {
          setEditingUser(null);
          setUpdateSuccess('');
        }, 1200);
      } else {
        alert(data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Update user error:', err);
      alert('Error connecting to server.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.phone.toLowerCase().includes(query) ||
      u.address.toLowerCase().includes(query);

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate Overall Customer Stats
  const totalUsersCount = users.length;
  const customerCount = users.filter((u) => u.role === 'CUSTOMER').length;
  const totalLifetimeRevenue = users.reduce((sum, u) => sum + u.lifetimeSpend, 0);
  const totalOrdersPlaced = users.reduce((sum, u) => sum + u.totalOrdersCount, 0);
  const activeBuyersCount = users.filter((u) => u.totalOrdersCount > 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-brand-600" /> User Directory & Customer Lifetime Value
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage all registered accounts, edit profile data, and track lifetime purchase histories.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors self-start md:self-auto"
        >
          Refresh User Data 🔄
        </button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total Users</span>
            <Users className="w-5 h-5 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalUsersCount}</div>
          <p className="text-[11px] text-slate-400 font-medium">{customerCount} Customers registered</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total Customer Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">৳{totalLifetimeRevenue.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400 font-medium">From {totalOrdersPlaced} total completed orders</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Active Buyers</span>
            <UserCheck className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{activeBuyersCount}</div>
          <p className="text-[11px] text-slate-400 font-medium">
            {totalUsersCount > 0 ? Math.round((activeBuyersCount / totalUsersCount) * 100) : 0}% repeat/active conversion
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Avg Spend / Buyer</span>
            <ShoppingBag className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ৳{activeBuyersCount > 0 ? (totalLifetimeRevenue / activeBuyersCount).toFixed(2) : '0.00'}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Average lifetime customer value</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="ALL">All Account Roles</option>
            <option value="CUSTOMER">Customers Only</option>
            <option value="ADMIN">Admins Only</option>
            <option value="DRIVER">Drivers Only</option>
          </select>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">Loading user directory...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No registered users found matching your search filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-6">User / Customer</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-center">Total Orders</th>
                  <th className="py-3.5 px-4 text-right">Lifetime Spend</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User Name & Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white font-extrabold flex items-center justify-center text-sm shadow-xs border border-white">
                          {u.name[0] || 'U'}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">{u.name}</span>
                          <span className="text-[11px] text-slate-400 truncate block max-w-[200px]">
                            {u.address || 'No address specified'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-4 space-y-0.5">
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <PhoneCall className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                      {u.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{u.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Role Pill */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : u.role === 'DRIVER'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-slate-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Orders Count */}
                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-900 font-extrabold rounded-lg text-xs">
                        {u.totalOrdersCount}
                      </span>
                    </td>

                    {/* Lifetime Spend */}
                    <td className="py-4 px-4 text-right font-extrabold text-slate-900 text-sm">
                      ৳{u.lifetimeSpend.toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedUserForHistory(u)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-extrabold text-xs rounded-xl transition-colors border border-brand-200/60"
                      >
                        <span>Purchase History</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lifetime Purchase History Drawer / Modal */}
      {selectedUserForHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-extrabold text-lg flex items-center justify-center border-2 border-white/20">
                  {selectedUserForHistory.name[0] || 'U'}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">{selectedUserForHistory.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    {selectedUserForHistory.email && <span>{selectedUserForHistory.email}</span>}
                    {selectedUserForHistory.email && selectedUserForHistory.phone && <span>•</span>}
                    {selectedUserForHistory.phone && <span>{selectedUserForHistory.phone}</span>}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserForHistory(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifetime Summary Ribbon */}
            <div className="bg-brand-50 p-4 border-b border-brand-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="block text-[10px] font-extrabold text-slate-500 uppercase">Joined</span>
                <span className="font-bold text-xs text-slate-900">
                  {new Date(selectedUserForHistory.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="border-x border-brand-200">
                <span className="block text-[10px] font-extrabold text-slate-500 uppercase">Lifetime Orders</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {selectedUserForHistory.totalOrdersCount}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-extrabold text-slate-500 uppercase">Total Lifetime Spend</span>
                <span className="font-extrabold text-emerald-600 text-base">
                  ৳{selectedUserForHistory.lifetimeSpend.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Orders History List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-600" /> Order History Timeline
                </h4>
                <span className="text-xs font-semibold text-slate-500">
                  {selectedUserForHistory.orders.length} orders record(s)
                </span>
              </div>

              {selectedUserForHistory.orders.length === 0 ? (
                <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-200 space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                  <h5 className="font-extrabold text-xs text-slate-700">No Purchases Yet</h5>
                  <p className="text-xs text-slate-400">This customer has not placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedUserForHistory.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 hover:border-brand-300 transition-colors"
                    >
                      {/* Order Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-mono font-extrabold text-slate-900 text-sm">
                            {ord.orderNumber || ord.id}
                          </span>
                          <span className="text-xs text-slate-400 font-medium ml-3">
                            • {new Date(ord.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : ord.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {ord.status}
                          </span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            ৳{(ord.netAmount || ord.totalAmount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-1.5 text-xs text-slate-700">
                        {ord.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span>
                              <strong className="text-slate-900">{item.quantity}x</strong> {item.productName} ({item.variantName})
                            </span>
                            <span className="font-semibold text-slate-900">৳{item.totalPrice?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Details */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {ord.deliveryAddress || 'Address specified at checkout'}
                        </span>
                        <span className="font-bold text-slate-700">Payment: {ord.paymentMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
