import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import {
  adminGetProducts,
  adminGetAllOrders,
  adminGetAllProfiles,
  adminDeleteProduct,
  adminUpdateVariantStock,
  adminCreateProduct,
  adminUpdateProduct,
  adminCreateCoupon,
  adminDeleteCoupon,
  adminCreateDeliveryZone,
  adminDeleteDeliveryZone,
  adminUpdateSetting,
  adminGetNotifyRequests,
  updateOrderStatus,
  getCategories,
  getCoupons,
} from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { formatINR, formatDate, classNames, slugify, getProductImageUrl, getAllProductImages } from '@/lib/utils';
import {
  Package,
  ClipboardList,
  Users,
  Tag,
  MapPin,
  Settings,
  Bell,
  Trash2,
  Plus,
  X,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  ShieldCheck,
  LogOut,
  CreditCard,
  CheckCircle2,
  Edit,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import type { Product, Order, Coupon, DeliveryZone } from '@/lib/types';

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'demo-prod-1',
    name: 'Mysuru Silk Blend Festive Kurta',
    slug: 'mysuru-silk-blend-festive-kurta',
    description: 'Rich royal blue silk blend traditional ethnic wear kurta crafted for Mysuru celebrations.',
    category_id: 'cat-men',
    gender: 'men',
    price: 1499,
    mrp: 2999,
    discount_pct: 50,
    rating: 4.8,
    review_count: 42,
    brand: 'URANGADI',
    is_new: true,
    is_bestseller: true,
    is_flash_sale: false,
    flash_sale_stock: 0,
    created_at: new Date().toISOString(),
    images: [
      {
        id: 'img-1',
        product_id: 'demo-prod-1',
        image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop',
        sort_order: 0,
      },
    ],
    variants: [
      { id: 'var-1', product_id: 'demo-prod-1', color: 'Royal Blue', size: 'M', sku: 'MSK-RB-M', stock: 15 },
      { id: 'var-2', product_id: 'demo-prod-1', color: 'Royal Blue', size: 'L', sku: 'MSK-RB-L', stock: 8 },
    ],
  },
  {
    id: 'demo-prod-2',
    name: 'Channapatna Printed Georgette Saree',
    slug: 'channapatna-printed-georgette-saree',
    description: 'Vibrant golden yellow printed saree featuring authentic Mysuru handicraft motifs.',
    category_id: 'cat-women',
    gender: 'women',
    price: 999,
    mrp: 1999,
    discount_pct: 50,
    rating: 4.9,
    review_count: 28,
    brand: 'URANGADI',
    is_new: false,
    is_bestseller: true,
    is_flash_sale: true,
    flash_sale_stock: 20,
    created_at: new Date().toISOString(),
    images: [
      {
        id: 'img-2',
        product_id: 'demo-prod-2',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop',
        sort_order: 0,
      },
    ],
    variants: [
      { id: 'var-3', product_id: 'demo-prod-2', color: 'Yellow', size: 'Free Size', sku: 'CPS-YEL-FS', stock: 30 },
    ],
  },
];

const FALLBACK_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    user_id: 'usr-demo',
    order_number: 'URG-2026-9481',
    status: 'delivered',
    subtotal: 1499,
    discount: 100,
    delivery_fee: 0,
    total: 1399,
    payment_method: 'COD',
    coupon_code: 'WELCOME100',
    address: {
      full_name: 'Suhas Gowda',
      mobile: '9845012345',
      house: '#12, 4th Main',
      street: 'Gokulam 3rd Stage',
      area: 'Gokulam',
      landmark: 'Near Contour Road',
      pincode: '570002',
      city: 'Mysuru',
      state: 'Karnataka',
    },
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'oi-1',
        order_id: 'ord-1001',
        product_id: 'demo-prod-1',
        product_name: 'Mysuru Silk Blend Festive Kurta',
        image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop',
        color: 'Royal Blue',
        size: 'M',
        quantity: 1,
        price: 1499,
      },
    ],
  },
];

const FALLBACK_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'dz-1',
    city: 'Mysuru',
    pincode: '570002',
    area: 'Gokulam 1st, 2nd, 3rd Stage',
    delivery_charge: 0,
    min_order: 499,
    is_active: true,
  },
  {
    id: 'dz-2',
    city: 'Mysuru',
    pincode: '570001',
    area: 'Devaraja Mohalla / City Market',
    delivery_charge: 29,
    min_order: 299,
    is_active: true,
  },
];

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'payments'
  | 'customers'
  | 'coupons'
  | 'delivery'
  | 'settings'
  | 'notifications';

export function AdminPage() {
  const { navigate } = useRouter();
  const { user, settings } = useStore();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [notifyRequests, setNotifyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('urangadi_demo_admin') === 'true';
  });

  useEffect(() => {
    if (user?.is_admin || isDemoMode) {
      loadAll();
    } else {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [prods, ords, profs, coups] = await Promise.all([
        adminGetProducts().catch(() => FALLBACK_PRODUCTS),
        adminGetAllOrders().catch(() => FALLBACK_ORDERS),
        adminGetAllProfiles().catch(() => []),
        getCoupons().catch(() => []),
      ]);
      setProducts(prods || []);
      setOrders(ords && ords.length > 0 ? ords : FALLBACK_ORDERS);
      setProfiles(profs);
      setCoupons(coups);

      const { data: zones } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('pincode');
      setDeliveryZones((zones && zones.length > 0 ? zones : FALLBACK_DELIVERY_ZONES) as DeliveryZone[]);

      const notifs = await adminGetNotifyRequests().catch(() => []);
      setNotifyRequests(notifs || []);
    } catch (e) {
      console.error('Admin load failed:', e);
      setProducts(FALLBACK_PRODUCTS);
      setOrders(FALLBACK_ORDERS);
      setDeliveryZones(FALLBACK_DELIVERY_ZONES);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableDemo = () => {
    localStorage.setItem('urangadi_demo_admin', 'true');
    setIsDemoMode(true);
  };

  const handleDisableDemo = () => {
    localStorage.removeItem('urangadi_demo_admin');
    setIsDemoMode(false);
  };

  if (!user?.is_admin && !isDemoMode) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-xl text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-5 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
            URANGADI Admin Portal
          </h2>
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Welcome to the store administration center. Sign in with an admin account or switch to Demo Mode to explore all features.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleEnableDemo}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              ⚡ Launch Admin Dashboard (Demo Access)
            </button>

            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors text-sm"
            >
              Sign In with Admin Account
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400">
            Default Admin Credentials: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">admin@urangadi.com</code>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: typeof Package }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders & Tracking', icon: ClipboardList },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'delivery', label: 'Delivery Zones', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Stats
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'confirmed',
  ).length;
  const lowStockVariants = products.flatMap((p) =>
    (p.variants || []).filter((v) => v.stock > 0 && v.stock <= 3),
  );
  const outOfStockVariants = products.flatMap((p) =>
    (p.variants || []).filter((v) => v.stock === 0),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500">URANGADI Management Console</p>
          </div>
          <div className="flex items-center gap-3">
            {isDemoMode && (
              <button
                onClick={handleDisableDemo}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit Demo
              </button>
            )}
            <Link
              to="/"
              className="text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              ← Back to Store
            </Link>
          </div>
        </div>

        {isDemoMode && (
          <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span><strong>Demo Mode Active:</strong> Fully interactive preview of URANGADI Admin Dashboard.</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white rounded-lg border border-gray-100 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={classNames(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap',
                tab === t.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              <t.icon size={16} />
              {t.label}
              {t.id === 'notifications' && notifyRequests.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[10px] text-white">
                  {notifyRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading...</p>
        ) : (
          <>
            {/* Dashboard */}
            {tab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Revenue"
                    value={formatINR(totalRevenue)}
                    icon={TrendingUp}
                    color="bg-green-50 text-green-600"
                  />
                  <StatCard
                    label="Total Orders"
                    value={totalOrders.toString()}
                    icon={ShoppingBag}
                    color="bg-blue-50 text-blue-600"
                  />
                  <StatCard
                    label="Pending Orders"
                    value={pendingOrders.toString()}
                    icon={ClipboardList}
                    color="bg-orange-50 text-orange-600"
                  />
                  <StatCard
                    label="Products"
                    value={products.length.toString()}
                    icon={Package}
                    color="bg-gray-100 text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={18} className="text-orange-500" />
                      <h3 className="text-sm font-bold text-gray-900">
                        Inventory Alerts
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Low stock variants</span>
                        <span className="font-bold text-orange-600">
                          {lowStockVariants.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Out of stock variants</span>
                        <span className="font-bold text-red-500">
                          {outOfStockVariants.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bell size={18} className="text-orange-500" />
                      <h3 className="text-sm font-bold text-gray-900">
                        Expansion Requests
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {notifyRequests.length} customers waiting for URANGADI in
                      their city.
                    </p>
                    <button
                      onClick={() => setTab('notifications')}
                      className="mt-2 text-sm font-semibold text-orange-600"
                    >
                      View requests →
                    </button>
                  </div>
                </div>

                {/* Recent orders */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">
                    Recent Orders
                  </h3>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.order_number}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {formatINR(order.total)}
                          </p>
                          <p className="text-xs capitalize text-gray-500">
                            {order.status.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products */}
            {tab === 'products' && (
              <ProductsTab
                products={products}
                onDelete={async (id) => {
                  await adminDeleteProduct(id);
                  loadAll();
                }}
                onCreated={() => loadAll()}
              />
            )}

            {/* Orders */}
            {tab === 'orders' && (
              <OrdersTab
                orders={orders}
                onStatusChange={async (id, status) => {
                  await updateOrderStatus(id, status);
                  loadAll();
                }}
              />
            )}

            {/* Customers */}
            {tab === 'customers' && <CustomersTab profiles={profiles} />}

            {/* Coupons */}
            {tab === 'coupons' && (
              <CouponsTab
                coupons={coupons}
                onCreate={async (coupon) => {
                  await adminCreateCoupon(coupon);
                  loadAll();
                }}
                onDelete={async (id) => {
                  await adminDeleteCoupon(id);
                  loadAll();
                }}
              />
            )}

            {/* Delivery Zones */}
            {tab === 'delivery' && (
              <DeliveryTab
                zones={deliveryZones}
                onCreate={async (zone) => {
                  await adminCreateDeliveryZone(zone);
                  loadAll();
                }}
                onDelete={async (id) => {
                  await adminDeleteDeliveryZone(id);
                  loadAll();
                }}
              />
            )}

            {/* Notifications */}
            {tab === 'notifications' && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Expansion Notification Requests
                </h3>
                {notifyRequests.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No notification requests yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {notifyRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {req.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {req.mobile} · {req.city} — {req.pincode}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatDate(req.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payments */}
            {tab === 'payments' && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Payment Transactions & Settlement Management
                    </h2>
                    <p className="text-xs text-gray-500">
                      Verify transaction logs, payment methods (UPI, Cards, COD), and settlement statuses.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                        <th className="py-3 px-4">Transaction Ref</th>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Settlement Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-mono text-xs text-gray-600">
                            TXN_{order.payment_method.toUpperCase()}_{order.order_number.replace('URG-2026-', '')}
                          </td>
                          <td className="py-3 px-4 font-semibold text-orange-600">
                            {order.order_number}
                          </td>
                          <td className="py-3 px-4 text-gray-900 font-medium">
                            {order.address?.full_name || 'Customer'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-700 uppercase">
                              {order.payment_method}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">
                            {formatINR(order.total)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={classNames(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                                order.status === 'delivered' || order.payment_method === 'UPI'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              )}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {order.status === 'delivered' || order.payment_method === 'UPI' ? 'Settled' : 'Pending Verification'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings */}
            {tab === 'settings' && (
              <SettingsTab
                settings={settings}
                onSave={async (key, value) => {
                  await adminUpdateSetting(key, value);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Package;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

const STANDARD_CATEGORIES = [
  { id: 'cat-men', name: 'Men', gender: 'men' },
  { id: 'cat-women', name: 'Women', gender: 'women' },
  { id: 'cat-accessories', name: 'Accessories', gender: 'unisex' },
  { id: 'cat-shoes', name: 'Shoes', gender: 'unisex' },
  { id: 'cat-slippers', name: 'Slippers', gender: 'unisex' },
  { id: 'cat-new', name: 'New Arrivals', gender: 'unisex' },
];

function ProductsTab({
  products,
  onDelete,
  onCreated,
}: {
  products: Product[];
  onDelete: (id: string) => void;
  onCreated: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Products Catalog ({products.length})
        </h3>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-bold rounded-xl shadow-md hover:from-orange-600 hover:to-amber-700 transition-all"
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      <div className="space-y-2.5">
        {products.map((p) => {
          const totalStock = (p.variants || []).reduce(
            (sum, v) => sum + v.stock,
            0,
          );
          const firstImage = getProductImageUrl(p);
          return (
            <div
              key={p.id}
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100 flex-shrink-0 border border-gray-100">
                <img
                  src={firstImage}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {p.name}
                  </p>
                  {p.is_new && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-md uppercase">
                      New
                    </span>
                  )}
                  {p.is_bestseller && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-extrabold text-[10px] rounded-md uppercase">
                      Bestseller
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="font-bold text-gray-900">{formatINR(p.price)}</span>
                  <span className="line-through text-gray-400">{formatINR(p.mrp)}</span>
                  <span>·</span>
                  <span className="capitalize">{p.gender}</span>
                  <span>·</span>
                  <span
                    className={
                      totalStock === 0
                        ? 'text-red-500 font-bold'
                        : totalStock <= 10
                          ? 'text-orange-500 font-bold'
                          : 'text-emerald-600 font-semibold'
                    }
                  >
                    Stock: {totalStock} units
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Edit Product"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                      onDelete(p.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Product"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <ProductForm
          initialData={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditingProduct(null);
            onCreated();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  initialData,
  onClose,
  onSaved,
}: {
  initialData?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(initialData);
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category_id || 'cat-men');
  const [gender, setGender] = useState(initialData?.gender || 'unisex');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [mrp, setMrp] = useState(initialData?.mrp?.toString() || '');
  const [isNew, setIsNew] = useState(initialData?.is_new || false);
  const [isBestseller, setIsBestseller] = useState(initialData?.is_bestseller || false);
  const [isFlashSale, setIsFlashSale] = useState(initialData?.is_flash_sale || false);
  
  const initialImageUrls = getAllProductImages(initialData);
  const [imagesList, setImagesList] = useState<string[]>(initialImageUrls);
  const [urlInput, setUrlInput] = useState('');

  const initialColors = Array.from(new Set((initialData?.variants || []).map((v) => v.color))).join(', ');
  const initialSizes = Array.from(new Set((initialData?.variants || []).map((v) => v.size))).join(', ');
  const initialStock = (initialData?.variants || [])[0]?.stock?.toString() || '10';

  const [colors, setColors] = useState(initialColors || 'Black, White, Royal Blue');
  const [sizes, setSizes] = useState(initialSizes || 'S, M, L, XL');
  const [stock, setStock] = useState(initialStock);
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>(STANDARD_CATEGORIES);

  useEffect(() => {
    getCategories()
      .then((cats) => {
        if (cats && cats.length > 0) setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImagesList((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImage = () => {
    if (urlInput.trim()) {
      setImagesList((prev) => [...prev, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !price || !mrp || !category) {
      setError('Please fill all required fields (Name, Price, MRP, Category)');
      return;
    }
    if (imagesList.length === 0) {
      setError('Please upload or add at least 1 image for the product');
      return;
    }

    setSubmitting(true);
    try {
      const colorList = colors.split(',').map((c) => c.trim()).filter(Boolean);
      const sizeList = sizes.split(',').map((s) => s.trim()).filter(Boolean);
      const stockNum = parseInt(stock) || 0;
      const variants = colorList.flatMap((color) =>
        sizeList.map((size) => ({ color, size, stock: stockNum })),
      );

      const payload = {
        name: name.trim(),
        slug: slugify(name.trim()),
        description: description.trim(),
        category_id: category,
        gender,
        price: parseInt(price),
        mrp: parseInt(mrp),
        is_new: isNew,
        is_bestseller: isBestseller,
        is_flash_sale: isFlashSale,
        flash_sale_stock: isFlashSale ? stockNum : 0,
        images: imagesList,
        variants,
        details: {
          material: 'Premium Cotton Blend',
          fit: 'Regular Fit',
          pattern: 'Solid / Graphic',
          sleeve: 'Half Sleeve',
          neck: 'Round Neck',
          occasion: 'Casual / Festive',
          wash_care: 'Machine wash cold with like colors',
          highlights: ['1-Hour Express Delivery', 'Premium Handcrafted Fabric'],
        },
      };

      if (isEditing && initialData) {
        const { error: updateError } = await adminUpdateProduct(initialData.id, payload);
        if (updateError) {
          setError(updateError);
        } else {
          onSaved();
        }
      } else {
        const { error: createError } = await adminCreateProduct(payload);
        if (createError) {
          setError(createError);
        } else {
          onSaved();
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-xl font-black text-gray-900">
            {isEditing ? `Edit Product: ${initialData?.name}` : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mysuru Silk Festive Kurta"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product materials, fit details and highlights..."
              rows={2}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Gender Segment</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium bg-white"
              >
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1299"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">MRP Price (₹) *</label>
              <input
                type="number"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="2499"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-gray-500"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <ImageIcon size={16} className="text-orange-500" />
              Product Images (Upload Files or Add URL)
            </label>

            <div className="mb-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-orange-500 text-gray-800 font-bold rounded-xl shadow-sm text-xs transition-all">
                <Upload size={16} className="text-orange-500" />
                Select Device Image Files (Upload from Device)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDeviceFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 bg-white"
              />
              <button
                type="button"
                onClick={handleAddUrlImage}
                className="px-3 py-2 bg-gray-900 text-white font-bold text-xs rounded-lg hover:bg-gray-800"
              >
                Add URL
              </button>
            </div>

            {imagesList.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-200">
                {imagesList.map((imgUrl, idx) => (
                  <div key={idx} className="relative group h-20 rounded-lg overflow-hidden border border-gray-300 bg-white">
                    <img src={imgUrl} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 h-5 w-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-90 hover:opacity-100 shadow-md"
                      title="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No images selected yet.</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Colors</label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="Black, White, Blue"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Sizes</label>
              <input
                type="text"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="S, M, L, XL"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Stock / Variant</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="h-4 w-4 rounded text-orange-500 focus:ring-orange-500"
              />
              New Arrival
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="h-4 w-4 rounded text-orange-500 focus:ring-orange-500"
              />
              Bestseller
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isFlashSale}
                onChange={(e) => setIsFlashSale(e.target.checked)}
                className="h-4 w-4 rounded text-orange-500 focus:ring-orange-500"
              />
              Flash Sale
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/25 transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Saving Product...'
              ) : isEditing ? (
                <>
                  <Edit size={16} /> Save Product Changes
                </>
              ) : (
                <>
                  <Plus size={16} /> Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrdersTab({
  orders,
  onStatusChange,
}: {
  orders: Order[];
  onStatusChange: (id: string, status: string) => void;
}) {
  const statuses = [
    'pending',
    'confirmed',
    'packed',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900">Orders ({orders.length})</h3>
      {orders.map((order) => {
        const addr = order.address as any;
        return (
          <div
            key={order.id}
            className="bg-white border border-gray-100 rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {order.order_number}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(order.created_at)} · {formatINR(order.total)}
                </p>
              </div>
              <select
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 capitalize"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500">
              <p>
                {addr?.full_name} · {addr?.mobile}
              </p>
              <p>
                {addr?.area}, {addr?.city} — {addr?.pincode}
              </p>
            </div>
            <div className="mt-2 flex gap-1">
              {(order.items || []).slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="h-10 w-10 overflow-hidden rounded bg-gray-100"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CustomersTab({ profiles }: { profiles: any[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900">
        Customers ({profiles.length})
      </h3>
      {profiles.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl"
        >
          <div>
            <p className="text-sm font-bold text-gray-900">
              {p.full_name || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500">{p.email}</p>
            {p.phone && <p className="text-xs text-gray-500">{p.phone}</p>}
          </div>
          <div>
            {p.is_admin ? (
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                Admin
              </span>
            ) : (
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                Customer
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CouponsTab({
  coupons,
  onCreate,
  onDelete,
}: {
  coupons: Coupon[];
  onCreate: (coupon: Omit<Coupon, 'id' | 'used_count'>) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState('flat');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) return;
    onCreate({
      code: code.toUpperCase().trim(),
      type: type as any,
      value: parseInt(value),
      min_order: parseInt(minOrder) || 0,
      max_discount: null,
      expiry_date: null,
      usage_limit: null,
      is_active: true,
    });
    setCode('');
    setValue('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Coupons ({coupons.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600"
        >
          <Plus size={16} />
          Add Coupon
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-xl p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon code"
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
            >
              <option value="flat">Flat (₹)</option>
              <option value="percent">Percent (%)</option>
              <option value="free_delivery">Free Delivery</option>
            </select>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Value"
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="Min order (₹)"
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800"
          >
            CREATE COUPON
          </button>
        </form>
      )}

      <div className="space-y-2">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl"
          >
            <div>
              <p className="text-sm font-bold text-gray-900">{c.code}</p>
              <p className="text-xs text-gray-500">
                {c.type === 'flat'
                  ? `₹${c.value} off`
                  : c.type === 'percent'
                    ? `${c.value}% off`
                    : 'Free delivery'}{' '}
                · Min: ₹{c.min_order} · Used: {c.used_count}
              </p>
            </div>
            <button
              onClick={() => onDelete(c.id)}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryTab({
  zones,
  onCreate,
  onDelete,
}: {
  zones: DeliveryZone[];
  onCreate: (zone: Omit<DeliveryZone, 'id'>) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Mysuru');
  const [charge, setCharge] = useState('49');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    onCreate({
      pincode: pincode.trim(),
      area: area.trim(),
      city: city.trim() || 'Mysuru',
      delivery_charge: parseInt(charge) || 49,
      min_order: 0,
      is_active: true,
    });
    setPincode('');
    setArea('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Delivery Zones ({zones.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600"
        >
          <Plus size={16} />
          Add Zone
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-xl p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Pincode"
              maxLength={6}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Area name"
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
            <input
              type="number"
              value={charge}
              onChange={(e) => setCharge(e.target.value)}
              placeholder="Delivery charge (₹)"
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800"
          >
            ADD ZONE
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {zones.map((z) => (
          <div
            key={z.id}
            className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg text-sm"
          >
            <div>
              <p className="font-semibold text-gray-900">
                {z.pincode} — {z.area || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {z.city} · ₹{z.delivery_charge}
              </p>
            </div>
            <button
              onClick={() => onDelete(z.id)}
              className="p-1.5 text-gray-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({
  settings,
  onSave,
}: {
  settings: any;
  onSave: (key: string, value: string) => void;
}) {
  const [freeDelivery, setFreeDelivery] = useState(
    settings?.free_delivery_threshold?.toString() || '999',
  );
  const [deliveryFee, setDeliveryFee] = useState(
    settings?.default_delivery_fee?.toString() || '49',
  );
  const [whatsapp, setWhatsapp] = useState(
    settings?.whatsapp_number || '918000000000',
  );
  const [adminEmail, setAdminEmail] = useState(
    settings?.admin_email || 'admin@urangadi.com',
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave('free_delivery_threshold', freeDelivery);
    onSave('default_delivery_fee', deliveryFee);
    onSave('whatsapp_number', whatsapp);
    onSave('admin_email', adminEmail);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-md space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Store Settings</h3>
      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Free Delivery Threshold (₹)
          </label>
          <input
            type="number"
            value={freeDelivery}
            onChange={(e) => setFreeDelivery(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Default Delivery Fee (₹)
          </label>
          <input
            type="number"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            WhatsApp Number
          </label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Admin Email
          </label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400"
          />
          <p className="mt-1 text-xs text-gray-400">
            Users who sign up with this email get admin access.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600"
        >
          {saved ? 'SAVED!' : 'SAVE SETTINGS'}
        </button>
      </div>
    </div>
  );
}
