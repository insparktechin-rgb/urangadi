export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  gender: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  gender: string;
  price: number;
  mrp: number;
  discount_pct: number;
  rating: number;
  review_count: number;
  brand: string;
  is_new: boolean;
  is_bestseller: boolean;
  is_flash_sale: boolean;
  flash_sale_stock: number;
  created_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  details?: ProductDetail | null;
  category?: Category | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  size: string;
  sku: string | null;
  stock: number;
}

export interface ProductDetail {
  id: string;
  product_id: string;
  material: string | null;
  fit: string | null;
  pattern: string | null;
  sleeve: string | null;
  neck: string | null;
  occasion: string | null;
  wash_care: string | null;
  highlights: string[] | null;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'flat' | 'percent' | 'free_delivery';
  value: number;
  min_order: number;
  max_discount: number | null;
  expiry_date: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
}

export interface DeliveryZone {
  id: string;
  city: string;
  pincode: string;
  area: string | null;
  delivery_charge: number;
  min_order: number;
  is_active: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_demo: boolean;
  created_at: string;
}

export interface OrderAddress {
  full_name: string;
  mobile: string;
  house: string;
  street: string;
  area: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  coupon_code: string | null;
  address: OrderAddress;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  image_url: string | null;
  color: string | null;
  size: string | null;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
}

export interface CartItem {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  color: string;
  size: string;
  quantity: number;
  stock: number;
}

export interface WishlistItem {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  mrp: number;
}

export interface Settings {
  free_delivery_threshold: number;
  default_delivery_fee: number;
  whatsapp_number: string;
  admin_email: string;
  flash_sale_end: string;
}
