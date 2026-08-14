import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import { validateCoupon } from '@/lib/api';
import { formatINR, classNames } from '@/lib/utils';
import {
  Trash2,
  Minus,
  Plus,
  Heart,
  ShoppingBag,
  Tag,
  X,
  Truck,
  ChevronRight,
} from 'lucide-react';

export function CartPage() {
  const { navigate } = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    toggleWishlist,
    settings,
    appliedCoupon,
    applyCoupon,
    deliveryPincode,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const freeDeliveryThreshold = settings?.free_delivery_threshold || 999;
  const deliveryFee = settings?.default_delivery_fee || 49;

  const isFreeDelivery =
    cartSubtotal >= freeDeliveryThreshold || appliedCoupon?.type === 'free_delivery';
  const actualDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.min(
          Math.round((cartSubtotal * appliedCoupon.value) / 100),
          appliedCoupon.max_discount || Infinity,
        )
      : appliedCoupon.type === 'flat'
        ? appliedCoupon.value
        : 0
    : 0;

  const total = Math.max(0, cartSubtotal - discount) + actualDeliveryFee;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    const result = await validateCoupon(couponInput, cartSubtotal);
    if (result.valid && result.coupon) {
      applyCoupon(result.coupon);
      setCouponSuccess(`Coupon "${result.coupon.code}" applied!`);
      setCouponInput('');
    } else {
      setCouponError(result.error || 'Invalid coupon');
      applyCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon(null);
    setCouponSuccess('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 mb-6">
            <ShoppingBag size={36} className="text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Your cart is waiting for something stylish.
          </h1>
          <p className="mt-2 text-gray-500">
            Browse our latest collection and find your perfect look.
          </p>
          <button
            onClick={() => navigate('/category/men')}
            className="mt-6 px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
          >
            START SHOPPING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Your Cart ({cart.length})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <div
              key={`${item.product_id}-${item.color}-${item.size}`}
              className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl"
            >
              <Link
                to={`/product/${item.slug}`}
                className="flex-shrink-0"
              >
                <div className="h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.slug}`}
                  className="text-sm font-semibold text-gray-900 hover:text-orange-600 line-clamp-1"
                >
                  {item.name}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.color}</span>
                  <span>·</span>
                  <span>Size: {item.size}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {formatINR(item.price)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product_id,
                          item.color,
                          item.size,
                          item.quantity - 1,
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product_id,
                          item.color,
                          item.size,
                          item.quantity + 1,
                        )
                      }
                      disabled={item.quantity >= item.stock}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        toggleWishlist({
                          product_id: item.product_id,
                          name: item.name,
                          slug: item.slug,
                          price: item.price,
                          image_url: item.image_url,
                          mrp: item.price,
                        });
                        removeFromCart(item.product_id, item.color, item.size);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Move to wishlist"
                    >
                      <Heart size={18} />
                    </button>
                    <button
                      onClick={() =>
                        removeFromCart(item.product_id, item.color, item.size)
                      }
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            <ChevronRight size={16} className="rotate-180" />
            Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            {/* Coupon */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      {appliedCoupon.code}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
                    >
                      APPLY
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-2 text-xs text-red-500">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="mt-2 text-xs text-green-600">{couponSuccess}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Try: WELCOME100, FASHION20, FREESHIP
                  </p>
                </>
              )}
            </div>

            {/* Summary lines */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatINR(cartSubtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium text-gray-900">
                  {actualDeliveryFee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatINR(actualDeliveryFee)
                  )}
                </span>
              </div>
              {!isFreeDelivery && (
                <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                  <Truck size={14} />
                  Add {formatINR(freeDeliveryThreshold - cartSubtotal)} more for
                  FREE delivery
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-lg text-gray-900">
                  {formatINR(total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="mt-4 w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
            >
              PROCEED TO CHECKOUT
            </button>

            {deliveryPincode && (
              <p className="mt-3 text-xs text-center text-gray-500">
                Delivering to: {deliveryPincode} (Mysuru)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Checkout Bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="block text-[11px] text-gray-500 font-medium">Total</span>
          <span className="text-lg font-extrabold text-gray-900 leading-none">
            {formatINR(total)}
          </span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="py-3 px-6 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md active:scale-95 flex-1 max-w-[220px] text-center"
        >
          PROCEED TO CHECKOUT
        </button>
      </div>
    </div>
  );
}
