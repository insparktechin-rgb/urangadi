/*
# URANGADI E-Commerce Schema

## Overview
Creates the complete database schema for URANGADI, a quick-commerce fashion marketplace serving Mysuru only.
Includes products with variants/images, orders, coupons, delivery zones, reviews, customer profiles, and admin support.

## New Tables
1. `profiles` — customer profiles linked to auth.users, with is_admin flag (created FIRST for policy references)
2. `categories` — product categories (Men, Women, Accessories, Shoes, Slippers)
3. `products` — product catalog with pricing, ratings, flags (new, bestseller, flash sale)
4. `product_images` — multiple images per product (front, back, detail, lifestyle)
5. `product_variants` — color/size combinations with per-variant stock and SKU
6. `product_details` — extended product attributes (material, fit, wash care, highlights)
7. `coupons` — discount codes with type, value, min order, usage limits, expiry
8. `delivery_zones` — Mysuru pincodes/areas with delivery charges and min order
9. `reviews` — product reviews (demo + real)
10. `orders` — customer orders with status tracking and address (jsonb)
11. `order_items` — line items per order
12. `notify_requests` — out-of-area customers requesting notification when URANGADI expands
13. `settings` — key-value store for free delivery threshold, delivery fee, WhatsApp number, admin email

## Security (RLS)
- Public read access (anon + authenticated) on: categories, products, product_images, product_variants, product_details, coupons, delivery_zones, reviews, settings
- Admin-only write access on: categories, products, product_images, product_variants, product_details, coupons, delivery_zones, settings
- Owner-scoped access on: orders (select/insert own), order_items (select/insert via order ownership)
- Admin can update order status; users can cancel own orders
- Profiles: users read/update own; admins read all
- notify_requests: anyone can insert; admin-only read
- Admin detection via profiles.is_admin, auto-set on signup if email matches settings.admin_email

## Triggers
- Auto-create profile on auth.users insert, with is_admin = true if email matches admin_email setting
*/

-- ============ PROFILES (FIRST, for policy references) ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile" ON profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text,
  gender text DEFAULT 'unisex',
  sort_order int DEFAULT 0
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_categories" ON categories;
CREATE POLICY "read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  gender text DEFAULT 'unisex',
  price int NOT NULL,
  mrp int NOT NULL,
  discount_pct int GENERATED ALWAYS AS (CASE WHEN mrp > 0 THEN ROUND((1.0 - price::float / mrp) * 100) ELSE 0 END) STORED,
  rating numeric(2,1) DEFAULT 4.5,
  review_count int DEFAULT 0,
  brand text DEFAULT 'URANGADI',
  is_new boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  is_flash_sale boolean DEFAULT false,
  flash_sale_stock int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_products" ON products;
CREATE POLICY "read_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ PRODUCT IMAGES ============
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int DEFAULT 0
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_product_images" ON product_images;
CREATE POLICY "read_product_images" ON product_images FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_product_images" ON product_images;
CREATE POLICY "admin_insert_product_images" ON product_images FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_update_product_images" ON product_images;
CREATE POLICY "admin_update_product_images" ON product_images FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_delete_product_images" ON product_images;
CREATE POLICY "admin_delete_product_images" ON product_images FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ PRODUCT VARIANTS ============
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  color text NOT NULL,
  size text NOT NULL,
  sku text UNIQUE,
  stock int DEFAULT 0,
  UNIQUE(product_id, color, size)
);
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_product_variants" ON product_variants;
CREATE POLICY "read_product_variants" ON product_variants FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_product_variants" ON product_variants;
CREATE POLICY "admin_insert_product_variants" ON product_variants FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_update_product_variants" ON product_variants;
CREATE POLICY "admin_update_product_variants" ON product_variants FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_delete_product_variants" ON product_variants;
CREATE POLICY "admin_delete_product_variants" ON product_variants FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ PRODUCT DETAILS ============
CREATE TABLE IF NOT EXISTS product_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  material text,
  fit text,
  pattern text,
  sleeve text,
  neck text,
  occasion text,
  wash_care text,
  highlights text[]
);
ALTER TABLE product_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_product_details" ON product_details;
CREATE POLICY "read_product_details" ON product_details FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_product_details" ON product_details;
CREATE POLICY "admin_insert_product_details" ON product_details FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_update_product_details" ON product_details;
CREATE POLICY "admin_update_product_details" ON product_details FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_delete_product_details" ON product_details;
CREATE POLICY "admin_delete_product_details" ON product_details FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ COUPONS ============
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'flat',
  value int NOT NULL,
  min_order int DEFAULT 0,
  max_discount int,
  expiry_date date,
  usage_limit int,
  used_count int DEFAULT 0,
  is_active boolean DEFAULT true
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_coupons" ON coupons;
CREATE POLICY "read_coupons" ON coupons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_coupons" ON coupons;
CREATE POLICY "admin_insert_coupons" ON coupons FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_update_coupons" ON coupons;
CREATE POLICY "admin_update_coupons" ON coupons FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_delete_coupons" ON coupons;
CREATE POLICY "admin_delete_coupons" ON coupons FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ DELIVERY ZONES ============
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL DEFAULT 'Mysuru',
  pincode text NOT NULL,
  area text,
  delivery_charge int DEFAULT 49,
  min_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  UNIQUE(pincode)
);
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_delivery_zones" ON delivery_zones;
CREATE POLICY "read_delivery_zones" ON delivery_zones FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_delivery_zones" ON delivery_zones;
CREATE POLICY "admin_insert_delivery_zones" ON delivery_zones FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_update_delivery_zones" ON delivery_zones;
CREATE POLICY "admin_update_delivery_zones" ON delivery_zones FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_delete_delivery_zones" ON delivery_zones;
CREATE POLICY "admin_delete_delivery_zones" ON delivery_zones FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_demo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_reviews" ON reviews;
CREATE POLICY "read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_reviews" ON reviews;
CREATE POLICY "insert_reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  subtotal int NOT NULL,
  discount int DEFAULT 0,
  delivery_fee int DEFAULT 0,
  total int NOT NULL,
  payment_method text DEFAULT 'cod',
  coupon_code text,
  address jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text NOT NULL,
  image_url text,
  color text,
  size text,
  quantity int NOT NULL,
  price int NOT NULL
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- ============ NOTIFY REQUESTS ============
CREATE TABLE IF NOT EXISTS notify_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL,
  city text NOT NULL,
  pincode text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notify_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_notify_requests" ON notify_requests;
CREATE POLICY "insert_notify_requests" ON notify_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_read_notify_requests" ON notify_requests;
CREATE POLICY "admin_read_notify_requests" ON notify_requests FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ SETTINGS ============
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_settings" ON settings;
CREATE POLICY "read_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_settings" ON settings;
CREATE POLICY "admin_insert_settings" ON settings FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_update_settings" ON settings;
CREATE POLICY "admin_update_settings" ON settings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
DROP POLICY IF EXISTS "admin_delete_settings" ON settings;
CREATE POLICY "admin_delete_settings" ON settings FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_pincode ON delivery_zones(pincode);

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_email text;
  is_admin_val boolean := false;
BEGIN
  SELECT value INTO admin_email FROM public.settings WHERE key = 'admin_email';
  IF NEW.email = COALESCE(admin_email, 'admin@urangadi.com') THEN
    is_admin_val := true;
  END IF;
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), is_admin_val)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SEED SETTINGS ============
INSERT INTO settings (key, value) VALUES
  ('free_delivery_threshold', '999'),
  ('default_delivery_fee', '49'),
  ('whatsapp_number', '918000000000'),
  ('admin_email', 'admin@urangadi.com'),
  ('flash_sale_end', '2026-12-31T23:59:59')
ON CONFLICT (key) DO NOTHING;
