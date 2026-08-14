import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import { getUserOrders, cancelOrder } from '@/lib/api';
import { formatINR, formatDateTime, classNames, getInitials } from '@/lib/utils';
import {
  Package,
  Heart,
  MapPin,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Truck,
  XCircle,
} from 'lucide-react';
import type { Order } from '@/lib/types';

type Tab = 'orders' | 'wishlist' | 'profile';

export function AccountPage() {
  const { navigate } = useRouter();
  const { user, signOut, wishlist, removeFromWishlist, addToCart } = useStore();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const load = async () => {
      try {
        const data = await getUserOrders(user.id);
        setOrders(data);
      } catch (e) {
        console.error('Failed to load orders:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, navigate]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled' } : o,
        ),
      );
    } catch (e) {
      console.error('Failed to cancel order:', e);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof Package; count?: number }[] = [
    { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-extrabold text-white">
            {getInitials(user.full_name || user.email || 'U')}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              {user.full_name || 'URANGADI Customer'}
            </h1>
            <p className="text-sm text-gray-400">{user.email}</p>
            {user.is_admin && (
              <Link
                to="/admin"
                className="mt-1 inline-block text-xs font-semibold text-orange-400 hover:text-orange-300"
              >
                Admin Dashboard →
              </Link>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={classNames(
              'flex items-center gap-2 flex-1 py-2.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap justify-center',
              tab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500',
            )}
          >
            <t.icon size={16} />
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] text-white">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders tab */}
      {tab === 'orders' && (
        <div>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Package size={28} className="text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900">
                No orders yet
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Start shopping to see your orders here.
              </p>
              <button
                onClick={() => navigate('/category/men')}
                className="mt-4 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={classNames(
                          'inline-block px-2.5 py-1 text-xs font-bold rounded-md capitalize',
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'cancelled' ||
                                order.status === 'returned'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700',
                        )}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex gap-2 mb-3">
                    {(order.items || []).slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="h-14 w-14 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0"
                      >
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                    {(order.items || []).length > 4 && (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
                        +{(order.items || []).length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                      {formatINR(order.total)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/track-order?id=${order.order_number}`)
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Truck size={14} />
                        Track
                      </button>
                      {(order.status === 'pending' ||
                        order.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wishlist tab */}
      {tab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Heart size={28} className="text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900">
                Your wishlist is empty
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Save the styles you love.
              </p>
              <button
                onClick={() => navigate('/category/women')}
                className="mt-4 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600"
              >
                BROWSE PRODUCTS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {wishlist.map((item) => (
                <div key={item.product_id} className="relative">
                  <Link to={`/product/${item.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromWishlist(item.product_id);
                        }}
                        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm text-red-500 hover:scale-110 transition-transform"
                      >
                        <Heart size={16} className="fill-red-500" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-sm font-bold text-gray-900">
                        {formatINR(item.price)}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      addToCart({
                        product_id: item.product_id,
                        name: item.name,
                        slug: item.slug,
                        price: item.price,
                        image_url: item.image_url,
                        color: '',
                        size: '',
                        quantity: 1,
                        stock: 99,
                      });
                      removeFromWishlist(item.product_id);
                    }}
                    className="mt-2 w-full py-2 text-xs font-bold rounded-lg bg-gray-900 text-white hover:bg-orange-500 transition-colors"
                  >
                    MOVE TO CART
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="max-w-md">
          <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Full Name
              </label>
              <p className="text-sm font-medium text-gray-900">
                {user.full_name || 'Not set'}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Email
              </label>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Phone
              </label>
              <p className="text-sm font-medium text-gray-900">
                {user.phone || 'Not set'}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Account Type
              </label>
              <p className="text-sm font-medium text-gray-900">
                {user.is_admin ? 'Administrator' : 'Customer'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
