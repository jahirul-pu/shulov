import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Trash2, Edit2, Check, Sparkles, Save, Eye, EyeOff, Tag, Layers } from 'lucide-react';

interface SubCategory {
  id: string;
  name: string;
}

interface MegaCategory {
  id: string;
  name: string;
  slug: string;
  badge: string;
  isActive: boolean;
  subcategories: SubCategory[];
}

export const MegaMenuPage: React.FC = () => {
  const [categories, setCategories] = useState<MegaCategory[]>(() => {
    try {
      const saved = localStorage.getItem('shulov_megamenu_config');
      return saved ? JSON.parse(saved) : defaultCategories;
    } catch (e) {
      return defaultCategories;
    }
  });

  const [activeEditingCatId, setActiveEditingCatId] = useState<string | null>(null);
  const [newSubInput, setNewSubInput] = useState<{ [catId: string]: string }>({});
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    localStorage.setItem('shulov_megamenu_config', JSON.stringify(categories));
    window.dispatchEvent(new Event('megamenu_updated'));

    fetch('http://localhost:5000/api/categories/megamenu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    }).catch(() => {});
  }, [categories]);

  const handleToggleActive = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleUpdateCategory = (catId: string, field: keyof MegaCategory, value: any) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, [field]: value } : c))
    );
  };

  const handleAddSubcategory = (catId: string) => {
    const text = newSubInput[catId] || '';
    if (!text.trim()) return;

    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              subcategories: [
                ...c.subcategories,
                { id: `sub-${Date.now()}`, name: text.trim() },
              ],
            }
          : c
      )
    );

    setNewSubInput((prev) => ({ ...prev, [catId]: '' }));
  };

  const handleDeleteSubcategory = (catId: string, subId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              subcategories: c.subcategories.filter((s) => s.id !== subId),
            }
          : c
      )
    );
  };

  const handleSaveChanges = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutGrid className="w-6 h-6 text-brand-600" /> MegaMenu & Category Navigation Editor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage category titles, badges, and subcategory links displayed in the desktop navigation MegaMenu.
          </p>
        </div>

        <button
          onClick={handleSaveChanges}
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-2xl shadow-soft flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" /> Save Navigation Changes
        </button>
      </div>

      {isSavedNotice && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> MegaMenu configuration saved and published to storefront!
        </div>
      )}

      {/* MegaMenu Category Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`bg-white rounded-3xl p-6 border shadow-sm space-y-4 transition-all ${
              cat.isActive ? 'border-slate-100' : 'border-slate-200 opacity-60 bg-slate-50'
            }`}
          >
            {/* Card Header & Visibility Toggle */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                <span className="font-bold text-xs text-slate-400 font-mono">/{cat.slug}</span>
              </div>
              <button
                onClick={() => handleToggleActive(cat.id)}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                  cat.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
                title={cat.isActive ? 'Hide from MegaMenu' : 'Show in MegaMenu'}
              >
                {cat.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{cat.isActive ? 'Active' : 'Hidden'}</span>
              </button>
            </div>

            {/* Editable Name & Badge */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => handleUpdateCategory(cat.id, 'name', e.target.value)}
                  className="w-full p-2.5 bg-surface-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  Pill Badge Label
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={cat.badge}
                    onChange={(e) => handleUpdateCategory(cat.id, 'badge', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-surface-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Subcategories List Editor */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Subcategories ({cat.subcategories.length})
              </label>

              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {cat.subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-800 group"
                  >
                    <span>{sub.name}</span>
                    <button
                      onClick={() => handleDeleteSubcategory(cat.id, sub.id)}
                      className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                      title="Delete subcategory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Subcategory Box */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="New subcategory title..."
                  value={newSubInput[cat.id] || ''}
                  onChange={(e) => setNewSubInput({ ...newSubInput, [cat.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategory(cat.id)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubcategory(cat.id)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const defaultCategories: MegaCategory[] = [
  {
    id: 'cat-1',
    name: 'Fresh Fruits & Veggies',
    slug: 'fresh-produce',
    badge: '100% Organic',
    isActive: true,
    subcategories: [
      { id: 'sub-1', name: 'Fresh Fruits' },
      { id: 'sub-2', name: 'Fresh Vegetables' },
      { id: 'sub-3', name: 'Organic Salad Greens' },
      { id: 'sub-4', name: 'Exotic & Seasonal Produce' },
    ],
  },
  {
    id: 'cat-2',
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    badge: 'Farm Fresh',
    isActive: true,
    subcategories: [
      { id: 'sub-5', name: 'Whole Pasteurized Milk' },
      { id: 'sub-6', name: 'Free Range Farm Eggs' },
      { id: 'sub-7', name: 'Artisan Butter & Cheese' },
      { id: 'sub-8', name: 'Fresh Yogurt & Laban' },
    ],
  },
  {
    id: 'cat-3',
    name: 'Bakery & Snacks',
    slug: 'bakery-snacks',
    badge: 'Baked Daily',
    isActive: true,
    subcategories: [
      { id: 'sub-9', name: 'Artisan Whole Grain Breads' },
      { id: 'sub-10', name: 'Warm Croissants & Pastries' },
      { id: 'sub-11', name: 'Cookies & Gourmet Biscuits' },
      { id: 'sub-12', name: 'Roasted Nuts & Chips' },
    ],
  },
  {
    id: 'cat-4',
    name: 'Meat & Seafood',
    slug: 'meat-seafood',
    badge: '100% Halal',
    isActive: true,
    subcategories: [
      { id: 'sub-13', name: 'Skinless Fresh Chicken' },
      { id: 'sub-14', name: 'Prime Beef & Mutton Cuts' },
      { id: 'sub-15', name: 'Fresh Ocean & River Fish' },
      { id: 'sub-16', name: 'Jumbo Prawns & Seafood' },
    ],
  },
  {
    id: 'cat-5',
    name: 'Beverages & Juices',
    slug: 'beverages',
    badge: 'Cold Pressed',
    isActive: true,
    subcategories: [
      { id: 'sub-17', name: 'Cold-Pressed Detox Juices' },
      { id: 'sub-18', name: 'Organic Green & Black Tea' },
      { id: 'sub-19', name: 'Roasted Coffee Beans' },
      { id: 'sub-20', name: 'Sparkling Mineral Water' },
    ],
  },
  {
    id: 'cat-6',
    name: 'Pantry & Oils',
    slug: 'pantry-oil',
    badge: 'Pure Quality',
    isActive: true,
    subcategories: [
      { id: 'sub-21', name: 'Kalizira & Basmati Rice' },
      { id: 'sub-22', name: 'Cold-Pressed Mustard Oil' },
      { id: 'sub-23', name: 'Organic Whole Spices' },
      { id: 'sub-24', name: 'Pulses & Lentils (Dal)' },
    ],
  },
];
