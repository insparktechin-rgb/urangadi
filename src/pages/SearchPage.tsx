import { useState, useEffect, useMemo } from 'react';
import { useRouter, Link } from '@/lib/router';
import { getProducts } from '@/lib/api';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { Search as SearchIcon, X } from 'lucide-react';
import type { Product } from '@/lib/types';

export function SearchPage({ query }: { query: string }) {
  const { navigate } = useRouter();
  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setSearchInput(query);
    const load = async () => {
      setLoading(true);
      try {
        if (query) {
          const data = await getProducts({ search: query });
          setProducts(data);
          // Save to recent searches
          const saved = localStorage.getItem('urangadi_recent_searches');
          let recent: string[] = saved ? JSON.parse(saved) : [];
          recent = [query, ...recent.filter((s) => s !== query)].slice(0, 5);
          setRecentSearches(recent);
          localStorage.setItem(
            'urangadi_recent_searches',
            JSON.stringify(recent),
          );
        } else {
          const data = await getProducts();
          setProducts(data);
        }
      } catch (e) {
        console.error('Failed to search:', e);
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
  }, [query]);

  useEffect(() => {
    const saved = localStorage.getItem('urangadi_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const suggestions = [
    'black t shirt',
    'sneakers',
    'women dress',
    'watch',
    'slippers',
    'jeans',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search for clothes, shoes, accessories..."
          autoFocus
          className="w-full pl-12 pr-10 py-3.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        />
        <SearchIcon
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              navigate('/search');
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </form>

      {!query && (
        <div className="space-y-6">
          {/* Suggestions */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3">
              Popular Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSearchInput(s);
                    navigate(`/search?q=${encodeURIComponent(s)}`);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-3">
                Recent Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSearchInput(s);
                      navigate(`/search?q=${encodeURIComponent(s)}`);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:border-orange-300 hover:text-orange-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {query && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Search results for: <span className="font-bold text-gray-900">"{query}"</span>
            {!loading && ` (${products.length} results)`}
          </p>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-semibold text-gray-900">
                We couldn't find that style.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Try a different search term.
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-3">
                  You might like these:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        navigate(`/search?q=${encodeURIComponent(s)}`)
                      }
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-orange-50 hover:text-orange-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
