import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/product/ProductCard';
import { Product } from '../types';
import { SlidersHorizontal, Grid, List, Leaf, Star, ChevronRight, X, Check } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const subParam = searchParams.get('sub') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter States
  const [isOrganicOnly, setIsOrganicOnly] = useState(false);
  const [isFlashOnly, setIsFlashOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/all-catalog');
        const data = await res.json();
        if (Array.isArray(data.products)) {
          setProducts(data.products);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to load category products:', e);
      }
      setLoading(false);
    };

    loadProducts();
  }, [slug, search]);

  const hiddenProductIds: string[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('shulov_hidden_products') || '[]');
    } catch {
      return [];
    }
  })();

  const checkCategoryMatch = (p: any, targetSlug: string) => {
    if (!targetSlug || targetSlug === 'all') return true;
    const target = targetSlug.toLowerCase().trim();

    let catStr = '';
    if (typeof p.category === 'string') {
      catStr = p.category.toLowerCase();
    } else if (p.category && typeof p.category === 'object') {
      catStr = (p.category.slug || p.category.name || '').toLowerCase();
    }

    const normalizedCatStr = catStr.replace(/[^a-z0-9]+/g, '-');

    if (normalizedCatStr === target || catStr.includes(target) || target.includes(normalizedCatStr)) {
      return true;
    }

    if ((target.includes('fruit') || target.includes('produce') || target.includes('veggie')) &&
        (catStr.includes('fruit') || catStr.includes('veggie') || catStr.includes('produce'))) {
      return true;
    }
    if ((target.includes('dairy') || target.includes('egg')) &&
        (catStr.includes('dairy') || catStr.includes('egg') || catStr.includes('milk'))) {
      return true;
    }
    if ((target.includes('bakery') || target.includes('snack')) &&
        (catStr.includes('bakery') || catStr.includes('snack') || catStr.includes('bread'))) {
      return true;
    }
    if ((target.includes('meat') || target.includes('seafood')) &&
        (catStr.includes('meat') || catStr.includes('seafood') || catStr.includes('fish'))) {
      return true;
    }
    if (target.includes('beverage') && catStr.includes('beverage')) {
      return true;
    }
    if ((target.includes('pantry') || target.includes('oil')) &&
        (catStr.includes('pantry') || catStr.includes('oil') || catStr.includes('rice'))) {
      return true;
    }

    return false;
  };

  const filteredProducts = products.filter((p) => {
    if (hiddenProductIds.includes(p.id) || p.isHidden) return false;
    if (isOrganicOnly && !p.isOrganic) return false;
    if (isFlashOnly && !p.isFlashDeal) return false;
    if (selectedRating > 0 && p.rating < selectedRating) return false;

    // Search query filter
    if (search) {
      const q = search.toLowerCase().trim();
      const nMatch = p.name?.toLowerCase().includes(q);
      const bMatch = p.brand?.toLowerCase().includes(q);
      const dMatch = p.description?.toLowerCase().includes(q);
      if (!nMatch && !bMatch && !dMatch) return false;
    }

    // Category Slug Filter
    if (slug && !checkCategoryMatch(p, slug)) {
      return false;
    }

    // Subcategory Filter
    if (subParam) {
      const targetSub = subParam.toLowerCase();
      let subStr = '';
      if (typeof p.subcategory === 'string') subStr = p.subcategory.toLowerCase();
      else if (p.subcategory) subStr = (p.subcategory.name || p.subcategory.slug || '').toLowerCase();
      if (subStr && !subStr.includes(targetSub) && !targetSub.includes(subStr)) return false;
    }

    if (p.variants && p.variants.length > 0) {
      const minVarPrice = Math.min(...p.variants.map((v) => v.price));
      if (minVarPrice > maxPrice) return false;
    }

    return true;
  });

  return (
    <div className="py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="capitalize">{slug?.replace('-', ' ') || 'All Products'}</span>
        {subParam && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-brand-700">{subParam}</span>
          </>
        )}
      </div>

      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="font-extrabold text-3xl text-slate-900 capitalize tracking-tight">
            {search ? `Search results for "${search}"` : slug?.replace('-', ' ') || 'Fresh Grocery Store'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {filteredProducts.length} items available for home delivery all over Bangladesh.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-slate-500 font-medium pl-2">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none pr-2"
            >
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-400'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sticky Sidebar Filter */}
        <aside className="space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit sticky top-24">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filter Catalog
            </h3>
            {(isOrganicOnly || isFlashOnly || selectedRating > 0 || maxPrice < 25) && (
              <button
                onClick={() => {
                  setIsOrganicOnly(false);
                  setIsFlashOnly(false);
                  setSelectedRating(0);
                  setMaxPrice(25);
                }}
                className="text-[11px] font-bold text-red-500 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Organic Toggle Switch */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Dietary & Quality</h4>
            <label className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 cursor-pointer">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" /> 100% Organic Only
              </span>
              <input
                type="checkbox"
                checked={isOrganicOnly}
                onChange={(e) => setIsOrganicOnly(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
            </label>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Max Price</span>
              <span className="font-extrabold text-brand-600">৳{maxPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>৳10.00</span>
              <span>৳500.00</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Minimum Rating</h4>
            <div className="space-y-1.5">
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-colors ${
                    selectedRating === stars ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{stars} Stars & Above</span>
                  </div>
                  {selectedRating === stars && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
              <X className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-lg">No products match your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range or turning off the organic filter to view available stock.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};


