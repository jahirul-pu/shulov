import React, { useState, useEffect } from 'react';
import { Tag, Plus, Check, Edit2, Trash2, Calendar, Clock, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface CouponData {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  validUntil: string;
  isActive: boolean;
}

export const CouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponData | null>(null);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderValue, setMinOrderValue] = useState<number>(200);
  const [validUntil, setValidUntil] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
    // Default validUntil to 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setValidUntil(d.toISOString().slice(0, 16));
  }, []);

  const fetchCoupons = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/admin/coupons')
      .then((res) => res.json())
      .then((data) => {
        if (data.coupons) {
          setCoupons(data.coupons);
        }
      })
      .catch((err) => console.error('Failed to fetch coupons:', err))
      .finally(() => setIsLoading(false));
  };

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(15);
    setMinOrderValue(200);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setValidUntil(d.toISOString().slice(0, 16));
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CouponData) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType as any);
    setDiscountValue(c.discountValue);
    setMinOrderValue(c.minOrderValue);
    setValidUntil(new Date(c.validUntil).toISOString().slice(0, 16));
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue || !validUntil) return;

    setIsSubmitting(true);

    try {
      const url = editingCoupon
        ? `http://localhost:5000/api/admin/coupons/${editingCoupon.id}`
        : 'http://localhost:5000/api/admin/coupons';

      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue,
          minOrderValue,
          validUntil,
          isActive,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        alert(data.message || 'Failed to save coupon');
      }
    } catch (err) {
      console.error('Error saving coupon:', err);
      alert('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string, codeName: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${codeName}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCoupons();
      } else {
        alert('Failed to delete coupon.');
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
      alert('Error deleting coupon.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <Tag className="w-7 h-7 text-brand-600" /> Coupon Engine & Promo Codes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, set expiration dates/times, and manage discount promotional codes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-soft transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Coupon
        </button>
      </div>

      {/* Coupons List Grid */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-brand-600" /> Active & Scheduled Coupons ({coupons.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">Loading coupons engine...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400 space-y-2">
            <Tag className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No coupons found. Click "Create New Coupon" to add one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => {
              const isExpired = new Date(c.validUntil) < new Date();
              return (
                <div
                  key={c.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    !c.isActive || isExpired
                      ? 'bg-slate-50 border-slate-200 opacity-75'
                      : 'bg-white border-slate-200 shadow-xs hover:border-brand-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-extrabold text-slate-900 text-base block">{c.code}</span>
                      <span className="text-xs text-slate-500 font-medium">Min Order: ৳{c.minOrderValue.toFixed(2)}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-brand-600 text-lg block">
                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isExpired
                            ? 'bg-rose-100 text-rose-700'
                            : c.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isExpired ? 'Expired' : c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Expiration Details */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Valid until: {new Date(c.validUntil).toLocaleString()}</span>
                  </div>

                  {/* Card Actions */}
                  <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-slate-600" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(c.id, c.code)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold rounded-xl transition-colors flex items-center gap-1 border border-rose-200"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-600" /> {editingCoupon ? 'Edit Coupon Code' : 'Create New Coupon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SUMMER25"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold uppercase focus:outline-none focus:border-brand-500 text-sm"
                  required
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {discountType === 'PERCENTAGE' ? 'Percentage Value (%)' : 'Flat Discount (৳)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Min Order Value */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Minimum Order Subtotal (৳)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              {/* Expiration Date & Time Picker */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" /> Expiration Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Set exact date and time when coupon automatically expires.</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300"
                />
                <label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer">
                  Coupon is Active & Usable
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-xl shadow-soft"
                >
                  {isSubmitting ? 'Saving...' : editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
