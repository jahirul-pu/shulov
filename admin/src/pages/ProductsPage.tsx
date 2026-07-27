import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Leaf, Flame, AlertCircle, Check, X, Eye, EyeOff, Save, Tag, Layers, Image as ImageIcon } from 'lucide-react';
import { getPrimaryProductImage } from '../utils/image';
import { ImageUploader } from '../components/ImageUploader';
import { MultiImageUploader } from '../components/MultiImageUploader';

interface VariantState {
  id: string;
  weight: string;
  price: string | number;
  costPrice?: string | number;
  stock: string | number;
  sku?: string;
}

const categorySubcategoryMap: Record<string, string[]> = {
  'Fresh Fruits & Veggies': ['Fresh Fruits', 'Fresh Vegetables', 'Organic Salad Greens', 'Exotic & Seasonal Produce'],
  'Dairy & Eggs': ['Whole Pasteurized Milk', 'Free Range Farm Eggs', 'Artisan Butter & Cheese', 'Fresh Yogurt & Laban'],
  'Bakery & Snacks': ['Artisan Whole Grain Breads', 'Warm Croissants & Pastries', 'Cookies & Gourmet Biscuits', 'Roasted Nuts & Chips'],
  'Meat & Seafood': ['Skinless Fresh Chicken', 'Prime Beef & Mutton Cuts', 'Fresh Ocean & River Fish', 'Jumbo Prawns & Seafood'],
  'Beverages': ['Cold-Pressed Detox Juices', 'Organic Green & Black Tea', 'Roasted Coffee Beans', 'Sparkling Mineral Water'],
  'Pantry & Oil': ['Kalizira & Basmati Rice', 'Cold-Pressed Mustard Oil', 'Organic Whole Spices', 'Pulses & Lentils (Dal)'],
};

const categoryNameToSlugMap: Record<string, string> = {
  'Fresh Fruits & Veggies': 'fresh-produce',
  'Dairy & Eggs': 'dairy-eggs',
  'Bakery & Snacks': 'bakery-snacks',
  'Meat & Seafood': 'meat-seafood',
  'Beverages': 'beverages',
  'Pantry & Oil': 'pantry-oil',
};

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // New Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('Shulov Fresh');
  const [newProdCategory, setNewProdCategory] = useState('Fresh Fruits & Veggies');
  const [newProdSubCategory, setNewProdSubCategory] = useState('Fresh Fruits');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [newProdOrganic, setNewProdOrganic] = useState(true);
  const [newProdFlashDeal, setNewProdFlashDeal] = useState(false);
  const [newProdVariants, setNewProdVariants] = useState<VariantState[]>([
    { id: 'nv-1', weight: '500g', price: '2.50', stock: '50', sku: 'SKU-001' },
    { id: 'nv-2', weight: '1kg', price: '4.50', stock: '80', sku: 'SKU-002' },
  ]);

  // Edit Product Form state
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editOrganic, setEditOrganic] = useState(false);
  const [editFlashDeal, setEditFlashDeal] = useState(false);
  const [editIsHidden, setEditIsHidden] = useState(false);
  const [editVariants, setEditVariants] = useState<VariantState[]>([]);

  // Fetch catalog from backend API on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/products/all-catalog')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  // Sync products update event
  useEffect(() => {
    window.dispatchEvent(new Event('products_updated'));
  }, [products]);

  const handleToggleHide = (productId: string) => {
    const isCurrentlyHidden = hiddenIds.includes(productId);
    const newHidden = isCurrentlyHidden
      ? hiddenIds.filter((id) => id !== productId)
      : [...hiddenIds, productId];

    setHiddenIds(newHidden);

    fetch(`http://localhost:5000/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHidden: !isCurrentlyHidden }),
    }).catch(() => {});
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setEditName(p.name || '');
    setEditBrand(p.brand || 'Shulov Fresh');
    const catName = p.category?.name || 'Fresh Fruits & Veggies';
    setEditCategory(catName);
    setEditSubCategory(p.subcategory?.name || categorySubcategoryMap[catName]?.[0] || 'General');
    setEditDescription(p.description || '');
    let imgArr: string[] = [];
    try {
      imgArr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
    } catch {
      imgArr = p.images ? [p.images] : [];
    }
    setEditImages(Array.isArray(imgArr) && imgArr.length > 0 ? imgArr : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80']);
    setEditOrganic(!!p.isOrganic);
    setEditFlashDeal(!!p.isFlashDeal);
    setEditIsHidden(hiddenIds.includes(p.id) || !!p.isHidden);

    const variantsToEdit: VariantState[] = (p.variants && p.variants.length > 0)
      ? p.variants.map((v: any, index: number) => ({
          id: v.id || `ev-${index}-${Date.now()}`,
          weight: v.weight || '1kg',
          price: v.price !== undefined ? v.price : 4.99,
          costPrice: v.costPrice !== undefined ? v.costPrice : Math.round((v.price || 4.99) * 0.70 * 100) / 100,
          stock: v.stock !== undefined ? v.stock : 50,
          sku: v.sku || `SKU-${index + 1}`,
        }))
      : [{ id: `ev-0-${Date.now()}`, weight: '1kg', price: 4.99, costPrice: 3.50, stock: 50, sku: 'SKU-001' }];

    setEditVariants(variantsToEdit);
  };

  // Add Variant Helpers for Edit Form
  const handleUpdateEditVariant = (index: number, field: keyof VariantState, value: any) => {
    setEditVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleAddEditVariant = () => {
    setEditVariants((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}`,
        weight: '1kg',
        price: '4.99',
        costPrice: '3.50',
        stock: '50',
        sku: `SKU-${prev.length + 1}`,
      },
    ]);
  };

  const handleDeleteEditVariant = (index: number) => {
    if (editVariants.length <= 1) return;
    setEditVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Variant Helpers for New Product Form
  const handleUpdateNewVariant = (index: number, field: keyof VariantState, value: any) => {
    setNewProdVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleAddNewVariant = () => {
    setNewProdVariants((prev) => [
      ...prev,
      {
        id: `nv-${Date.now()}`,
        weight: '1kg',
        price: '4.99',
        costPrice: '3.50',
        stock: '50',
        sku: `SKU-${prev.length + 1}`,
      },
    ]);
  };

  const handleDeleteNewVariant = (index: number) => {
    if (newProdVariants.length <= 1) return;
    setNewProdVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formattedVariants = editVariants.map((v) => ({
      id: v.id,
      productId: editingProduct.id,
      weight: v.weight,
      price: parseFloat(v.price.toString()) || 0,
      costPrice: parseFloat(v.costPrice?.toString() || '0') || 0,
      stock: parseInt(v.stock.toString(), 10) || 0,
      sku: v.sku || `SKU-${Date.now().toString().slice(-4)}`,
    }));

    const catSlug = categoryNameToSlugMap[editCategory] || editCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const updatedProduct = {
      ...editingProduct,
      name: editName,
      brand: editBrand,
      description: editDescription,
      category: { name: editCategory, slug: catSlug },
      subcategory: { name: editSubCategory },
      images: JSON.stringify(editImages.length > 0 ? editImages : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80']),
      isOrganic: editOrganic,
      isFlashDeal: editFlashDeal,
      isHidden: editIsHidden,
      variants: formattedVariants,
    };

    const updatedProducts = products.map((p) => (p.id === editingProduct.id ? updatedProduct : p));
    setProducts(updatedProducts);

    if (editIsHidden) {
      if (!hiddenIds.includes(editingProduct.id)) setHiddenIds([...hiddenIds, editingProduct.id]);
    } else {
      setHiddenIds(hiddenIds.filter((id) => id !== editingProduct.id));
    }

    fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    }).catch(() => {});

    setEditingProduct(null);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdId = `p-${Date.now()}`;
    const slug = newProdName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catSlug = categoryNameToSlugMap[newProdCategory] || newProdCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const formattedVariants = newProdVariants.map((v, i) => ({
      id: `v-${Date.now()}-${i}`,
      productId: createdId,
      weight: v.weight,
      price: parseFloat(v.price.toString()) || 0,
      costPrice: parseFloat(v.costPrice?.toString() || '0') || 0,
      stock: parseInt(v.stock.toString(), 10) || 0,
      sku: v.sku || `SKU-${Date.now().toString().slice(-4)}`,
    }));

    const created = {
      id: createdId,
      name: newProdName || 'Fresh Organic Product',
      slug,
      description: newProdDescription || 'Fresh high quality organic grocery item harvested daily.',
      brand: newProdBrand || 'Shulov Fresh',
      category: { name: newProdCategory, slug: catSlug },
      subcategory: { name: newProdSubCategory },
      images: JSON.stringify(newProdImages.length > 0 ? newProdImages : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80']),
      isOrganic: newProdOrganic,
      isFlashDeal: newProdFlashDeal,
      isHidden: false,
      rating: 5.0,
      reviewCount: 1,
      variants: formattedVariants,
    };

    setProducts([created, ...products]);

    fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created),
    }).catch(() => {});

    setIsAddModalOpen(false);
    setNewProdName('');
    setNewProdDescription('');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl text-slate-900 tracking-tight">Product & Multi-Variant Inventory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage grocery catalog, edit descriptions, subcategories, product images, package variants, and prices.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title, brand, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-surface-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-slate-500">Total Catalog Items: {filteredProducts.length}</span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
            Hidden Items: {hiddenIds.length}
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-6">Product & Image</th>
                <th className="py-3.5 px-4">Category & Subcategory</th>
                <th className="py-3.5 px-6">Package Variants (Price & Stock)</th>
                <th className="py-3.5 px-4">Status & Badges</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredProducts.map((p) => {
                const img = getPrimaryProductImage(p.images);
                const isHidden = hiddenIds.includes(p.id) || !!p.isHidden;
                const variantsList: any[] = p.variants || [];

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isHidden ? 'bg-slate-100/60 opacity-75 hover:bg-slate-100' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img src={img} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                        <div>
                          <span className={`font-bold text-sm block ${isHidden ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {p.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Brand: {p.brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{p.category?.name || 'Fresh Produce'}</span>
                        <span className="text-[10px] text-brand-600 font-semibold">{p.subcategory?.name || 'General'}</span>
                      </div>
                    </td>

                    {/* Multi-Variant Column */}
                    <td className="py-4 px-6">
                      <div className="space-y-1.5">
                        {variantsList.map((v: any) => {
                          const isLow = (v.stock || 0) <= 10;
                          return (
                            <div key={v.id || v.weight} className="flex items-center gap-3 text-xs bg-slate-50 p-1.5 rounded-xl border border-slate-200/70">
                              <span className="font-extrabold text-slate-900 w-28 truncate">{v.weight}</span>
                              <span className="font-extrabold text-brand-600">৳{parseFloat(v.price).toFixed(2)}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ml-auto ${isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {v.stock} in stock
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isHidden ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-lg border border-slate-300 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Visible
                          </span>
                        )}

                        {p.isOrganic && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                            Organic
                          </span>
                        )}

                        {p.isFlashDeal && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                            Flash Deal
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleHide(p.id)}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                            isHidden
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={isHidden ? 'Show on Storefront' : 'Hide from Storefront'}
                        >
                          {isHidden ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-amber-600" />}
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 text-brand-600 hover:text-brand-700 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors"
                          title="Edit full product details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Edit Product & Variants</h3>
                <span className="text-xs text-slate-400 font-mono">ID: {editingProduct.id}</span>
              </div>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                  Product Title
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-surface-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => {
                      setEditCategory(e.target.value);
                      const subList = categorySubcategoryMap[e.target.value] || [];
                      if (subList.length > 0) setEditSubCategory(subList[0]);
                    }}
                    className="w-full p-2.5 bg-surface-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Fresh Fruits & Veggies">Fresh Fruits & Veggies</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Bakery & Snacks">Bakery & Snacks</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Pantry & Oil">Pantry & Oil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Subcategory
                  </label>
                  <select
                    value={editSubCategory}
                    onChange={(e) => setEditSubCategory(e.target.value)}
                    className="w-full p-2.5 bg-surface-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {(categorySubcategoryMap[editCategory] || ['General']).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full p-2.5 bg-surface-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Detailed description displayed on product page..."
                  className="w-full p-2.5 bg-surface-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              {/* Multi Image Upload / URL */}
              <div>
                <MultiImageUploader
                  values={editImages}
                  onChange={setEditImages}
                  label="Product Images (Gallery)"
                  required
                />
              </div>

              {/* Dynamic Multi-Variant Editor Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-brand-600" /> Package Weight Variants ({editVariants.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEditVariant}
                    className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Package Variant
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editVariants.map((variant, index) => (
                    <div
                      key={variant.id || index}
                      className="p-3 bg-surface-50 border border-slate-200 rounded-2xl grid grid-cols-12 gap-3 items-center"
                    >
                      <div className="col-span-3">
                        <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">Weight / Size</label>
                        <input
                          type="text"
                          value={variant.weight}
                          onChange={(e) => handleUpdateEditVariant(index, 'weight', e.target.value)}
                          placeholder="e.g. 500g / 1kg"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                          required
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] font-extrabold text-rose-600 mb-0.5">Cost Price (৳)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.costPrice || ''}
                          onChange={(e) => handleUpdateEditVariant(index, 'costPrice', e.target.value)}
                          placeholder="Cost Price"
                          className="w-full p-2 bg-white border border-rose-200 rounded-xl font-bold text-xs text-rose-700"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">Selling Price (৳)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => handleUpdateEditVariant(index, 'price', e.target.value)}
                          placeholder="0.00"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">Stock</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleUpdateEditVariant(index, 'stock', e.target.value)}
                          placeholder="50"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                          required
                        />
                      </div>

                      <div className="col-span-1 flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteEditVariant(index)}
                          disabled={editVariants.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-xl transition-colors"
                          title="Delete variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editOrganic}
                      onChange={(e) => setEditOrganic(e.target.checked)}
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                    <span>100% Organic Certified</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFlashDeal}
                      onChange={(e) => setEditFlashDeal(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>Flash Deal Offer</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <input
                    type="checkbox"
                    id="editIsHidden"
                    checked={editIsHidden}
                    onChange={(e) => setEditIsHidden(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <label htmlFor="editIsHidden" className="font-bold text-amber-900 cursor-pointer">
                    Hide this product from storefront customer view
                  </label>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-2xl shadow-soft flex items-center justify-center gap-1.5 transition-all"
                >
                  <Save className="w-4 h-4" /> Save Product & Variants
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">Add New Grocery Product</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                  Product Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Hass Avocados"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => {
                      setNewProdCategory(e.target.value);
                      const subList = categorySubcategoryMap[e.target.value] || [];
                      if (subList.length > 0) setNewProdSubCategory(subList[0]);
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Fresh Fruits & Veggies">Fresh Fruits & Veggies</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Bakery & Snacks">Bakery & Snacks</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Pantry & Oil">Pantry & Oil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Subcategory
                  </label>
                  <select
                    value={newProdSubCategory}
                    onChange={(e) => setNewProdSubCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  >
                    {(categorySubcategoryMap[newProdCategory] || ['General']).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-extrabold text-slate-700 mb-1 uppercase tracking-wider">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the freshness, organic origin, and nutritional benefits..."
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              {/* Product Multi Image Upload / URL */}
              <div>
                <MultiImageUploader
                  values={newProdImages}
                  onChange={setNewProdImages}
                  label="Product Images (Gallery)"
                  required
                />
              </div>

              {/* Multi-Variant Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-brand-600" /> Package Weight / Size Variants ({newProdVariants.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddNewVariant}
                    className="px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Package Variant
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {newProdVariants.map((variant, index) => (
                    <div
                      key={variant.id || index}
                      className="p-3 bg-surface-50 border border-slate-200 rounded-2xl grid grid-cols-12 gap-3 items-center"
                    >
                      <div className="col-span-3">
                        <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">Weight / Size</label>
                        <input
                          type="text"
                          value={variant.weight}
                          onChange={(e) => handleUpdateNewVariant(index, 'weight', e.target.value)}
                          placeholder="e.g. 500g / 1kg"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                          required
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] font-extrabold text-rose-600 mb-0.5">Cost Price (৳)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.costPrice || ''}
                          onChange={(e) => handleUpdateNewVariant(index, 'costPrice', e.target.value)}
                          placeholder="Cost Price"
                          className="w-full p-2 bg-white border border-rose-200 rounded-xl font-bold text-xs text-rose-700"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">Selling Price (৳)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => handleUpdateNewVariant(index, 'price', e.target.value)}
                          placeholder="0.00"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-extrabold text-slate-500 mb-0.5">Initial Stock</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleUpdateNewVariant(index, 'stock', e.target.value)}
                          placeholder="50"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                          required
                        />
                      </div>

                      <div className="col-span-1 flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => handleDeleteNewVariant(index)}
                          disabled={newProdVariants.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdOrganic}
                    onChange={(e) => setNewProdOrganic(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span>Mark as 100% Organic Certified</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdFlashDeal}
                    onChange={(e) => setNewProdFlashDeal(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>Mark as Flash Deal</span>
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-2xl shadow-soft"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const fullDefaultCatalog = [
  {
    id: 'cp1',
    name: 'Organic Red Crisp Apples',
    slug: 'organic-red-crisp-apples',
    description: 'Crisp red apples harvested directly from organic orchards.',
    brand: 'Orchard Fresh',
    category: { name: 'Fresh Fruits & Veggies' },
    subcategory: { name: 'Fresh Fruits' },
    isOrganic: true,
    isFlashDeal: true,
    rating: 4.9,
    variants: [
      { id: 'v101', weight: '500g', price: 2.49, stock: 45, sku: 'APP-500G' },
      { id: 'v102', weight: '1kg', price: 4.49, stock: 80, sku: 'APP-1KG' },
    ],
    images: JSON.stringify(['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80']),
  },
  {
    id: 'cp2',
    name: 'Fresh Cavendish Bananas',
    slug: 'fresh-cavendish-bananas',
    description: 'Sweet yellow Cavendish bananas ripened naturally.',
    brand: 'TropiFresh',
    category: { name: 'Fresh Fruits & Veggies' },
    subcategory: { name: 'Fresh Fruits' },
    isOrganic: false,
    isFlashDeal: true,
    rating: 4.8,
    variants: [
      { id: 'v103', weight: 'Half Dozen (6 pcs)', price: 0.99, stock: 60, sku: 'BAN-6PCS' },
      { id: 'v104', weight: '1 Dozen (12 pcs)', price: 1.89, stock: 120, sku: 'BAN-1DOZ' },
    ],
    images: JSON.stringify(['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80']),
  },
  {
    id: 'cp3',
    name: 'Hydroponic Baby Spinach',
    slug: 'organic-hydroponic-baby-spinach',
    description: 'Pesticide free tender baby spinach leaves.',
    brand: 'Green Leaf',
    category: { name: 'Fresh Fruits & Veggies' },
    subcategory: { name: 'Organic Salad Greens' },
    isOrganic: true,
    isFlashDeal: false,
    rating: 4.95,
    variants: [{ id: 'v105', weight: '250g Pack', price: 1.99, stock: 30, sku: 'SPI-250G' }],
    images: JSON.stringify(['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80']),
  },
  {
    id: 'p2',
    name: 'Farm-Fresh Whole Pasteurized Milk',
    slug: 'farm-fresh-whole-milk',
    description: 'Pure pasteurized whole cow milk delivered cold.',
    brand: 'MilkyWay',
    category: { name: 'Dairy & Eggs' },
    subcategory: { name: 'Whole Pasteurized Milk' },
    isOrganic: true,
    isFlashDeal: true,
    rating: 4.9,
    variants: [
      { id: 'v201', weight: '500ml Pack', price: 0.95, stock: 40, sku: 'MLK-500M' },
      { id: 'v202', weight: '1 Liter Bottle', price: 1.69, stock: 95, sku: 'MLK-1L' },
    ],
    images: JSON.stringify(['https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80']),
  },
  {
    id: 'p3',
    name: 'Warm Artisanal Sourdough Bread',
    slug: 'warm-artisanal-sourdough-bread',
    description: 'Freshly baked naturally fermented sourdough loaf.',
    brand: 'Master Baker',
    category: { name: 'Bakery & Snacks' },
    subcategory: { name: 'Artisan Whole Grain Breads' },
    isOrganic: false,
    isFlashDeal: false,
    rating: 4.85,
    variants: [{ id: 'v301', weight: '500g Loaf', price: 3.25, stock: 25, sku: 'BRD-500G' }],
    images: JSON.stringify(['https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80']),
  },
  {
    id: 'p4',
    name: 'Fresh Norwegian Atlantic Salmon Fillet',
    slug: 'fresh-norwegian-salmon-fillet',
    description: 'Premium skin-on Atlantic salmon fillet cut fresh.',
    brand: 'Ocean Catch',
    category: { name: 'Meat & Seafood' },
    subcategory: { name: 'Fresh Ocean & River Fish' },
    isOrganic: true,
    isFlashDeal: false,
    rating: 5.0,
    variants: [
      { id: 'v401', weight: '250g Steak', price: 7.99, stock: 20, sku: 'SLM-250G' },
      { id: 'v402', weight: '400g Fillet', price: 12.99, stock: 15, sku: 'SLM-400G' },
    ],
    images: JSON.stringify(['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80']),
  },
  {
    id: 'p5',
    name: '100% Cold-Pressed Valencia Orange Juice',
    slug: 'cold-pressed-orange-juice',
    description: 'Zero added sugar pure orange juice bottled fresh.',
    brand: 'Squeeze&Co',
    category: { name: 'Beverages' },
    subcategory: { name: 'Cold-Pressed Detox Juices' },
    isOrganic: true,
    isFlashDeal: true,
    rating: 4.92,
    variants: [{ id: 'v501', weight: '750ml Bottle', price: 4.99, stock: 50, sku: 'ORJ-750M' }],
    images: JSON.stringify(['https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80']),
  },
  {
    id: 'p6',
    name: 'Cold-Pressed Extra Virgin Olive Oil',
    slug: 'extra-virgin-olive-oil',
    description: 'First cold pressed extra virgin Mediterranean olive oil.',
    brand: 'Oliva',
    category: { name: 'Pantry & Oil' },
    subcategory: { name: 'Cold-Pressed Mustard Oil' },
    isOrganic: true,
    isFlashDeal: false,
    rating: 4.98,
    variants: [
      { id: 'v601', weight: '250ml Bottle', price: 4.80, stock: 35, sku: 'OIL-250M' },
      { id: 'v602', weight: '500ml Bottle', price: 8.50, stock: 60, sku: 'OIL-500M' },
    ],
    images: JSON.stringify(['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80']),
  },
];
