import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  MapPin,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import { Logo } from '@/components/Logo';
import { classNames } from '@/lib/utils';
import { checkPincodeDelivery } from '@/lib/api';
import type { Category } from '@/lib/types';

const NAV_ITEMS = [
  { label: 'Men', slug: 'men' },
  { label: 'Women', slug: 'women' },
  { label: 'Accessories', slug: 'accessories' },
  { label: 'Shoes', slug: 'shoes' },
  { label: 'Slippers', slug: 'slippers' },
  { label: 'New Arrivals', slug: 'new-arrivals' },
  { label: 'Offers', slug: 'offers' },
];

export function Header({ categories }: { categories: Category[] }) {
  const { path, navigate } = useRouter();
  const { cartCount, wishlist, user, deliveryPincode, setDeliveryPincode } =
    useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(deliveryPincode || '');
  const [pincodeStatus, setPincodeStatus] = useState<
    null | 'available' | 'unavailable'
  >(null);
  const [pincodeArea, setPincodeArea] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const checkPincode = async () => {
    if (!/^\d{6}$/.test(pincodeInput)) {
      setPincodeStatus('unavailable');
      setPincodeArea('');
      return;
    }
    try {
      const result = await checkPincodeDelivery(pincodeInput);
      if (result.available) {
        setPincodeStatus('available');
        setPincodeArea(result.zone?.area || '');
        setDeliveryPincode(pincodeInput);
      } else {
        setPincodeStatus('unavailable');
        setPincodeArea('');
        setDeliveryPincode(null);
      }
    } catch {
      setPincodeStatus('unavailable');
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-gray-900 via-orange-950 to-gray-900 text-white text-center py-2 text-xs sm:text-sm font-bold px-4 tracking-wide shadow-sm">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-orange-500" />
          ⚡ 1-HOUR EXPRESS DELIVERY ACROSS MYSURU · 100% FREE DELIVERY ON ALL ORDERS!
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.slug}
                  to={`/category/${item.slug}`}
                  className={classNames(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    path === `/category/${item.slug}`
                      ? 'text-orange-600'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-xs relative"
            >
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for clothes, shoes, accessories..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 bg-gray-50"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </form>

            {/* Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Location */}
              <button
                onClick={() => setLocationModalOpen(true)}
                className="hidden sm:flex items-center gap-1 px-2 py-2 text-sm text-gray-700 hover:text-orange-600 transition-colors"
                aria-label="Delivery location"
              >
                <MapPin size={20} className="text-orange-500" />
                <span className="hidden lg:inline">
                  {deliveryPincode ? `Deliver to: ${deliveryPincode}` : 'Mysuru'}
                </span>
                <ChevronDown size={14} />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={22} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                to={user ? '/account' : '/auth'}
                className="p-2 text-gray-700 hover:text-orange-600 transition-colors"
                aria-label="Account"
              >
                <User size={22} />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white animate-[pop_0.3s_ease-out]">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="md:hidden pb-3 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for clothes, shoes, accessories..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 bg-gray-50"
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </form>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto animate-[slideIn_0.2s_ease-out]">
            <div className="flex items-center justify-between p-4 border-b">
              <Logo />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-500"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="p-4">
              <div className="mb-4">
                <button
                  onClick={() => {
                    setLocationModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full p-3 rounded-lg bg-orange-50 text-orange-700 font-medium text-sm"
                >
                  <MapPin size={18} />
                  {deliveryPincode
                    ? `Deliver to: ${deliveryPincode}`
                    : 'Select delivery location'}
                </button>
              </div>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.slug}
                  to={`/category/${item.slug}`}
                  className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t space-y-1">
                <Link
                  to="/service-area"
                  className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                >
                  Service Area
                </Link>
                <Link
                  to={user ? '/account' : '/auth'}
                  className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                >
                  {user ? 'My Account' : 'Login / Sign Up'}
                </Link>
                <Link
                  to="/wishlist"
                  className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                >
                  Wishlist ({wishlist.length})
                </Link>
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setLocationModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Delivery Location
              </h3>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Enter your Mysuru pincode to check delivery availability.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
              <button
                onClick={checkPincode}
                className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                CHECK
              </button>
            </div>
            {pincodeStatus === 'available' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-700">
                  Great! URANGADI delivers to your location
                </p>
                {pincodeArea && (
                  <p className="text-xs text-green-600 mt-1">{pincodeArea}</p>
                )}
              </div>
            )}
            {pincodeStatus === 'unavailable' && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-semibold text-orange-700">
                  We're coming soon to your city!
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  URANGADI is currently available only in Mysuru. We're working
                  hard to expand soon.
                </p>
                <Link
                  to="/service-area"
                  onClick={() => setLocationModalOpen(false)}
                  className="inline-block mt-2 text-sm font-semibold text-orange-700 underline"
                >
                  Notify me when available
                </Link>
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-400">
                Currently serving: Mysuru only
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
