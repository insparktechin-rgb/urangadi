import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { useRouter, Link } from '@/lib/router';
import { getProducts, getCategories } from '@/lib/api';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { classNames } from '@/lib/utils';
import type { Product, Category } from '@/lib/types';

type SortOption =
  | 'recommended'
  | 'newest'
  | 'price_low'
  | 'price_high'
  | 'popular'
  | 'rating';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { label: '₹2,000+', min: 2000, max: Infinity },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

export function CategoryPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<SortOption>('recommended');

  // Filters
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const cats = await getCategories();
        setCategories(cats);
        const cat = cats.find((c) => c.slug === slug);
        if (slug === 'new-arrivals') {
          const data = await getProducts({ is_new: true });
          setProducts(data);
        } else if (slug === 'offers') {
          const data = await getProducts();
          setProducts(data.filter((p) => p.discount_pct > 0));
        } else if (cat) {
          const data = await getProducts({ category: cat.id });
          setProducts(data);
        } else {
          const data = await getProducts();
          setProducts(data);
        }
      } catch (e) {
        console.error('Failed to load products:', e);
      } finally {
        setLoading(false);
      }
    };
    load();

    const handleProductsUpdated = () => {
      load();
    };
    window.addEventListener('urangadi_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('urangadi_products_updated', handleProductsUpdated);
    };
  }, [slug]);

  const currentCategory = categories.find((c) => c.slug === slug);

  // Collect all available sizes and colors
  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => {
      (p.variants || []).forEach((v) => sizes.add(v.size));
    });
    return Array.from(sizes).sort();
  }, [products]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) => {
      (p.variants || []).forEach((v) => colors.add(v.color));
    });
    return Array.from(colors).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Gender filter
    if (selectedGenders.length > 0) {
      result = result.filter((p) =>
        selectedGenders.includes(p.gender) || p.gender === 'unisex',
      );
    }

    // Price filter
    if (selectedPriceRanges.length > 0) {
      result = result.filter((p) =>
        selectedPriceRanges.some((idx) => {
          const range = PRICE_RANGES[idx];
          return p.price >= range.min && p.price < range.max;
        }),
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        (p.variants || []).some((v) => selectedSizes.includes(v.size)),
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        (p.variants || []).some((v) => selectedColors.includes(v.color)),
      );
    }

    // Rating filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // In stock filter
    if (inStockOnly) {
      result = result.filter((p) =>
        (p.variants || []).some((v) => v.stock > 0),
      );
    }

    // Sort
    switch (sort) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => b.review_count - a.review_count);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [
    products,
    selectedGenders,
    selectedPriceRanges,
    selectedSizes,
    selectedColors,
    minRating,
    inStockOnly,
    sort,
  ]);

  const toggleArray = <T,>(
    arr: T[],
    val: T,
    setter: (v: T[]) => void,
  ) => {
    if (arr.includes(val)) {
      setter(arr.filter((x) => x !== val));
    } else {
      setter([...arr, val]);
    }
  };

  const clearFilters = () => {
    setSelectedGenders([]);
    setSelectedPriceRanges([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinRating(0);
    setInStockOnly(false);
  };

  const activeFilterCount =
    selectedGenders.length +
    selectedPriceRanges.length +
    selectedSizes.length +
    selectedColors.length +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Gender */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-2">Gender</h4>
        <div className="space-y-1.5">
          {['men', 'women'].map((g) => (
            <label
              key={g}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 capitalize"
            >
              <input
                type="checkbox"
                checked={selectedGenders.includes(g)}
                onChange={() =>
                  toggleArray(selectedGenders, g, setSelectedGenders)
                }
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
              />
              {g}
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-2">Price</h4>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range, idx) => (
            <label
              key={idx}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={selectedPriceRanges.includes(idx)}
                onChange={() =>
                  toggleArray(selectedPriceRanges, idx, setSelectedPriceRanges)
                }
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
              />
              {range.label}
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      {allSizes.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-2">Size</h4>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleArray(selectedSizes, size, setSelectedSizes)}
                className={classNames(
                  'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                  selectedSizes.includes(size)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400',
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color */}
      {allColors.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-2">Color</h4>
          <div className="flex flex-wrap gap-2">
            {allColors.map((color) => (
              <button
                key={color}
                onClick={() =>
                  toggleArray(selectedColors, color, setSelectedColors)
                }
                className={classNames(
                  'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors',
                  selectedColors.includes(color)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400',
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-2">Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((r) => (
            <label
              key={r}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
            >
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                className="h-4 w-4 border-gray-300 text-orange-500 focus:ring-orange-400"
              />
              {r}★ & above
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="radio"
              name="rating"
              checked={minRating === 0}
              onChange={() => setMinRating(0)}
              className="h-4 w-4 border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            All ratings
          </label>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-2">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => setInStockOnly(!inStockOnly)}
            className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
          />
          In stock only
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full py-2 text-sm font-semibold text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        <Link to="/" className="hover:text-orange-600">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {slug === 'new-arrivals'
            ? 'New Arrivals'
            : slug === 'offers'
              ? 'Offers'
              : currentCategory?.name || 'All Products'}
        </span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        {slug === 'new-arrivals'
          ? 'New Arrivals'
          : slug === 'offers'
            ? "Today's Offers"
            : currentCategory?.name || 'All Products'}
      </h1>

      {/* Mobile Category Quick Bar */}
      <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 scrollbar-none">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.slug}`}
            className={classNames(
              'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0',
              slug === c.slug
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <span className="text-xs text-orange-600 font-medium">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 gap-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg lg:hidden hover:bg-gray-50"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <p className="text-sm text-gray-500 hidden lg:block">
              {filteredProducts.length} products
            </p>
            <div className="relative ml-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 bg-white cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-semibold text-gray-900">
                We couldn't find that style.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters.
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto animate-[slideInRight_0.2s_ease-out]">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 text-gray-400"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-5">
              <FilterContent />
              <button
                onClick={() => setShowFilters(false)}
                className="mt-6 w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
