import React, { useState, useEffect } from 'react';
import { Truck, MapPin, DollarSign, Save, CheckCircle2, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';

export const DeliverySettingsPage: React.FC = () => {
  const [insideDhaka, setInsideDhaka] = useState<number>(80);
  const [outsideDhaka, setOutsideDhaka] = useState<number>(120);
  const [expressSurge, setExpressSurge] = useState<number>(0);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [notice, setNotice] = useState<string>('Standard delivery: Inside Dhaka ৳80, Outside Dhaka ৳120.');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/settings/delivery')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setInsideDhaka(data.settings.insideDhaka ?? 80);
          setOutsideDhaka(data.settings.outsideDhaka ?? 120);
          setExpressSurge(data.settings.expressSurge ?? 0);
          setMinOrderAmount(data.settings.minOrderAmount ?? 0);
          setNotice(data.settings.notice || '');
        }
      })
      .catch((err) => console.error('Failed to fetch delivery settings:', err))
      .finally(() => setIsLoading(false));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      const res = await fetch('http://localhost:5000/api/settings/admin/delivery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('shulov_token') || ''}`,
        },
        body: JSON.stringify({
          insideDhaka,
          outsideDhaka,
          expressSurge,
          minOrderAmount,
          notice,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveSuccess('Delivery charges saved successfully!');
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        setSaveError(data.message || 'Failed to save delivery charges.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveError('Error connecting to backend server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Title */}
      <div>
        <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2.5">
          <Truck className="w-7 h-7 text-brand-600" /> Delivery Zone Charges & Shipping Rules
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure regional shipping fees for Inside Dhaka and Outside Dhaka. Changes apply live to checkout and cart summaries.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-400">Loading delivery settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-extrabold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {saveSuccess}
            </div>
          )}

          {saveError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-extrabold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" /> {saveError}
            </div>
          )}

          {/* Zone Charges Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-brand-600" /> Regional Delivery Zones
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inside Dhaka */}
              <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs">
                      Dhaka
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Inside Dhaka</h3>
                      <span className="text-[10px] text-slate-500 font-medium">Metropolitan & Express Hubs</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-emerald-700">৳{insideDhaka}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Standard Delivery Fee (৳)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-extrabold text-slate-400">৳</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={insideDhaka}
                      onChange={(e) => setInsideDhaka(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Applied when customer selects Inside Dhaka at checkout.</p>
                </div>
              </div>

              {/* Outside Dhaka */}
              <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-xs">
                      BD
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Outside Dhaka</h3>
                      <span className="text-[10px] text-slate-500 font-medium">Divisional & National Shipping</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-purple-700">৳{outsideDhaka}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Standard Delivery Fee (৳)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-extrabold text-slate-400">৳</span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={outsideDhaka}
                      onChange={(e) => setOutsideDhaka(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Applied when customer selects Outside Dhaka at checkout.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Express & Minimal Order Settings */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-5 h-5 text-amber-600" /> Additional Delivery Options & Minimum Order
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Express Rush Delivery Surge (৳)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={expressSurge}
                  onChange={(e) => setExpressSurge(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Extra fee added if express delivery slot chosen (0 = disabled).</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Minimum Order Subtotal (৳)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Minimum subtotal required to place an order (0 = no minimum).</p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer Delivery Notice / Banner</label>
              <textarea
                rows={2}
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                placeholder="Notice displayed to customers at checkout..."
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-soft transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Delivery Configuration'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
