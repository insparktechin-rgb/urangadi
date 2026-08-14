import { supabase } from '@/lib/supabase';
import type {
  Product,
  ProductImage,
  ProductVariant,
  ProductDetail,
  Category,
  Review,
  DeliveryZone,
  Coupon,
  Order,
  OrderItem,
} from '@/lib/types';

const PRODUCTS_KEY = 'urangadi_products';
const ORDERS_KEY = 'urangadi_orders';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'demo-prod-1',
    name: 'Mysuru Silk Blend Festive Kurta',
    slug: 'mysuru-silk-blend-festive-kurta',
    description: 'Traditional handcrafted Mysuru silk blend festive kurta with rich royal zari borders.',
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
    images: [{ id: 'img-1', product_id: 'demo-prod-1', image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop', sort_order: 0 }],
    variants: [
      { id: 'v-1', product_id: 'demo-prod-1', color: 'Royal Blue', size: 'M', sku: 'MSK-RB-M', stock: 15 },
      { id: 'v-2', product_id: 'demo-prod-1', color: 'Royal Blue', size: 'L', sku: 'MSK-RB-L', stock: 8 },
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
    images: [{ id: 'img-2', product_id: 'demo-prod-2', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop', sort_order: 0 }],
    variants: [
      { id: 'v-3', product_id: 'demo-prod-2', color: 'Yellow', size: 'Free Size', sku: 'CPS-YEL-FS', stock: 30 },
    ],
  },
  {
    id: 'demo-prod-3',
    name: 'Urban Heritage Leather Sneakers',
    slug: 'urban-heritage-leather-sneakers',
    description: 'Premium genuine leather casual sneakers handcrafted for extreme comfort and style.',
    category_id: 'cat-shoes',
    gender: 'unisex',
    price: 1899,
    mrp: 3499,
    discount_pct: 45,
    rating: 4.7,
    review_count: 19,
    brand: 'URANGADI Footwear',
    is_new: true,
    is_bestseller: true,
    is_flash_sale: false,
    flash_sale_stock: 0,
    created_at: new Date().toISOString(),
    images: [{ id: 'img-3', product_id: 'demo-prod-3', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop', sort_order: 0 }],
    variants: [
      { id: 'v-4', product_id: 'demo-prod-3', color: 'White/Red', size: 'UK 8', sku: 'UHL-WR-8', stock: 12 },
      { id: 'v-5', product_id: 'demo-prod-3', color: 'White/Red', size: 'UK 9', sku: 'UHL-WR-9', stock: 10 },
    ],
  },
  {
    id: 'demo-prod-4',
    name: 'Mysuru Zari Silk Dupatta',
    slug: 'mysuru-zari-silk-dupatta',
    description: 'Elegant festive silk dupatta woven with intricate golden zari work.',
    category_id: 'cat-accessories',
    gender: 'women',
    price: 799,
    mrp: 1599,
    discount_pct: 50,
    rating: 4.6,
    review_count: 15,
    brand: 'URANGADI',
    is_new: false,
    is_bestseller: false,
    is_flash_sale: true,
    flash_sale_stock: 15,
    created_at: new Date().toISOString(),
    images: [{ id: 'img-4', product_id: 'demo-prod-4', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop', sort_order: 0 }],
    variants: [
      { id: 'v-6', product_id: 'demo-prod-4', color: 'Maroon Zari', size: 'Free Size', sku: 'MZD-MRN-FS', stock: 25 },
    ],
  },
  {
    id: 'demo-prod-5',
    name: 'Comfort Plush Ethnic Slippers',
    slug: 'comfort-plush-ethnic-slippers',
    description: 'Soft cushioned indoor and outdoor ethnic slippers with durable sole.',
    category_id: 'cat-slippers',
    gender: 'unisex',
    price: 499,
    mrp: 999,
    discount_pct: 50,
    rating: 4.8,
    review_count: 34,
    brand: 'URANGADI Footwear',
    is_new: true,
    is_bestseller: false,
    is_flash_sale: false,
    flash_sale_stock: 0,
    created_at: new Date().toISOString(),
    images: [{ id: 'img-5', product_id: 'demo-prod-5', image_url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&auto=format&fit=crop', sort_order: 0 }],
    variants: [
      { id: 'v-7', product_id: 'demo-prod-5', color: 'Tan Brown', size: 'UK 7', sku: 'CPE-TAN-7', stock: 20 },
      { id: 'v-8', product_id: 'demo-prod-5', color: 'Tan Brown', size: 'UK 8', sku: 'CPE-TAN-8', stock: 18 },
    ],
  },
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    user_id: 'usr-1',
    order_number: 'URG-2026-9481',
    status: 'delivered',
    subtotal: 1499,
    discount: 100,
    delivery_fee: 0,
    total: 1399,
    payment_method: 'UPI',
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

export function getLocalProducts(): Product[] {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  saveLocalProducts(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}

export function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('urangadi_products_updated'));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

export function getLocalOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  saveLocalOrders(DEFAULT_ORDERS);
  return DEFAULT_ORDERS;
}

export function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('urangadi_orders_updated'));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    if (data && data.length > 0) return data as Category[];
  } catch {
    // fallback
  }

  return [
    { id: 'cat-men', name: 'Men', slug: 'men', gender: 'men', sort_order: 1, image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop' },
    { id: 'cat-women', name: 'Women', slug: 'women', gender: 'women', sort_order: 2, image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop' },
    { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', gender: 'unisex', sort_order: 3, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop' },
    { id: 'cat-shoes', name: 'Shoes', slug: 'shoes', gender: 'unisex', sort_order: 4, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop' },
    { id: 'cat-slippers', name: 'Slippers', slug: 'slippers', gender: 'unisex', sort_order: 5, image_url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&auto=format&fit=crop' },
    { id: 'cat-new', name: 'New Arrivals', slug: 'new-arrivals', gender: 'unisex', sort_order: 6, image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop' },
  ];
}

export async function getProducts(filters?: {
  category?: string;
  gender?: string;
  is_new?: boolean;
  is_bestseller?: boolean;
  is_flash_sale?: boolean;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  let list: Product[] = [];

  // 1. Fetch from Supabase if active
  try {
    let query = supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*), category:categories(*)');
    if (filters?.category) query = query.eq('category_id', filters.category);
    if (filters?.gender && filters.gender !== 'all') query = query.in('gender', [filters.gender, 'unisex']);
    if (filters?.is_new) query = query.eq('is_new', true);
    if (filters?.is_bestseller) query = query.eq('is_bestseller', true);
    if (filters?.is_flash_sale) query = query.eq('is_flash_sale', true);
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    const { data } = await query.order('created_at', { ascending: false });
    if (data && data.length > 0) list = data as Product[];
  } catch {
    // continue
  }

  // 2. Fetch from local products store (updated via Admin Dashboard)
  const localList = getLocalProducts();
  const map = new Map<string, Product>();
  // Supabase items first, then local items override / supplement
  list.forEach((p) => map.set(p.id, p));
  localList.forEach((p) => map.set(p.id, p));
  list = Array.from(map.values());

  // Memory Filter
  if (filters?.category) {
    list = list.filter(
      (p) =>
        p.category_id === filters.category ||
        p.category?.slug === filters.category ||
        (filters.category === 'men' && (p.gender === 'men' || p.category_id === 'cat-men')) ||
        (filters.category === 'women' && (p.gender === 'women' || p.category_id === 'cat-women')) ||
        (filters.category === 'shoes' && p.category_id === 'cat-shoes') ||
        (filters.category === 'accessories' && p.category_id === 'cat-accessories') ||
        (filters.category === 'slippers' && p.category_id === 'cat-slippers'),
    );
  }
  if (filters?.gender && filters.gender !== 'all') {
    list = list.filter((p) => p.gender === filters.gender || p.gender === 'unisex');
  }
  if (filters?.is_new) {
    list = list.filter((p) => p.is_new);
  }
  if (filters?.is_bestseller) {
    list = list.filter((p) => p.is_bestseller);
  }
  if (filters?.is_flash_sale) {
    list = list.filter((p) => p.is_flash_sale);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q),
    );
  }
  if (filters?.limit) {
    list = list.slice(0, filters.limit);
  }

  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const localList = getLocalProducts();
  const localMatch = localList.find((p) => p.slug === slug || p.id === slug);

  try {
    const { data } = await supabase
      .from('products')
      .select(
        '*, images:product_images(*), variants:product_variants(*), details:product_details(*), category:categories(*)',
      )
      .eq('slug', slug)
      .maybeSingle();
    if (data) return { ...data, ...(localMatch || {}) } as Product;
  } catch {
    // continue
  }

  if (localMatch) return localMatch;

  return null;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (!error && data) return data as Review[];
  } catch {
    // continue
  }
  return [];
}

export async function checkPincodeDelivery(
  pincode: string,
): Promise<{ available: boolean; zone?: DeliveryZone }> {
  try {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('pincode', pincode)
      .eq('is_active', true)
      .maybeSingle();
    if (!error && data) return { available: true, zone: data as DeliveryZone };
  } catch {
    // continue
  }
  // Default delivery available for Mysuru pincodes
  if (pincode.startsWith('570')) {
    return {
      available: true,
      zone: {
        id: 'dz-mys',
        city: 'Mysuru',
        pincode,
        area: 'Mysuru Urban Zone',
        delivery_charge: 0,
        min_order: 0,
        is_active: true,
      },
    };
  }
  return { available: false };
}

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true);
    if (!error && data && data.length > 0) return data as Coupon[];
  } catch {
    // continue
  }
  return [
    {
      id: 'c-1',
      code: 'WELCOME100',
      type: 'flat',
      value: 100,
      min_order: 499,
      max_discount: 100,
      usage_limit: 1000,
      used_count: 12,
      is_active: true,
      expiry_date: '2026-12-31',
    },
    {
      id: 'c-2',
      code: 'MYSURU20',
      type: 'percent',
      value: 20,
      min_order: 999,
      max_discount: 500,
      usage_limit: 500,
      used_count: 45,
      is_active: true,
      expiry_date: '2026-12-31',
    },
  ];
}

export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  const coupons = await getCoupons();
  const matched = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.is_active);
  if (!matched) return { valid: false, error: 'Invalid coupon code' };
  if (matched.min_order > 0 && subtotal < matched.min_order) {
    return { valid: false, error: `Minimum order of ₹${matched.min_order} required for this coupon` };
  }
  return { valid: true, coupon: matched };
}

export async function placeOrder(params: {
  user_id: string;
  order_number: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  coupon_code: string | null;
  address: Record<string, unknown>;
  items: Omit<OrderItem, 'id' | 'order_id'>[];
}): Promise<{ order: Order | null; error: string | null }> {
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    user_id: params.user_id,
    order_number: params.order_number,
    subtotal: params.subtotal,
    discount: params.discount,
    delivery_fee: params.delivery_fee,
    total: params.total,
    payment_method: params.payment_method,
    coupon_code: params.coupon_code,
    address: params.address as any,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: params.items.map((item, idx) => ({
      ...item,
      id: `oi-${Date.now()}-${idx}`,
      order_id: `ord-${Date.now()}`,
    })),
  };

  try {
    await supabase.from('orders').insert({
      id: newOrder.id,
      user_id: params.user_id,
      order_number: params.order_number,
      subtotal: params.subtotal,
      discount: params.discount,
      delivery_fee: params.delivery_fee,
      total: params.total,
      payment_method: params.payment_method,
      coupon_code: params.coupon_code,
      address: params.address,
      status: 'confirmed',
    });
  } catch {
    // continue
  }

  const orders = getLocalOrders();
  orders.unshift(newOrder);
  saveLocalOrders(orders);

  return { order: newOrder, error: null };
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const orders = getLocalOrders();
  return orders.filter((o) => o.user_id === userId || userId === 'usr-1' || userId === 'usr-demo');
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const orders = getLocalOrders();
  const matched = orders.find((o) => o.order_number === orderNumber || o.id === orderNumber);
  if (matched) return matched;
  return null;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
  } catch {
    // continue
  }

  const orders = getLocalOrders();
  const order = orders.find((o) => o.id === orderId || o.order_number === orderId);
  if (order) {
    order.status = status as any;
    order.updated_at = new Date().toISOString();
    saveLocalOrders(orders);
  }
}

export async function cancelOrder(orderId: string): Promise<void> {
  await updateOrderStatus(orderId, 'cancelled');
}

export async function submitNotifyRequest(params: {
  name: string;
  mobile: string;
  city: string;
  pincode: string;
}): Promise<{ error: string | null }> {
  try {
    await supabase.from('notify_requests').insert(params);
  } catch {
    // ignore
  }
  return { error: null };
}

// ============ ADMIN FUNCTIONS ============

export async function adminGetProducts(): Promise<Product[]> {
  return getProducts();
}

export async function adminCreateProduct(params: {
  name: string;
  slug?: string;
  description: string;
  category_id: string;
  gender: string;
  price: number;
  mrp: number;
  is_new?: boolean;
  is_bestseller?: boolean;
  is_flash_sale?: boolean;
  flash_sale_stock?: number;
  images: string[];
  variants: { color: string; size: string; stock: number }[];
  details?: any;
}): Promise<{ error: string | null; product?: Product }> {
  const current = getLocalProducts();
  const slug = params.slug || params.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const id = `prod-${Date.now()}`;

  const newProduct: Product = {
    id,
    name: params.name,
    slug,
    description: params.description || '',
    category_id: params.category_id || 'cat-men',
    gender: params.gender || 'unisex',
    price: Number(params.price) || 999,
    mrp: Number(params.mrp) || 1999,
    discount_pct: Math.round((1 - (Number(params.price) / Number(params.mrp))) * 100) || 50,
    rating: 4.8,
    review_count: 0,
    brand: 'URANGADI',
    is_new: params.is_new ?? true,
    is_bestseller: params.is_bestseller ?? false,
    is_flash_sale: params.is_flash_sale ?? false,
    flash_sale_stock: Number(params.flash_sale_stock) || 0,
    created_at: new Date().toISOString(),
    images: (params.images && params.images.length > 0
      ? params.images
      : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop']
    ).map((url, i) => ({
      id: `img-${Date.now()}-${i}`,
      product_id: id,
      image_url: url,
      sort_order: i,
    })),
    variants: (params.variants && params.variants.length > 0
      ? params.variants
      : [{ color: 'Default', size: 'M', stock: 15 }]
    ).map((v, i) => ({
      id: `var-${Date.now()}-${i}`,
      product_id: id,
      color: v.color || 'Default',
      size: v.size || 'M',
      sku: `${slug}_${v.color || 'DEFAULT'}_${v.size || 'M'}`.toUpperCase().replace(/\s+/g, '_'),
      stock: Number(v.stock) || 0,
    })),
  };

  try {
    await supabase.from('products').insert({
      id: newProduct.id,
      name: newProduct.name,
      slug: newProduct.slug,
      description: newProduct.description,
      category_id: newProduct.category_id,
      gender: newProduct.gender,
      price: newProduct.price,
      mrp: newProduct.mrp,
      is_new: newProduct.is_new,
      is_bestseller: newProduct.is_bestseller,
      is_flash_sale: newProduct.is_flash_sale,
      flash_sale_stock: newProduct.flash_sale_stock,
    });
  } catch {
    // continue
  }

  current.unshift(newProduct);
  saveLocalProducts(current);
  return { error: null, product: newProduct };
}

export async function adminUpdateProduct(
  productId: string,
  params: Record<string, any>,
): Promise<{ error: string | null }> {
  const current = getLocalProducts();
  const index = current.findIndex((p) => p.id === productId || p.slug === productId);

  try {
    await supabase
      .from('products')
      .update({
        name: params.name,
        slug: params.slug,
        description: params.description,
        category_id: params.category_id,
        gender: params.gender,
        price: params.price,
        mrp: params.mrp,
        is_new: params.is_new,
        is_bestseller: params.is_bestseller,
        is_flash_sale: params.is_flash_sale,
        flash_sale_stock: params.flash_sale_stock,
      })
      .eq('id', productId);
  } catch {
    // continue
  }

  if (index !== -1) {
    const existing = current[index];
    const updatedImages = params.images && Array.isArray(params.images)
      ? params.images.map((url: string, i: number) => ({
          id: `img-${Date.now()}-${i}`,
          product_id: productId,
          image_url: url,
          sort_order: i,
        }))
      : existing.images;

    const updatedVariants = params.variants && Array.isArray(params.variants)
      ? params.variants.map((v: any, i: number) => ({
          id: `var-${Date.now()}-${i}`,
          product_id: productId,
          color: v.color,
          size: v.size,
          sku: `${(params.slug || existing.slug)}_${v.color}_${v.size}`.toUpperCase().replace(/\s+/g, '_'),
          stock: Number(v.stock) || 0,
        }))
      : existing.variants;

    current[index] = {
      ...existing,
      ...params,
      price: params.price !== undefined ? Number(params.price) : existing.price,
      mrp: params.mrp !== undefined ? Number(params.mrp) : existing.mrp,
      discount_pct:
        params.price && params.mrp
          ? Math.round((1 - Number(params.price) / Number(params.mrp)) * 100)
          : existing.discount_pct,
      images: updatedImages,
      variants: updatedVariants,
    };
  } else {
    const newProduct: Product = {
      id: productId,
      name: params.name || 'New Product',
      slug: params.slug || `product-${Date.now()}`,
      description: params.description || '',
      category_id: params.category_id || 'cat-men',
      gender: params.gender || 'unisex',
      price: Number(params.price) || 999,
      mrp: Number(params.mrp) || 1999,
      discount_pct: 50,
      rating: 4.8,
      review_count: 0,
      brand: 'URANGADI',
      is_new: params.is_new ?? true,
      is_bestseller: params.is_bestseller ?? false,
      is_flash_sale: params.is_flash_sale ?? false,
      flash_sale_stock: Number(params.flash_sale_stock) || 0,
      created_at: new Date().toISOString(),
      images: params.images?.map((url: string, i: number) => ({
        id: `img-${i}`,
        product_id: productId,
        image_url: url,
        sort_order: i,
      })) || [],
      variants: params.variants?.map((v: any, i: number) => ({
        id: `var-${i}`,
        product_id: productId,
        color: v.color,
        size: v.size,
        sku: `SKU-${i}`,
        stock: v.stock,
      })) || [],
    };
    current.unshift(newProduct);
  }

  saveLocalProducts(current);
  return { error: null };
}

export async function adminDeleteProduct(productId: string): Promise<void> {
  try {
    await supabase.from('products').delete().eq('id', productId);
  } catch {
    // ignore
  }

  const current = getLocalProducts();
  const filtered = current.filter((p) => p.id !== productId && p.slug !== productId);
  saveLocalProducts(filtered);
}

export async function adminUpdateVariantStock(
  variantId: string,
  stock: number,
): Promise<void> {
  try {
    await supabase
      .from('product_variants')
      .update({ stock })
      .eq('id', variantId);
  } catch {
    // ignore
  }

  const current = getLocalProducts();
  current.forEach((p) => {
    p.variants?.forEach((v) => {
      if (v.id === variantId) {
        v.stock = Number(stock) || 0;
      }
    });
  });
  saveLocalProducts(current);
}

export async function adminGetAllOrders(): Promise<Order[]> {
  return getLocalOrders();
}

export async function adminGetAllProfiles() {
  return [
    { id: 'usr-1', email: 'admin@urangadi.com', full_name: 'Store Admin', phone: '9845000000', is_admin: true, created_at: new Date().toISOString() },
    { id: 'usr-2', email: 'suhas@example.com', full_name: 'Suhas Gowda', phone: '9845012345', is_admin: false, created_at: new Date().toISOString() },
    { id: 'usr-3', email: 'priya@example.com', full_name: 'Priya Sharma', phone: '9741098765', is_admin: false, created_at: new Date().toISOString() },
  ];
}

export async function adminCreateCoupon(coupon: Omit<Coupon, 'id' | 'used_count'>) {
  try {
    await supabase.from('coupons').insert(coupon);
  } catch {
    // ignore
  }
}

export async function adminDeleteCoupon(couponId: string) {
  try {
    await supabase.from('coupons').delete().eq('id', couponId);
  } catch {
    // ignore
  }
}

export async function adminCreateDeliveryZone(zone: Omit<DeliveryZone, 'id'>) {
  try {
    await supabase.from('delivery_zones').insert(zone);
  } catch {
    // ignore
  }
}

export async function adminDeleteDeliveryZone(zoneId: string) {
  try {
    await supabase.from('delivery_zones').delete().eq('id', zoneId);
  } catch {
    // ignore
  }
}

export async function adminUpdateSetting(key: string, value: string) {
  try {
    await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
  } catch {
    // ignore
  }
}

export async function adminGetNotifyRequests() {
  return [
    { id: 'nr-1', name: 'Rohan Kumar', mobile: '9845011223', city: 'Mysuru', pincode: '570002', created_at: new Date().toISOString() },
  ];
}

