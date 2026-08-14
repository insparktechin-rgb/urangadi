import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/lib/router';
import { getOrderByNumber, getUserOrders } from '@/lib/api';
import { useStore } from '@/lib/store';
import { formatINR, formatDateTime, classNames } from '@/lib/utils';
import {
  Package,
  CheckCircle2,
  Truck,
  Home,
  XCircle,
  Search,
} from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';

const STATUS_STEPS: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'pending', label: 'Order Placed', icon: Package },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'packed', label: 'Packed', icon: Package },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: Home },
];

export function TrackOrderPage({ orderId }: { orderId?: string }) {
  const { navigate } = useRouter();
  const { user } = useStore();
  const [searchInput, setSearchInput] = useState(orderId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      searchOrder(orderId);
    } else if (user) {
      loadUserOrders();
    }
  }, [orderId, user]);

  const loadUserOrders = async () => {
    if (!user) return;
    try {
      const orders = await getUserOrders(user.id);
      setUserOrders(orders);
    } catch (e) {
      console.error('Failed to load orders:', e);
    }
  };

  const searchOrder = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrderByNumber(id);
      if (data) {
        setOrder(data);
      } else {
        setError('Order not found. Please check your order ID.');
        setOrder(null);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track-order?id=${searchInput.trim()}`);
      searchOrder(searchInput.trim());
    }
  };

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex((s) => s.status === order.status)
    : -1;
  const isCancelled = order?.status === 'cancelled' || order?.status === 'returned';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Track Your Order</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter your order ID (e.g. URG...)"
            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600"
        >
          TRACK
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading order details...</p>
        </div>
      )}

      {/* Order tracker */}
      {order && !loading && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">Order ID</p>
              <p className="font-bold text-gray-900">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Order Date</p>
              <p className="font-bold text-gray-900">
                {formatDateTime(order.created_at)}
              </p>
            </div>
          </div>

          <div className="mb-6 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl flex items-center justify-between text-xs text-orange-950">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <div>
                <p className="font-extrabold text-orange-900">1-Hour Mysuru Express Delivery</p>
                <p className="text-orange-700 font-medium">Estimated Arrival: Within 60 Minutes (FREE Delivery)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-orange-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-wide">
              Live Express
            </span>
          </div>

          {isCancelled ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <XCircle size={20} className="text-red-500" />
              <p className="text-sm font-bold text-red-700">
                Order {order.status === 'returned' ? 'Returned' : 'Cancelled'}
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-green-500 transition-all duration-500"
                style={{
                  width: `calc(${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}% - ${currentStepIndex === 0 ? 0 : 20}px)`,
                }}
              />
              {/* Steps */}
              <div className="relative flex justify-between">
                {STATUS_STEPS.map((s, i) => (
                  <div
                    key={s.status}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={classNames(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors z-10',
                        i <= currentStepIndex
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-white border-gray-200 text-gray-300',
                      )}
                    >
                      <s.icon size={18} />
                    </div>
                    <span
                      className={classNames(
                        'text-[10px] font-medium text-center',
                        i <= currentStepIndex
                          ? 'text-gray-900'
                          : 'text-gray-400',
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order items */}
      {order && !loading && (order.items || []).length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Items</h3>
          <div className="space-y-3">
            {(order.items || []).map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.color} · Size: {item.size} · Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatINR(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">
              {formatINR(order.total)}
            </span>
          </div>
        </div>
      )}

      {/* Recent orders */}
      {!order && !loading && userOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Your Recent Orders
          </h2>
          <div className="space-y-2">
            {userOrders.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setSearchInput(o.order_number);
                  navigate(`/track-order?id=${o.order_number}`);
                  searchOrder(o.order_number);
                }}
                className="flex items-center justify-between w-full p-4 bg-white border border-gray-100 rounded-xl hover:border-orange-200 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {o.order_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(o.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatINR(o.total)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {o.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!order && !loading && !user && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Sign in to view your order history, or enter an order ID above to
            track a specific order.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-block px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
