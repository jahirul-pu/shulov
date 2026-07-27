import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, X, Link as LinkIcon, Tag, Image as ImageIcon, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';

interface PopupData {
  id: string;
  image: string;
  couponCode: string | null;
  ctaLabel: string;
  ctaLink: string;
  isActive: boolean;
  createdAt: string;
}

const API = 'http://localhost:5000/api/popups';

export const PopupsPage: React.FC = () => {
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form fields
  const [image, setImage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Shop Now');
  const [ctaLink, setCtaLink] = useState('/');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = () => {
    setIsLoading(true);
    fetch(`${API}/all`)
      .then((r) => r.json())
      .then((d) => { if (d.popups) setPopups(d.popups); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const resetForm = () => {
    setImage('');
    setCouponCode('');
    setCtaLabel('Shop Now');
    setCtaLink('/');
    setIsActive(true);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image.trim()) return alert('Image URL is required.');
    setIsSubmitting(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, couponCode: couponCode || null, ctaLabel, ctaLink, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPopups((prev) => [data.popup, ...prev]);
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Failed to create popup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (popup: PopupData) => {
    try {
      const res = await fetch(`${API}/${popup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !popup.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPopups((prev) => prev.map((p) => (p.id === popup.id ? data.popup : p)));
    } catch (err: any) {
      alert(err.message || 'Failed to update popup.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this popup? This cannot be undone.')) return;
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      setPopups((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete popup.');
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-900">Popup Cards</h1>
            <p className="text-xs text-slate-500">Manage promotional popups shown on the storefront.</p>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> New Popup
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Popups', value: popups.length, color: 'bg-slate-100 text-slate-900' },
          { label: 'Active', value: popups.filter((p) => p.isActive).length, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Inactive', value: popups.filter((p) => !p.isActive).length, color: 'bg-rose-50 text-rose-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color} border border-slate-100`}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-semibold mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Popup Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm font-semibold">
          Loading popups...
        </div>
      ) : popups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
          <Layers className="w-12 h-12 opacity-30" />
          <p className="text-sm font-semibold">No popups yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {popups.map((popup) => (
            <div
              key={popup.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-sm transition-all ${
                popup.isActive ? 'border-brand-200' : 'border-slate-200 opacity-60'
              }`}
            >
              {/* Image Preview */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={popup.image}
                  alt="Popup preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                {/* Active Badge */}
                <span
                  className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    popup.isActive
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {popup.isActive ? '● Live' : '○ Inactive'}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Coupon Code */}
                {popup.couponCode && (
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-extrabold text-amber-700 tracking-wider">{popup.couponCode}</span>
                    </div>
                    <button
                      onClick={() => copyCode(popup.couponCode!, popup.id)}
                      className="text-slate-400 hover:text-brand-600 transition-colors"
                      title="Copy code"
                    >
                      {copiedId === popup.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* CTA Info */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                  <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    <span className="font-extrabold text-slate-700">{popup.ctaLabel}</span>
                    {' → '}
                    <span className="text-brand-500">{popup.ctaLink}</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => toggleActive(popup)}
                    className={`flex items-center gap-1.5 text-xs font-extrabold transition-colors ${
                      popup.isActive ? 'text-emerald-600 hover:text-rose-500' : 'text-slate-400 hover:text-emerald-600'
                    }`}
                  >
                    {popup.isActive ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                    {popup.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleDelete(popup.id)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="font-extrabold text-slate-900 text-base">New Popup Card</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Image Upload / URL */}
              <ImageUploader
                value={image}
                onChange={setImage}
                label="Popup Image"
                required
                variant="full"
              />

              {/* Coupon Code (optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-slate-700 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-500" /> Coupon Code{' '}
                  <span className="text-slate-400 font-semibold">(optional)</span>
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME20"
                  className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 uppercase tracking-wider"
                />
              </div>

              {/* CTA Label + Link */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-700">CTA Button Label</label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="Shop Now"
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-700">CTA Link</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/category/vegetables"
                    className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-extrabold text-slate-800">Publish immediately</p>
                  <p className="text-[11px] text-slate-500">Show this popup to customers right away</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`transition-colors ${isActive ? 'text-emerald-500' : 'text-slate-300'}`}
                >
                  {isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : '✦ Create Popup Card'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
