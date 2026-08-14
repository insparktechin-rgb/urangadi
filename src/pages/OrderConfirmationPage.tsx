import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/lib/router';
import { getOrderByNumber } from '@/lib/api';
import { formatINR, formatDateTime, classNames } from '@/lib/utils';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import type { Order } from '@/lib/types';

export function OrderConfirmationPage({ orderNumber }: { orderNumber: string }) {
  const { navigate } = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrderByNumber(orderNumber);
        setOrder(data);
      } catch (e) {
        console.error('Failed to load order:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
        <Link to="/" className="mt-4 inline-block text-orange-600 font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  const address = order.address as any;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mb-4 animate-[pop_0.4s_ease-out]">
          <CheckCircle2 size={44} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">ORDER PLACED!</h1>
        <p className="mt-2 text-gray-500">
          Thank you for shopping with URANGADI.
        </p>
      </div>

      {/* Order details */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">Order ID</p>
            <p className="font-bold text-gray-900">{order.order_number}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Order Date</p>
            <p className="font-bold text-gray-900">
              {formatDateTime(order.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Amount</p>
            <p className="font-bold text-gray-900">{formatINR(order.total)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Payment</p>
            <p className="font-bold text-gray-900 uppercase">
              {order.payment_method}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={18} className="text-orange-500" />
          <h3 className="text-sm font-bold text-gray-900">
            Delivery Address
          </h3>
        </div>
        <p className="text-sm text-gray-700">
          {address.full_name}, {address.house}, {address.street}, {address.area}
          {address.landmark ? `, ${address.landmark}` : ''}, {address.city},{' '}
          {address.state} — {address.pincode}
        </p>
        <p className="text-xs text-gray-500 mt-1">Mobile: {address.mobile}</p>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Package size={18} className="text-orange-500" />
          <h3 className="text-sm font-bold text-gray-900">Order Items</h3>
        </div>
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
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatINR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>
              {order.delivery_fee === 0
                ? 'FREE'
                : formatINR(order.delivery_fee)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-1">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Expected delivery */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-green-600" />
          <h3 className="text-sm font-bold text-green-800">
            Expected Delivery
          </h3>
        </div>
        <p className="mt-1 text-sm text-green-700">
          Your order is confirmed and will be delivered across Mysuru. Fast
          delivery available. You'll receive updates on your registered mobile
          number.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(`/track-order?id=${order.order_number}`)}
          className="flex-1 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <Truck size={18} />
          TRACK ORDER
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3.5 bg-white text-gray-900 font-bold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
        >
          CONTINUE SHOPPING
        </button>
      </div>
    </div>
  );
}
