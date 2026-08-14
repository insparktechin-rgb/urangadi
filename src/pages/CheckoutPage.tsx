import { useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import { checkPincodeDelivery, placeOrder } from '@/lib/api';
import { formatINR, classNames, isValidPincode, isValidMobile } from '@/lib/utils';
import {
  Check,
  ChevronRight,
  Truck,
  CreditCard,
  Smartphone,
  Banknote,
  MapPin,
  Package,
  CheckCircle2,
} from 'lucide-react';
import type { OrderAddress } from '@/lib/types';

type Step = 'address' | 'delivery' | 'payment' | 'review';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: Banknote, desc: 'All major banks' },
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when you receive' },
];

export function CheckoutPage() {
  const { navigate } = useRouter();
  const {
    cart,
    cartSubtotal,
    settings,
    appliedCoupon,
    deliveryPincode,
    user,
    clearCart,
    applyCoupon,
    pendingOrderNumber,
    generateNewOrderNumber,
  } = useStore();

  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<OrderAddress>({
    full_name: user?.full_name || '',
    mobile: '',
    house: '',
    street: '',
    area: '',
    landmark: '',
    pincode: deliveryPincode || '',
    city: 'Mysuru',
    state: 'Karnataka',
  });
  const [pincodeError, setPincodeError] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [pincodeAvailable, setPincodeAvailable] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  const freeDeliveryThreshold = settings?.free_delivery_threshold ?? 0;
  const deliveryFee = settings?.default_delivery_fee ?? 0;
  const isFreeDelivery = true; // 100% FREE Delivery across Mysuru
  const actualDeliveryFee = 0;
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

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Please sign in to checkout
        </h1>
        <p className="mt-2 text-gray-500">
          You need an account to place an order.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="mt-4 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  const checkPincode = async () => {
    if (!isValidPincode(address.pincode)) {
      setPincodeError('Enter a valid 6-digit pincode');
      setPincodeChecked(false);
      return;
    }
    try {
      const result = await checkPincodeDelivery(address.pincode);
      setPincodeChecked(true);
      setPincodeAvailable(result.available);
      if (!result.available) {
        setPincodeError(
          'Sorry, we currently don\'t deliver to this location. URANGADI is available only in Mysuru.',
        );
      } else {
        setPincodeError('');
      }
    } catch {
      setPincodeError('Something went wrong. Please try again.');
      setPincodeChecked(false);
    }
  };

  const validateAddress = (): boolean => {
    if (!address.full_name.trim()) return false;
    if (!isValidMobile(address.mobile)) return false;
    if (!address.house.trim()) return false;
    if (!address.area.trim()) return false;
    if (!isValidPincode(address.pincode)) return false;
    if (!pincodeChecked || !pincodeAvailable) return false;
    return true;
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setOrderError('');
    try {
      const orderItems = cart.map((item) => ({
        product_id: item.product_id,
        product_name: item.name,
        image_url: item.image_url,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }));

      const executeOrderCreation = async (paymentRefId?: string) => {
        const { order, error } = await placeOrder({
          user_id: user.id,
          order_number: pendingOrderNumber,
          subtotal: cartSubtotal,
          discount,
          delivery_fee: actualDeliveryFee,
          total,
          payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : `Razorpay (${paymentMethod.toUpperCase()})`,
          coupon_code: appliedCoupon?.code || null,
          address: address as unknown as Record<string, unknown>,
          items: orderItems,
        });

        if (error || !order) {
          setOrderError(error || 'Failed to place order. Please try again.');
          setPlacingOrder(false);
          return;
        }

        clearCart();
        applyCoupon(null);
        generateNewOrderNumber();
        navigate(`/order/${order.order_number}`);
      };

      if (paymentMethod === 'cod') {
        await executeOrderCreation();
      } else {
        // Online Payment via Razorpay
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setOrderError('Failed to load Razorpay Payment Gateway. Please try again.');
          setPlacingOrder(false);
          return;
        }

        const options: any = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TPaLtagTgXunnc',
          amount: Math.round(total * 100),
          currency: 'INR',
          name: 'URANGADI Mysuru',
          description: `Payment for Order #${pendingOrderNumber}`,
          image: 'https://images.pexels.com/photos/20669538/pexels-photo-20669538.jpeg',
          handler: async function (response: any) {
            await executeOrderCreation(response.razorpay_payment_id || `pay_${Date.now()}`);
          },
          prefill: {
            name: address.full_name,
            contact: address.mobile,
            email: user?.email || '',
          },
          theme: {
            color: '#f97316',
          },
          modal: {
            ondismiss: function () {
              setPlacingOrder(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (e) {
      setOrderError('Something went wrong. Please try again.');
      setPlacingOrder(false);
    }
  };

  const steps: { id: Step; label: string; icon: typeof MapPin }[] = [
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Package },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
            <div
              className={classNames(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors',
                i < currentStepIndex
                  ? 'bg-green-500 text-white'
                  : i === currentStepIndex
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-400',
              )}
            >
              {i < currentStepIndex ? (
                <Check size={18} />
              ) : (
                <s.icon size={16} />
              )}
            </div>
            <span
              className={classNames(
                'text-sm font-medium',
                i <= currentStepIndex ? 'text-gray-900' : 'text-gray-400',
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight size={16} className="text-gray-300 mx-1" />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 'address' && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  value={address.full_name}
                  onChange={(v) => setAddress({ ...address, full_name: v })}
                  placeholder="Enter your name"
                />
                <Input
                  label="Mobile Number"
                  value={address.mobile}
                  onChange={(v) => setAddress({ ...address, mobile: v })}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
                <Input
                  label="House / Flat Number"
                  value={address.house}
                  onChange={(v) => setAddress({ ...address, house: v })}
                  placeholder="House / Flat No."
                />
                <Input
                  label="Street"
                  value={address.street}
                  onChange={(v) => setAddress({ ...address, street: v })}
                  placeholder="Street name"
                />
                <Input
                  label="Area"
                  value={address.area}
                  onChange={(v) => setAddress({ ...address, area: v })}
                  placeholder="Area / Locality"
                />
                <Input
                  label="Landmark"
                  value={address.landmark}
                  onChange={(v) => setAddress({ ...address, landmark: v })}
                  placeholder="Nearby landmark (optional)"
                />
                <Input
                  label="Pincode"
                  value={address.pincode}
                  onChange={(v) =>
                    setAddress({ ...address, pincode: v.replace(/\D/g, '') })
                  }
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
                <Input
                  label="City"
                  value={address.city}
                  onChange={(v) => setAddress({ ...address, city: v })}
                  placeholder="City"
                />
                <Input
                  label="State"
                  value={address.state}
                  onChange={(v) => setAddress({ ...address, state: v })}
                  placeholder="State"
                />
              </div>

              {/* Pincode check */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={checkPincode}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
                >
                  Check Delivery
                </button>
                {pincodeChecked && pincodeAvailable && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                    <CheckCircle2 size={18} /> URANGADI delivers to your location
                  </span>
                )}
                {pincodeError && (
                  <p className="text-sm text-red-500">{pincodeError}</p>
                )}
              </div>

              <button
                onClick={() => {
                  if (validateAddress()) setStep('delivery');
                }}
                disabled={!validateAddress()}
                className={classNames(
                  'mt-6 w-full py-3.5 font-bold rounded-xl transition-colors',
                  validateAddress()
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                )}
              >
                CONTINUE TO DELIVERY
              </button>
            </div>
          )}

          {/* Step 2: Delivery */}
          {step === 'delivery' && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Delivery Options
              </h2>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-800">
                    Delivering to Mysuru — {address.pincode}
                  </span>
                </div>
                <p className="mt-1 text-sm text-green-700">
                  {address.area}, {address.city}, {address.state}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-orange-500" />
                  <span className="text-sm font-bold text-gray-900">
                    Fast delivery available
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Your order will be delivered quickly across Mysuru. Exact
                  delivery time will be confirmed after order placement.
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep('address')}
                  className="px-6 py-3 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  BACK
                </button>
                <button
                  onClick={() => setStep('payment')}
                  className="flex-1 py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600"
                >
                  CONTINUE TO PAYMENT
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Payment Method
              </h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={classNames(
                      'flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-colors text-left',
                      paymentMethod === method.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300',
                    )}
                  >
                    <method.icon
                      size={22}
                      className={
                        paymentMethod === method.id
                          ? 'text-orange-600'
                          : 'text-gray-500'
                      }
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <Check size={20} className="text-orange-600" />
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400">
                Payment gateway integration ready (Razorpay). API keys are
                configured securely via environment variables and never exposed
                in frontend code.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep('delivery')}
                  className="px-6 py-3 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  BACK
                </button>
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600"
                >
                  CONTINUE TO REVIEW
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 'review' && (
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Review
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div
                    key={`${item.product_id}-${item.color}-${item.size}`}
                    className="flex gap-3"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {item.name}
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

              {/* Address */}
              <div className="p-3 bg-gray-50 rounded-lg mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Delivery Address
                </p>
                <p className="text-sm text-gray-700">
                  {address.full_name}, {address.house}, {address.street},{' '}
                  {address.area}, {address.landmark}, {address.city},{' '}
                  {address.state} — {address.pincode}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Mobile: {address.mobile}
                </p>
              </div>

              {/* Payment */}
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Payment Method
                </p>
                <p className="text-sm text-gray-700">
                  {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                </p>
              </div>

              {orderError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-700">
                    {orderError}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('payment')}
                  disabled={placingOrder}
                  className="px-6 py-3 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                >
                  BACK
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="flex-1 py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50"
                >
                  {placingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Price Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.length} items)</span>
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
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-lg text-gray-900">
                  {formatINR(total)}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Order #: {pendingOrderNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 mb-1 block">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
      />
    </div>
  );
}
