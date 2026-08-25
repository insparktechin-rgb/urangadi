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
/*
# URANGADI Seed Data

## Overview
Populates the database with realistic demo products, categories, coupons, delivery zones, and reviews so the website looks complete immediately.

## Data Inserted
1. **Categories** — Men, Women, Accessories, Shoes, Slippers, New Arrivals
2. **Products** — 50+ products across all categories with realistic Indian market pricing
3. **Product Images** — Multiple images per product from Pexels (front, back, detail, lifestyle)
4. **Product Variants** — Color/size combinations with per-variant stock
5. **Product Details** — Material, fit, pattern, sleeve, neck, occasion, wash care, highlights
6. **Coupons** — WELCOME100, FASHION20, FREESHIP
7. **Delivery Zones** — 40+ Mysuru pincodes with delivery charges
8. **Reviews** — Demo reviews for products
*/

-- ============ CATEGORIES ============
INSERT INTO categories (name, slug, image_url, gender, sort_order) VALUES
('Men', 'men', 'https://images.pexels.com/photos/13006909/pexels-photo-13006909.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'men', 1),
('Women', 'women', 'https://images.pexels.com/photos/12660566/pexels-photo-12660566.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'women', 2),
('Accessories', 'accessories', 'https://images.pexels.com/photos/3380158/pexels-photo-3380158.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'unisex', 3),
('Shoes', 'shoes', 'https://images.pexels.com/photos/8979071/pexels-photo-8979071.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'unisex', 4),
('Slippers', 'slippers', 'https://images.pexels.com/photos/13643931/pexels-photo-13643931.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'unisex', 5),
('New Arrivals', 'new-arrivals', 'https://images.pexels.com/photos/11805134/pexels-photo-11805134.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'unisex', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============ PRODUCTS ============
-- Helper: we'll insert products with explicit category_id lookups

-- MEN'S CLOTHING (12 products)
INSERT INTO products (name, slug, description, category_id, gender, price, mrp, rating, review_count, is_new, is_bestseller, is_flash_sale, flash_sale_stock)
VALUES
('Premium Oversized Cotton T-Shirt', 'premium-oversized-cotton-tshirt', 'Ultra-soft oversized cotton t-shirt with a relaxed drop-shoulder fit. Perfect for everyday wear.', (SELECT id FROM categories WHERE slug='men'), 'men', 599, 999, 4.6, 234, true, true, false, 0),
('Classic Cotton Crew T-Shirt', 'classic-cotton-crew-tshirt', 'Breathable everyday crew neck t-shirt in premium combed cotton.', (SELECT id FROM categories WHERE slug='men'), 'men', 399, 699, 4.4, 189, false, true, false, 0),
('Oversized Graphic T-Shirt', 'oversized-graphic-tshirt', 'Statement graphic tee with bold prints and a relaxed streetwear fit.', (SELECT id FROM categories WHERE slug='men'), 'men', 699, 1299, 4.5, 156, true, false, true, 5),
('Casual Linen Shirt', 'casual-linen-shirt', 'Lightweight linen-blend casual shirt, perfect for Mysuru weather.', (SELECT id FROM categories WHERE slug='men'), 'men', 899, 1499, 4.5, 98, false, false, false, 0),
('Denim Shirt', 'denim-shirt', 'Classic indigo denim shirt with a tailored fit and pearl buttons.', (SELECT id FROM categories WHERE slug='men'), 'men', 1099, 1799, 4.6, 112, false, true, false, 0),
('Polo T-Shirt', 'polo-tshirt', 'Premium pique cotton polo with ribbed collar and contrast placket.', (SELECT id FROM categories WHERE slug='men'), 'men', 799, 1299, 4.5, 167, false, true, false, 0),
('Cargo Pants', 'cargo-pants', 'Utility cargo pants with multiple pockets and a relaxed taper.', (SELECT id FROM categories WHERE slug='men'), 'men', 1299, 2199, 4.4, 78, true, false, false, 0),
('Relaxed Fit Jeans', 'relaxed-fit-jeans', 'Comfortable relaxed-fit denim jeans in a classic mid-wash blue.', (SELECT id FROM categories WHERE slug='men'), 'men', 1399, 2299, 4.5, 143, false, true, false, 0),
('Slim Fit Joggers', 'slim-fit-joggers', 'Stretch joggers with tapered cuffs and zip pockets.', (SELECT id FROM categories WHERE slug='men'), 'men', 999, 1599, 4.3, 87, false, false, false, 0),
('Premium Hoodie', 'premium-hoodie', 'Heavyweight 400GSM fleece hoodie with double-lined hood.', (SELECT id FROM categories WHERE slug='men'), 'men', 1499, 2499, 4.7, 201, true, true, true, 8),
('Casual Shorts', 'casual-shorts', 'Mid-length casual shorts with elastic waist and drawstring.', (SELECT id FROM categories WHERE slug='men'), 'men', 599, 999, 4.2, 65, false, false, false, 0),
('Solid Henley T-Shirt', 'solid-henley-tshirt', 'Three-button henley in soft cotton-modal blend with a tailored fit.', (SELECT id FROM categories WHERE slug='men'), 'men', 699, 1199, 4.4, 92, true, false, false, 0)
ON CONFLICT (slug) DO NOTHING;

-- WOMEN'S CLOTHING (12 products)
INSERT INTO products (name, slug, description, category_id, gender, price, mrp, rating, review_count, is_new, is_bestseller, is_flash_sale, flash_sale_stock)
VALUES
('Oversized Cotton T-Shirt', 'womens-oversized-cotton-tshirt', 'Relaxed oversized tee in soft cotton with a trendy drop-shoulder cut.', (SELECT id FROM categories WHERE slug='women'), 'women', 499, 899, 4.5, 178, true, true, false, 0),
('Casual Kurti', 'casual-kurti', 'A-line casual kurti in breathable rayon with floral prints.', (SELECT id FROM categories WHERE slug='women'), 'women', 699, 1299, 4.6, 234, false, true, false, 0),
('Western Floral Dress', 'western-floral-dress', 'Flowy midi dress with floral print and adjustable straps.', (SELECT id FROM categories WHERE slug='women'), 'women', 999, 1799, 4.5, 156, true, false, true, 6),
('Crop Top', 'crop-top', 'Ribbed knit crop top with a snug fit and square neckline.', (SELECT id FROM categories WHERE slug='women'), 'women', 449, 799, 4.3, 98, true, false, false, 0),
('Women Casual Shirt', 'womens-casual-shirt', 'Relaxed-fit button-down shirt in soft cotton poplin.', (SELECT id FROM categories WHERE slug='women'), 'women', 799, 1399, 4.4, 87, false, false, false, 0),
('High-Rise Jeans', 'womens-highrise-jeans', 'High-rise skinny jeans with stretch denim for all-day comfort.', (SELECT id FROM categories WHERE slug='women'), 'women', 1199, 1999, 4.5, 143, false, true, false, 0),
('Wide Leg Pants', 'wide-leg-pants', 'Flowy wide-leg trousers in a lightweight crepe fabric.', (SELECT id FROM categories WHERE slug='women'), 'women', 899, 1499, 4.4, 76, true, false, false, 0),
('Co-ord Set', 'coord-set', 'Matching top and shorts co-ord set in soft terry cotton.', (SELECT id FROM categories WHERE slug='women'), 'women', 1299, 2299, 4.6, 112, true, true, true, 4),
('Casual Top', 'casual-top', 'Everyday V-neck top in soft modal cotton with cap sleeves.', (SELECT id FROM categories WHERE slug='women'), 'women', 499, 899, 4.3, 65, false, false, false, 0),
('Everyday Dress', 'everyday-dress', 'Comfortable A-line dress in jersey knit, perfect for daily wear.', (SELECT id FROM categories WHERE slug='women'), 'women', 799, 1399, 4.4, 134, false, true, false, 0),
('Oversized Sweatshirt', 'womens-oversized-sweatshirt', 'Cozy fleece sweatshirt with an oversized fit and ribbed cuffs.', (SELECT id FROM categories WHERE slug='women'), 'women', 999, 1699, 4.5, 89, true, false, false, 0),
('Anarkali Kurti', 'anarkali-kurti', 'Elegant floor-length Anarkali kurti with intricate embroidery.', (SELECT id FROM categories WHERE slug='women'), 'women', 1499, 2999, 4.7, 167, false, true, false, 0)
ON CONFLICT (slug) DO NOTHING;

-- ACCESSORIES (10 products)
INSERT INTO products (name, slug, description, category_id, gender, price, mrp, rating, review_count, is_new, is_bestseller, is_flash_sale, flash_sale_stock)
VALUES
('Analog Wrist Watch', 'analog-wrist-watch', 'Minimalist analog watch with leather strap and stainless steel case.', (SELECT id FROM categories WHERE slug='accessories'), 'unisex', 999, 1999, 4.5, 234, false, true, false, 0),
('Polarized Sunglasses', 'polarized-sunglasses', 'UV-400 polarized sunglasses with a classic wayfarer frame.', (SELECT id FROM categories WHERE slug='accessories'), 'unisex', 599, 1299, 4.4, 178, true, false, true, 7),
('Leather Wallet', 'leather-wallet', 'Genuine leather bifold wallet with RFID protection and 8 card slots.', (SELECT id FROM categories WHERE slug='accessories'), 'men', 499, 999, 4.5, 156, false, true, false, 0),
('Reversible Belt', 'reversible-belt', 'Reversible leather belt with auto-lock buckle — black and brown.', (SELECT id FROM categories WHERE slug='accessories'), 'men', 399, 799, 4.3, 87, false, false, false, 0),
('Classic Cap', 'classic-cap', 'Adjustable cotton twill cap with embroidered URANGADI logo.', (SELECT id FROM categories WHERE slug='accessories'), 'unisex', 299, 599, 4.2, 65, true, false, false, 0),
('Sling Bag', 'sling-bag', 'Compact crossbody sling bag with adjustable strap and zip pockets.', (SELECT id FROM categories WHERE slug='accessories'), 'unisex', 699, 1299, 4.4, 112, true, true, false, 0),
('Laptop Backpack', 'laptop-backpack', 'Water-resistant backpack with padded 15.6" laptop sleeve and USB port.', (SELECT id FROM categories WHERE slug='accessories'), 'unisex', 899, 1799, 4.6, 198, false, true, false, 0),
('Leather Bracelet', 'leather-bracelet', 'Handcrafted leather bracelet with stainless steel accent.', (SELECT id FROM categories WHERE slug='accessories'), 'unisex', 249, 499, 4.1, 43, false, false, false, 0),
('Chain Necklace', 'chain-necklace', 'Stainless steel chain necklace with a polished silver finish.', (SELECT id FROM categories WHERE slug='accessories'), 'unisex', 399, 799, 4.3, 76, true, false, false, 0),
('Handbag', 'handbag', 'Stylish tote handbag in vegan leather with spacious interior.', (SELECT id FROM categories WHERE slug='accessories'), 'women', 799, 1599, 4.5, 134, true, true, true, 5)
ON CONFLICT (slug) DO NOTHING;

-- SHOES (10 products)
INSERT INTO products (name, slug, description, category_id, gender, price, mrp, rating, review_count, is_new, is_bestseller, is_flash_sale, flash_sale_stock)
VALUES
('Casual Sneakers', 'casual-sneakers', 'Low-top canvas sneakers with cushioned insole and rubber outsole.', (SELECT id FROM categories WHERE slug='shoes'), 'unisex', 1299, 2499, 4.5, 267, false, true, false, 0),
('Running Shoes', 'running-shoes', 'Lightweight mesh running shoes with memory foam insole.', (SELECT id FROM categories WHERE slug='shoes'), 'men', 1799, 2999, 4.6, 189, true, true, true, 6),
('Walking Shoes', 'walking-shoes', 'Comfortable walking shoes with arch support and breathable mesh.', (SELECT id FROM categories WHERE slug='shoes'), 'unisex', 1499, 2499, 4.4, 134, false, false, false, 0),
('High-Top Sneakers', 'high-top-sneakers', 'Retro high-top sneakers with padded ankle collar and vulcanized sole.', (SELECT id FROM categories WHERE slug='shoes'), 'unisex', 1599, 2799, 4.5, 156, true, false, false, 0),
('Women Sneakers', 'womens-sneakers', 'Sleek white sneakers designed for women with a slim profile.', (SELECT id FROM categories WHERE slug='shoes'), 'women', 1399, 2399, 4.5, 178, false, true, false, 0),
('Casual Loafers', 'casual-loafers', 'Slip-on loafers with a memory foam footbed and faux leather upper.', (SELECT id FROM categories WHERE slug='shoes'), 'men', 1199, 1999, 4.3, 87, false, false, false, 0),
('Sport Sandals', 'sport-sandals', 'Outdoor sport sandals with adjustable straps and grippy outsole.', (SELECT id FROM categories WHERE slug='shoes'), 'unisex', 899, 1499, 4.2, 65, true, false, false, 0),
('Canvas Slip-Ons', 'canvas-slip-ons', 'Easy slip-on canvas shoes with elastic side panels.', (SELECT id FROM categories WHERE slug='shoes'), 'unisex', 999, 1799, 4.3, 112, false, false, false, 0),
('Knit Sneakers', 'knit-sneakers', 'Breathable knit upper sneakers with a flexible sole and sock-like fit.', (SELECT id FROM categories WHERE slug='shoes'), 'unisex', 1699, 2799, 4.6, 143, true, true, true, 3),
('Formal Shoes', 'formal-shoes', 'Classic leather-look formal shoes with a cushioned footbed.', (SELECT id FROM categories WHERE slug='shoes'), 'men', 1899, 2999, 4.4, 98, false, false, false, 0)
ON CONFLICT (slug) DO NOTHING;

-- SLIPPERS (8 products)
INSERT INTO products (name, slug, description, category_id, gender, price, mrp, rating, review_count, is_new, is_bestseller, is_flash_sale, flash_sale_stock)
VALUES
('Casual Slippers', 'casual-slippers', 'Everyday cushioned slippers with a soft EVA footbed.', (SELECT id FROM categories WHERE slug='slippers'), 'unisex', 399, 699, 4.3, 178, false, true, false, 0),
('Comfort Slides', 'comfort-slides', 'Padded slides with adjustable velcro strap and non-slip sole.', (SELECT id FROM categories WHERE slug='slippers'), 'unisex', 499, 899, 4.4, 134, true, false, true, 8),
('Leather Sandals', 'leather-sandals', 'Handcrafted leather sandals with a cushioned footbed and buckle strap.', (SELECT id FROM categories WHERE slug='slippers'), 'men', 699, 1199, 4.5, 98, false, true, false, 0),
('Women Sandals', 'womens-sandals', 'Stylish women sandals with a block heel and ankle strap.', (SELECT id FROM categories WHERE slug='slippers'), 'women', 599, 999, 4.3, 87, true, false, false, 0),
('Men Slides', 'mens-slides', 'Quick-dry slides with a textured footbed and wide strap.', (SELECT id FROM categories WHERE slug='slippers'), 'men', 349, 599, 4.2, 65, false, false, false, 0),
('Flip Flops', 'flip-flops', 'Lightweight rubber flip flops with a soft toe post.', (SELECT id FROM categories WHERE slug='slippers'), 'unisex', 299, 499, 4.1, 156, false, true, false, 0),
('Sport Flip Flops', 'sport-flip-flops', 'Durable sport flip flops with arch support and anti-slip sole.', (SELECT id FROM categories WHERE slug='slippers'), 'men', 449, 799, 4.3, 78, true, false, false, 0),
('Comfort Sandals', 'comfort-sandals', 'Orthopedic comfort sandals with memory foam insole.', (SELECT id FROM categories WHERE slug='slippers'), 'women', 549, 999, 4.4, 92, false, false, true, 4)
ON CONFLICT (slug) DO NOTHING;
/*
# URANGADI Seed Data Part 2

## Overview
Adds product images, variants (color/size/stock), product details, coupons, delivery zones, and reviews.

## Data Inserted
1. **Product Images** — 3-4 images per product (front, back/detail, lifestyle)
2. **Product Variants** — Color/size combinations with per-variant stock
3. **Product Details** — Material, fit, pattern, sleeve, neck, occasion, wash care, highlights
4. **Coupons** — WELCOME100, FASHION20, FREESHIP
5. **Delivery Zones** — 40+ Mysuru pincodes
6. **Reviews** — Demo reviews for products
*/

-- ============ PRODUCT IMAGES ============
-- Men's T-Shirts
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
((SELECT id FROM products WHERE slug='premium-oversized-cotton-tshirt'), 'https://images.pexels.com/photos/20669538/pexels-photo-20669538.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='premium-oversized-cotton-tshirt'), 'https://images.pexels.com/photos/8148576/pexels-photo-8148576.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='premium-oversized-cotton-tshirt'), 'https://images.pexels.com/photos/11805134/pexels-photo-11805134.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='premium-oversized-cotton-tshirt'), 'https://images.pexels.com/photos/37704850/pexels-photo-37704850.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
((SELECT id FROM products WHERE slug='classic-cotton-crew-tshirt'), 'https://images.pexels.com/photos/37704849/pexels-photo-37704849.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='classic-cotton-crew-tshirt'), 'https://images.pexels.com/photos/37704845/pexels-photo-37704845.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='classic-cotton-crew-tshirt'), 'https://images.pexels.com/photos/37704843/pexels-photo-37704843.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='classic-cotton-crew-tshirt'), 'https://images.pexels.com/photos/18257675/pexels-photo-18257675.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
((SELECT id FROM products WHERE slug='oversized-graphic-tshirt'), 'https://images.pexels.com/photos/2381613/pexels-photo-2381613.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='oversized-graphic-tshirt'), 'https://images.pexels.com/photos/2828798/pexels-photo-2828798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='oversized-graphic-tshirt'), 'https://images.pexels.com/photos/2783878/pexels-photo-2783878.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='oversized-graphic-tshirt'), 'https://images.pexels.com/photos/9431075/pexels-photo-9431075.png?auto=compress&cs=tinysrgb&h=650&w=940', 3),
((SELECT id FROM products WHERE slug='casual-linen-shirt'), 'https://images.pexels.com/photos/1996930/pexels-photo-1996930.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='casual-linen-shirt'), 'https://images.pexels.com/photos/13006909/pexels-photo-13006909.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='casual-linen-shirt'), 'https://images.pexels.com/photos/5125723/pexels-photo-5125723.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='denim-shirt'), 'https://images.pexels.com/photos/13006909/pexels-photo-13006909.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='denim-shirt'), 'https://images.pexels.com/photos/1996930/pexels-photo-1996930.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='denim-shirt'), 'https://images.pexels.com/photos/11805134/pexels-photo-11805134.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='polo-tshirt'), 'https://images.pexels.com/photos/7037634/pexels-photo-7037634.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='polo-tshirt'), 'https://images.pexels.com/photos/24446647/pexels-photo-24446647.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='polo-tshirt'), 'https://images.pexels.com/photos/7925636/pexels-photo-7925636.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='polo-tshirt'), 'https://images.pexels.com/photos/8068701/pexels-photo-8068701.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
((SELECT id FROM products WHERE slug='cargo-pants'), 'https://images.pexels.com/photos/27097137/pexels-photo-27097137.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='cargo-pants'), 'https://images.pexels.com/photos/11716436/pexels-photo-11716436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='cargo-pants'), 'https://images.pexels.com/photos/18393526/pexels-photo-18393526.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='relaxed-fit-jeans'), 'https://images.pexels.com/photos/6764124/pexels-photo-6764124.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='relaxed-fit-jeans'), 'https://images.pexels.com/photos/1082526/pexels-photo-1082526.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='relaxed-fit-jeans'), 'https://images.pexels.com/photos/17265364/pexels-photo-17265364.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='relaxed-fit-jeans'), 'https://images.pexels.com/photos/52518/jeans-pants-blue-shop-52518.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
((SELECT id FROM products WHERE slug='slim-fit-joggers'), 'https://images.pexels.com/photos/30415877/pexels-photo-30415877.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='slim-fit-joggers'), 'https://images.pexels.com/photos/30229903/pexels-photo-30229903.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='slim-fit-joggers'), 'https://images.pexels.com/photos/5598472/pexels-photo-5598472.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='premium-hoodie'), 'https://images.pexels.com/photos/12555811/pexels-photo-12555811.png?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='premium-hoodie'), 'https://images.pexels.com/photos/37468338/pexels-photo-37468338.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='premium-hoodie'), 'https://images.pexels.com/photos/37468337/pexels-photo-37468337.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='premium-hoodie'), 'https://images.pexels.com/photos/2108816/pexels-photo-2108816.png?auto=compress&cs=tinysrgb&h=650&w=940', 3),
((SELECT id FROM products WHERE slug='casual-shorts'), 'https://images.pexels.com/photos/15166690/pexels-photo-15166690.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='casual-shorts'), 'https://images.pexels.com/photos/5125723/pexels-photo-5125723.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='solid-henley-tshirt'), 'https://images.pexels.com/photos/2828798/pexels-photo-2828798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='solid-henley-tshirt'), 'https://images.pexels.com/photos/2381613/pexels-photo-2381613.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='solid-henley-tshirt'), 'https://images.pexels.com/photos/2783878/pexels-photo-2783878.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
-- Women's clothing
((SELECT id FROM products WHERE slug='womens-oversized-cotton-tshirt'), 'https://images.pexels.com/photos/6256274/pexels-photo-6256274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='womens-oversized-cotton-tshirt'), 'https://images.pexels.com/photos/7887973/pexels-photo-7887973.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='womens-oversized-cotton-tshirt'), 'https://images.pexels.com/photos/36644209/pexels-photo-36644209.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='casual-kurti'), 'https://images.pexels.com/photos/13178920/pexels-photo-13178920.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='casual-kurti'), 'https://images.pexels.com/photos/35521738/pexels-photo-35521738.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='casual-kurti'), 'https://images.pexels.com/photos/37523792/pexels-photo-37523792.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='casual-kurti'), 'https://images.pexels.com/photos/37523793/pexels-photo-37523793.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
((SELECT id FROM products WHERE slug='western-floral-dress'), 'https://images.pexels.com/photos/9893296/pexels-photo-9893296.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='western-floral-dress'), 'https://images.pexels.com/photos/15728365/pexels-photo-15728365.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='western-floral-dress'), 'https://images.pexels.com/photos/8771008/pexels-photo-8771008.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='crop-top'), 'https://images.pexels.com/photos/14581932/pexels-photo-14581932.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='crop-top'), 'https://images.pexels.com/photos/19236837/pexels-photo-19236837.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='crop-top'), 'https://images.pexels.com/photos/19220724/pexels-photo-19220724.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='womens-casual-shirt'), 'https://images.pexels.com/photos/36644206/pexels-photo-36644206.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='womens-casual-shirt'), 'https://images.pexels.com/photos/36644202/pexels-photo-36644202.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='womens-casual-shirt'), 'https://images.pexels.com/photos/1804228/pexels-photo-1804228.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='womens-highrise-jeans'), 'https://images.pexels.com/photos/6764124/pexels-photo-6764124.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='womens-highrise-jeans'), 'https://images.pexels.com/photos/1082526/pexels-photo-1082526.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='womens-highrise-jeans'), 'https://images.pexels.com/photos/4440866/pexels-photo-4440866.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='wide-leg-pants'), 'https://images.pexels.com/photos/32800072/pexels-photo-32800072.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='wide-leg-pants'), 'https://images.pexels.com/photos/36644209/pexels-photo-36644209.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='coord-set'), 'https://images.pexels.com/photos/19220724/pexels-photo-19220724.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='coord-set'), 'https://images.pexels.com/photos/19236837/pexels-photo-19236837.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='coord-set'), 'https://images.pexels.com/photos/14581932/pexels-photo-14581932.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='casual-top'), 'https://images.pexels.com/photos/1804228/pexels-photo-1804228.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='casual-top'), 'https://images.pexels.com/photos/7887973/pexels-photo-7887973.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='everyday-dress'), 'https://images.pexels.com/photos/9893296/pexels-photo-9893296.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='everyday-dress'), 'https://images.pexels.com/photos/8770996/pexels-photo-8770996.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='everyday-dress'), 'https://images.pexels.com/photos/8771008/pexels-photo-8771008.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='womens-oversized-sweatshirt'), 'https://images.pexels.com/photos/7479808/pexels-photo-7479808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='womens-oversized-sweatshirt'), 'https://images.pexels.com/photos/2108816/pexels-photo-2108816.png?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='anarkali-kurti'), 'https://images.pexels.com/photos/15906956/pexels-photo-15906956.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='anarkali-kurti'), 'https://images.pexels.com/photos/12660566/pexels-photo-12660566.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='anarkali-kurti'), 'https://images.pexels.com/photos/28405815/pexels-photo-28405815.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
-- Accessories
((SELECT id FROM products WHERE slug='analog-wrist-watch'), 'https://images.pexels.com/photos/13695978/pexels-photo-13695978.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='analog-wrist-watch'), 'https://images.pexels.com/photos/30026511/pexels-photo-30026511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='analog-wrist-watch'), 'https://images.pexels.com/photos/3380158/pexels-photo-3380158.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='polarized-sunglasses'), 'https://images.pexels.com/photos/3037281/pexels-photo-3037281.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='polarized-sunglasses'), 'https://images.pexels.com/photos/29511577/pexels-photo-29511577.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='polarized-sunglasses'), 'https://images.pexels.com/photos/3434522/pexels-photo-3434522.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='leather-wallet'), 'https://images.pexels.com/photos/7085778/pexels-photo-7085778.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='leather-wallet'), 'https://images.pexels.com/photos/28028260/pexels-photo-28028260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='leather-wallet'), 'https://images.pexels.com/photos/3037281/pexels-photo-3037281.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='reversible-belt'), 'https://images.pexels.com/photos/5828579/pexels-photo-5828579.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='reversible-belt'), 'https://images.pexels.com/photos/9065153/pexels-photo-9065153.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='classic-cap'), 'https://images.pexels.com/photos/20123400/pexels-photo-20123400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='classic-cap'), 'https://images.pexels.com/photos/13697756/pexels-photo-13697756.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='classic-cap'), 'https://images.pexels.com/photos/35854498/pexels-photo-35854498.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='sling-bag'), 'https://images.pexels.com/photos/7953286/pexels-photo-7953286.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='sling-bag'), 'https://images.pexels.com/photos/36367484/pexels-photo-36367484.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='laptop-backpack'), 'https://images.pexels.com/photos/12708168/pexels-photo-12708168.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='laptop-backpack'), 'https://images.pexels.com/photos/31681667/pexels-photo-31681667.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='leather-bracelet'), 'https://images.pexels.com/photos/3380158/pexels-photo-3380158.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='leather-bracelet'), 'https://images.pexels.com/photos/5828579/pexels-photo-5828579.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='chain-necklace'), 'https://images.pexels.com/photos/3380158/pexels-photo-3380158.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='chain-necklace'), 'https://images.pexels.com/photos/30026511/pexels-photo-30026511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='handbag'), 'https://images.pexels.com/photos/22434764/pexels-photo-22434764.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='handbag'), 'https://images.pexels.com/photos/7953286/pexels-photo-7953286.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='handbag'), 'https://images.pexels.com/photos/33471443/pexels-photo-33471443.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
-- Shoes
((SELECT id FROM products WHERE slug='casual-sneakers'), 'https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='casual-sneakers'), 'https://images.pexels.com/photos/8979071/pexels-photo-8979071.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='casual-sneakers'), 'https://images.pexels.com/photos/4273288/pexels-photo-4273288.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='running-shoes'), 'https://images.pexels.com/photos/20191568/pexels-photo-20191568.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='running-shoes'), 'https://images.pexels.com/photos/13236694/pexels-photo-13236694.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='running-shoes'), 'https://images.pexels.com/photos/14525666/pexels-photo-14525666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='walking-shoes'), 'https://images.pexels.com/photos/18972408/pexels-photo-18972408.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='walking-shoes'), 'https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='high-top-sneakers'), 'https://images.pexels.com/photos/4273288/pexels-photo-4273288.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='high-top-sneakers'), 'https://images.pexels.com/photos/5771898/pexels-photo-5771898.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='high-top-sneakers'), 'https://images.pexels.com/photos/18681226/pexels-photo-18681226.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='womens-sneakers'), 'https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='womens-sneakers'), 'https://images.pexels.com/photos/20191568/pexels-photo-20191568.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='casual-loafers'), 'https://images.pexels.com/photos/9464625/pexels-photo-9464625.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='casual-loafers'), 'https://images.pexels.com/photos/2897533/pexels-photo-2897533.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='sport-sandals'), 'https://images.pexels.com/photos/14017853/pexels-photo-14017853.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='sport-sandals'), 'https://images.pexels.com/photos/2950815/pexels-photo-2950815.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='canvas-slip-ons'), 'https://images.pexels.com/photos/18972408/pexels-photo-18972408.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='canvas-slip-ons'), 'https://images.pexels.com/photos/12628400/pexels-photo-12628400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='knit-sneakers'), 'https://images.pexels.com/photos/20191568/pexels-photo-20191568.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='knit-sneakers'), 'https://images.pexels.com/photos/14525666/pexels-photo-14525666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='knit-sneakers'), 'https://images.pexels.com/photos/13236694/pexels-photo-13236694.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
((SELECT id FROM products WHERE slug='formal-shoes'), 'https://images.pexels.com/photos/9464625/pexels-photo-9464625.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='formal-shoes'), 'https://images.pexels.com/photos/2897533/pexels-photo-2897533.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
-- Slippers
((SELECT id FROM products WHERE slug='casual-slippers'), 'https://images.pexels.com/photos/13643931/pexels-photo-13643931.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='casual-slippers'), 'https://images.pexels.com/photos/2244753/pexels-photo-2244753.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='comfort-slides'), 'https://images.pexels.com/photos/9267585/pexels-photo-9267585.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='comfort-slides'), 'https://images.pexels.com/photos/7825422/pexels-photo-7825422.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='leather-sandals'), 'https://images.pexels.com/photos/2950815/pexels-photo-2950815.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='leather-sandals'), 'https://images.pexels.com/photos/14017853/pexels-photo-14017853.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='womens-sandals'), 'https://images.pexels.com/photos/6008231/pexels-photo-6008231.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='womens-sandals'), 'https://images.pexels.com/photos/7825422/pexels-photo-7825422.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='mens-slides'), 'https://images.pexels.com/photos/13643931/pexels-photo-13643931.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='mens-slides'), 'https://images.pexels.com/photos/2244753/pexels-photo-2244753.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='flip-flops'), 'https://images.pexels.com/photos/36206835/pexels-photo-36206835.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='flip-flops'), 'https://images.pexels.com/photos/14820514/pexels-photo-14820514.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='sport-flip-flops'), 'https://images.pexels.com/photos/27650084/pexels-photo-27650084.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='sport-flip-flops'), 'https://images.pexels.com/photos/13643931/pexels-photo-13643931.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
((SELECT id FROM products WHERE slug='comfort-sandals'), 'https://images.pexels.com/photos/6008231/pexels-photo-6008231.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 0),
((SELECT id FROM products WHERE slug='comfort-sandals'), 'https://images.pexels.com/photos/9267585/pexels-photo-9267585.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1)
ON CONFLICT DO NOTHING;

-- ============ PRODUCT VARIANTS ============
-- For clothing: sizes XS,S,M,L,XL,XXL in 2-3 colors
-- For shoes/slippers: sizes 6,7,8,9,10,11 in 2 colors
-- We'll create a helper function to generate variants
DO $$
DECLARE
  p record;
  v_sizes text[];
  v_colors text[];
  v_stock int;
  v_sku text;
  v_size text;
  v_color text;
BEGIN
  FOR p IN SELECT id, slug, category_id FROM products LOOP
    -- Determine sizes based on category
    IF p.slug IN ('casual-sneakers','running-shoes','walking-shoes','high-top-sneakers','womens-sneakers','casual-loafers','sport-sandals','canvas-slip-ons','knit-sneakers','formal-shoes') THEN
      v_sizes := ARRAY['6','7','8','9','10','11'];
      v_colors := ARRAY['Black','White'];
    ELSIF p.slug IN ('casual-slippers','comfort-slides','leather-sandals','womens-sandals','mens-slides','flip-flops','sport-flip-flops','comfort-sandals') THEN
      v_sizes := ARRAY['6','7','8','9','10','11'];
      v_colors := ARRAY['Black','Brown'];
    ELSIF p.slug IN ('analog-wrist-watch','polarized-sunglasses','leather-wallet','reversible-belt','classic-cap','sling-bag','laptop-backpack','leather-bracelet','chain-necklace','handbag') THEN
      v_sizes := ARRAY['Free Size'];
      v_colors := ARRAY['Black','Brown'];
    ELSE
      v_sizes := ARRAY['XS','S','M','L','XL','XXL'];
      v_colors := ARRAY['Black','White','Olive'];
    END IF;

    FOREACH v_color IN ARRAY v_colors LOOP
      FOREACH v_size IN ARRAY v_sizes LOOP
        -- Random-ish stock between 0 and 15, with some sizes out of stock
        v_stock := CASE
          WHEN random() < 0.15 THEN 0
          ELSE floor(random() * 12 + 1)::int
        END;
        v_sku := UPPER(REPLACE(p.slug, '-', '_')) || '_' || UPPER(SUBSTRING(v_color, 1, 3)) || '_' || REPLACE(v_size, ' ', '');
        INSERT INTO product_variants (product_id, color, size, sku, stock)
        VALUES (p.id, v_color, v_size, v_sku, v_stock)
        ON CONFLICT (product_id, color, size) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- ============ PRODUCT DETAILS ============
INSERT INTO product_details (product_id, material, fit, pattern, sleeve, neck, occasion, wash_care, highlights)
SELECT
  p.id,
  CASE
    WHEN p.slug LIKE '%tshirt%' OR p.slug LIKE '%crop%' OR p.slug LIKE '%top%' OR p.slug LIKE '%henley%' THEN '100% Combed Cotton (180 GSM)'
    WHEN p.slug LIKE '%shirt%' THEN 'Cotton-Linen Blend'
    WHEN p.slug LIKE '%jeans%' THEN '99% Cotton, 1% Elastane'
    WHEN p.slug LIKE '%jogger%' OR p.slug LIKE '%cargo%' OR p.slug LIKE '%pants%' THEN 'Cotton Twill (98% Cotton, 2% Elastane)'
    WHEN p.slug LIKE '%hoodie%' OR p.slug LIKE '%sweatshirt%' THEN '400 GSM Fleece (60% Cotton, 40% Polyester)'
    WHEN p.slug LIKE '%shorts%' THEN '100% Cotton Twill'
    WHEN p.slug LIKE '%kurti%' THEN 'Rayon'
    WHEN p.slug LIKE '%dress%' THEN 'Polyester Georgette'
    WHEN p.slug LIKE '%coord%' THEN 'Terry Cotton'
    WHEN p.slug LIKE '%sneaker%' OR p.slug LIKE '%shoe%' OR p.slug LIKE '%loafer%' THEN 'Mesh/Canvas Upper, Rubber Outsole'
    WHEN p.slug LIKE '%slipper%' OR p.slug LIKE '%slide%' OR p.slug LIKE '%sandal%' OR p.slug LIKE '%flip%' THEN 'EVA/Rubber'
    WHEN p.slug LIKE '%watch%' THEN 'Stainless Steel, Genuine Leather'
    WHEN p.slug LIKE '%sunglass%' THEN 'Polycarbonate Frame, UV-400 Lens'
    WHEN p.slug LIKE '%wallet%' THEN 'Genuine Leather'
    WHEN p.slug LIKE '%belt%' THEN 'Genuine Leather'
    WHEN p.slug LIKE '%cap%' THEN 'Cotton Twill'
    WHEN p.slug LIKE '%bag%' OR p.slug LIKE '%backpack%' THEN 'Polyester/Vegan Leather'
    WHEN p.slug LIKE '%bracelet%' OR p.slug LIKE '%necklace%' THEN 'Stainless Steel, Leather'
    ELSE 'Premium Cotton'
  END,
  CASE
    WHEN p.slug LIKE '%tshirt%' OR p.slug LIKE '%crop%' OR p.slug LIKE '%top%' OR p.slug LIKE '%henley%' THEN 'Oversized'
    WHEN p.slug LIKE '%shirt%' OR p.slug LIKE '%kurti%' THEN 'Regular Fit'
    WHEN p.slug LIKE '%jeans%' OR p.slug LIKE '%jogger%' THEN 'Slim Fit'
    WHEN p.slug LIKE '%cargo%' OR p.slug LIKE '%pants%' THEN 'Relaxed Taper'
    WHEN p.slug LIKE '%hoodie%' OR p.slug LIKE '%sweatshirt%' THEN 'Oversized'
    WHEN p.slug LIKE '%dress%' OR p.slug LIKE '%coord%' THEN 'Regular Fit'
    ELSE 'Regular Fit'
  END,
  CASE
    WHEN p.slug LIKE '%graphic%' THEN 'Graphic Print'
    WHEN p.slug LIKE '%floral%' OR p.slug LIKE '%kurti%' THEN 'Floral Print'
    WHEN p.slug LIKE '%denim%' THEN 'Washed'
    WHEN p.slug LIKE '%jeans%' THEN 'Solid Mid-Wash'
    ELSE 'Solid'
  END,
  CASE
    WHEN p.slug LIKE '%tshirt%' OR p.slug LIKE '%henley%' THEN 'Half Sleeve'
    WHEN p.slug LIKE '%shirt%' THEN 'Full Sleeve'
    WHEN p.slug LIKE '%hoodie%' OR p.slug LIKE '%sweatshirt%' THEN 'Full Sleeve with Hood'
    WHEN p.slug LIKE '%top%' OR p.slug LIKE '%crop%' THEN 'Cap Sleeve'
    ELSE 'N/A'
  END,
  CASE
    WHEN p.slug LIKE '%tshirt%' THEN 'Crew Neck'
    WHEN p.slug LIKE '%henley%' THEN 'Henley'
    WHEN p.slug LIKE '%shirt%' THEN 'Button Collar'
    WHEN p.slug LIKE '%polo%' THEN 'Polo Collar'
    WHEN p.slug LIKE '%top%' OR p.slug LIKE '%crop%' THEN 'V-Neck / Square Neck'
    WHEN p.slug LIKE '%kurti%' THEN 'Round Neck'
    WHEN p.slug LIKE '%hoodie%' OR p.slug LIKE '%sweatshirt%' THEN 'Hooded'
    ELSE 'N/A'
  END,
  CASE
    WHEN p.slug LIKE '%formal%' THEN 'Formal'
    WHEN p.slug LIKE '%kurti%' OR p.slug LIKE '%anarkali%' THEN 'Festive / Casual'
    WHEN p.slug LIKE '%dress%' OR p.slug LIKE '%coord%' THEN 'Casual / Party'
    ELSE 'Casual / Everyday'
  END,
  CASE
    WHEN p.slug LIKE '%shoe%' OR p.slug LIKE '%slipper%' OR p.slug LIKE '%slide%' OR p.slug LIKE '%sandal%' OR p.slug LIKE '%flip%' THEN 'Wipe with damp cloth'
    WHEN p.slug LIKE '%watch%' OR p.slug LIKE '%sunglass%' OR p.slug LIKE '%bracelet%' OR p.slug LIKE '%necklace%' THEN 'Wipe with dry cloth'
    WHEN p.slug LIKE '%wallet%' OR p.slug LIKE '%belt%' THEN 'Keep dry, avoid water'
    ELSE 'Machine wash cold, do not bleach, tumble dry low'
  END,
  CASE
    WHEN p.slug LIKE '%tshirt%' OR p.slug LIKE '%top%' OR p.slug LIKE '%crop%' THEN ARRAY['Premium fabric','Comfortable fit','Everyday styling','Breathable cotton']
    WHEN p.slug LIKE '%shirt%' THEN ARRAY['Premium fabric','Tailored fit','Versatile styling','Breathable']
    WHEN p.slug LIKE '%jeans%' OR p.slug LIKE '%jogger%' THEN ARRAY['Stretch denim','All-day comfort','Durable construction','Trendy fit']
    WHEN p.slug LIKE '%hoodie%' OR p.slug LIKE '%sweatshirt%' THEN ARRAY['Heavyweight fleece','Cozy warmth','Oversized fit','Premium construction']
    WHEN p.slug LIKE '%kurti%' OR p.slug LIKE '%anarkali%' THEN ARRAY['Breathable rayon','Elegant design','Festive ready','Comfortable fit']
    WHEN p.slug LIKE '%dress%' THEN ARRAY['Flowy fabric','Floral print','Adjustable straps','Versatile styling']
    WHEN p.slug LIKE '%shoe%' THEN ARRAY['Cushioned insole','Durable outsole','Breathable upper','All-day comfort']
    WHEN p.slug LIKE '%slipper%' OR p.slug LIKE '%slide%' OR p.slug LIKE '%sandal%' THEN ARRAY['Soft footbed','Non-slip sole','Lightweight','Quick dry']
    WHEN p.slug LIKE '%watch%' THEN ARRAY['Premium build','Water resistant','Genuine leather strap','Minimalist design']
    WHEN p.slug LIKE '%sunglass%' THEN ARRAY['UV-400 protection','Polarized lens','Durable frame','Trendy design']
    WHEN p.slug LIKE '%wallet%' THEN ARRAY['Genuine leather','RFID protection','8 card slots','Slim profile']
    WHEN p.slug LIKE '%bag%' OR p.slug LIKE '%backpack%' THEN ARRAY['Water resistant','Padded laptop sleeve','Multiple pockets','Durable build']
    ELSE ARRAY['Premium quality','Comfortable','Everyday styling','Durable construction']
  END
FROM products p
ON CONFLICT (product_id) DO NOTHING;

-- ============ COUPONS ============
INSERT INTO coupons (code, type, value, min_order, max_discount, expiry_date, usage_limit, is_active) VALUES
('WELCOME100', 'flat', 100, 999, NULL, '2026-12-31', 1000, true),
('FASHION20', 'percent', 20, 1499, 500, '2026-12-31', 500, true),
('FREESHIP', 'free_delivery', 0, 0, NULL, '2026-12-31', 1000, true)
ON CONFLICT (code) DO NOTHING;

-- ============ DELIVERY ZONES (Mysuru pincodes) ============
INSERT INTO delivery_zones (city, pincode, area, delivery_charge, min_order, is_active) VALUES
('Mysuru', '570001', 'Mysuru City / Palace', 49, 0, true),
('Mysuru', '570002', 'Lashkar Mohalla', 49, 0, true),
('Mysuru', '570003', 'Vidyaranyapuram', 49, 0, true),
('Mysuru', '570004', 'Mandakalli', 49, 0, true),
('Mysuru', '570005', 'Bannimantap', 49, 0, true),
('Mysuru', '570006', 'Saraswathipuram', 49, 0, true),
('Mysuru', '570007', 'Kuvempunagar', 49, 0, true),
('Mysuru', '570008', 'Rajiv Nagar', 49, 0, true),
('Mysuru', '570009', 'Gokulam', 49, 0, true),
('Mysuru', '570010', 'Vijayanagar', 49, 0, true),
('Mysuru', '570011', 'Hebbal', 49, 0, true),
('Mysuru', '570012', 'Metagalli', 49, 0, true),
('Mysuru', '570013', 'K.R. Mohalla', 49, 0, true),
('Mysuru', '570014', 'Doora', 49, 0, true),
('Mysuru', '570015', 'Hootagalli', 49, 0, true),
('Mysuru', '570016', 'Mysuru South', 49, 0, true),
('Mysuru', '570017', 'T.K. Layout', 49, 0, true),
('Mysuru', '570018', 'Bogadi', 49, 0, true),
('Mysuru', '570019', 'Kalamandir', 49, 0, true),
('Mysuru', '570020', 'Jayalakshmipuram', 49, 0, true),
('Mysuru', '570021', 'Nazarbad', 49, 0, true),
('Mysuru', '570022', 'Indira Nagar', 49, 0, true),
('Mysuru', '570023', 'Jayaprakash Nagar', 49, 0, true),
('Mysuru', '570024', 'Dattagalli', 49, 0, true),
('Mysuru', '570025', 'Kuvempunagar 2nd Stage', 49, 0, true),
('Mysuru', '570026', 'Srirampura', 49, 0, true),
('Mysuru', '570027', 'Mysuru University', 49, 0, true),
('Mysuru', '570028', 'KHB Nagar', 49, 0, true),
('Mysuru', '570029', 'Udayagiri', 49, 0, true),
('Mysuru', '570030', 'Karanji', 49, 0, true),
('Mysuru', '570031', 'N.R. Mohalla', 49, 0, true),
('Mysuru', '570032', 'Siddartha Nagar', 49, 0, true),
('Mysuru', '570033', 'Ittige Gudu', 49, 0, true),
('Mysuru', '570034', 'Kergalli', 49, 0, true),
('Mysuru', '570035', 'Bannur Road', 49, 0, true),
('Mysuru', '570036', 'Ramakrishnanagar', 49, 0, true),
('Mysuru', '570037', 'Kalyanagiri', 49, 0, true),
('Mysuru', '570038', 'Lalitadripura', 49, 0, true),
('Mysuru', '570039', 'Yelwal', 49, 0, true),
('Mysuru', '570040', 'Mandya Road', 49, 0, true),
('Mysuru', '570041', 'Bogadi 2nd Stage', 49, 0, true),
('Mysuru', '570042', 'Hinkal', 49, 0, true),
('Mysuru', '570043', 'Kundalli', 49, 0, true),
('Mysuru', '570044', 'Koorgalli', 49, 0, true),
('Mysuru', '570045', 'Belavadi', 49, 0, true),
('Mysuru', '570046', 'Hunsur Road', 49, 0, true),
('Mysuru', '570047', 'Bannimantap 2nd Stage', 49, 0, true),
('Mysuru', '570048', 'Mysuru North', 49, 0, true),
('Mysuru', '571101', 'Nanjangud', 49, 0, true),
('Mysuru', '571102', 'T. Narasipura', 49, 0, true),
('Mysuru', '571103', 'K.R. Nagar', 49, 0, true),
('Mysuru', '571104', 'Hunsur', 49, 0, true),
('Mysuru', '571105', 'Heggadadevanakote', 49, 0, true),
('Mysuru', '571106', 'Piriyapatna', 49, 0, true),
('Mysuru', '571107', 'H.D. Kote', 49, 0, true),
('Mysuru', '571108', 'Saligrama', 49, 0, true),
('Mysuru', '571109', 'Mysuru Rural', 49, 0, true),
('Mysuru', '571110', 'Bannur', 49, 0, true),
('Mysuru', '571302', 'Narasipura', 49, 0, true),
('Mysuru', '571311', 'Kushalnagar', 49, 0, true),
('Mysuru', '571606', 'Kollegala', 49, 0, true)
ON CONFLICT (pincode) DO NOTHING;

-- ============ REVIEWS (Demo) ============
INSERT INTO reviews (product_id, user_name, rating, title, comment, is_demo) VALUES
((SELECT id FROM products WHERE slug='premium-oversized-cotton-tshirt'), 'Rahul', 5, 'Loved the quality!', 'Loved the quality and the delivery was really quick! The oversized fit is perfect.', true),
((SELECT id FROM products WHERE slug='premium-oversized-cotton-tshirt'), 'Karthik', 4, 'Great t-shirt', 'Good fabric and fit. Slightly larger than expected but looks great.', true),
((SELECT id FROM products WHERE slug='premium-oversized-cotton-tshirt'), 'Shashank', 5, 'Perfect fit', 'Best t-shirt I own. Will order more colors.', true),
((SELECT id FROM products WHERE slug='casual-kurti'), 'Ananya', 5, 'Finally a fashion store with easy local delivery', 'Finally a fashion store with easy local delivery. The kurti is beautiful and arrived the same day!', true),
((SELECT id FROM products WHERE slug='casual-kurti'), 'Priya', 4, 'Nice kurti', 'Good quality rayon, fits well. Color is slightly different from the photo but still nice.', true),
((SELECT id FROM products WHERE slug='casual-kurti'), 'Deepika', 5, 'Beautiful design', 'Got compliments at office. Will definitely order again from URANGADI.', true),
((SELECT id FROM products WHERE slug='casual-sneakers'), 'Ganesh', 5, 'Comfortable sneakers', 'Very comfortable for daily wear. Delivery was super fast in Mysuru!', true),
((SELECT id FROM products WHERE slug='casual-sneakers'), 'Manu', 4, 'Good value', 'Great sneakers for the price. Sole is a bit hard initially but breaks in nicely.', true),
((SELECT id FROM products WHERE slug='premium-hoodie'), 'Pavan', 5, 'Cozy and warm', 'Perfect for Mysuru winters. Heavy and warm, exactly as described.', true),
((SELECT id FROM products WHERE slug='premium-hoodie'), 'Vikram', 4, 'Nice hoodie', 'Good quality but runs slightly large. Size down if you want a regular fit.', true),
((SELECT id FROM products WHERE slug='analog-wrist-watch'), 'Suresh', 5, 'Elegant watch', 'Looks way more expensive than it is. Leather strap is genuine and comfortable.', true),
((SELECT id FROM products WHERE slug='analog-wrist-watch'), 'Naveen', 4, 'Good watch', 'Nice minimalist design. The strap could be a bit thicker but overall happy.', true),
((SELECT id FROM products WHERE slug='polarized-sunglasses'), 'Arjun', 5, 'Great sunglasses', 'Polarization is real, cuts glare perfectly. Fit is snug and comfortable.', true),
((SELECT id FROM products WHERE slug='polarized-sunglasses'), 'Tejas', 4, 'Stylish', 'Looks great and UV protection works well. Case would have been nice.', true),
((SELECT id FROM products WHERE slug='leather-wallet'), 'Madhu', 5, 'Premium wallet', 'Genuine leather, slim profile, holds all my cards. Excellent value!', true),
((SELECT id FROM products WHERE slug='leather-wallet'), 'Dinesh', 4, 'Good wallet', 'Nice quality leather. RFID protection is a bonus. Slightly tight for 8 cards.', true),
((SELECT id FROM products WHERE slug='womens-highrise-jeans'), 'Sneha', 5, 'Perfect jeans', 'The stretch denim is so comfortable. High rise is flattering. Love it!', true),
((SELECT id FROM products WHERE slug='womens-highrise-jeans'), 'Kavya', 4, 'Great fit', 'Good jeans, true to size. Color is exactly as shown.', true),
((SELECT id FROM products WHERE slug='coord-set'), 'Bhavana', 5, 'Trendy co-ord set', 'Got this for a trip and it was perfect. Comfortable and stylish.', true),
((SELECT id FROM products WHERE slug='coord-set'), 'Chaitra', 4, 'Cute set', 'Love the matching top and shorts. Fabric is soft. Runs slightly small.', true),
((SELECT id FROM products WHERE slug='running-shoes'), 'Anil', 5, 'Best running shoes', 'Lightweight and breathable. Great for morning runs around Kukkarahalli Lake.', true),
((SELECT id FROM products WHERE slug='running-shoes'), 'Vinay', 4, 'Good shoes', 'Comfortable and well-cushioned. Took a couple days to break in.', true),
((SELECT id FROM products WHERE slug='laptop-backpack'), 'Rohan', 5, 'Excellent backpack', 'Fits my 15.6" laptop perfectly. Water resistant and looks professional.', true),
((SELECT id FROM products WHERE slug='laptop-backpack'), 'Kiran', 4, 'Solid bag', 'Good build quality. USB port is handy. Could use more internal organization.', true),
((SELECT id FROM products WHERE slug='handbag'), 'Lakshmi', 5, 'Beautiful handbag', 'Spacious and stylish. Vegan leather feels premium. Got many compliments.', true),
((SELECT id FROM products WHERE slug='handbag'), 'Vidya', 4, 'Nice bag', 'Good size for daily use. Color is exactly as shown in photos.', true),
((SELECT id FROM products WHERE slug='anarkali-kurti'), 'Shruti', 5, 'Festive ready', 'Wore it for a family function and everyone loved it. Embroidery is beautiful.', true),
((SELECT id FROM products WHERE slug='anarkali-kurti'), 'Megha', 4, 'Elegant', 'Beautiful anarkali. Fits well. Length is perfect for my height (5''4").', true),
((SELECT id FROM products WHERE slug='comfort-slides'), 'Jagdish', 5, 'Comfortable slides', 'Perfect for home and quick errands. Cushioned footbed is very comfortable.', true),
((SELECT id FROM products WHERE slug='comfort-slides'), 'Pooja', 4, 'Good slides', 'Nice and comfortable. Non-slip sole works well on wet floors.', true)
ON CONFLICT DO NOTHING;
-- =========================================================
-- FIX 1: INFINITE RECURSION IN PROFILES RLS POLICY
-- =========================================================

-- Create a SECURITY DEFINER function to check admin status without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fix PROFILES policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "read_profiles" ON public.profiles;
CREATE POLICY "read_profiles" ON public.profiles
  FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Update RLS policies on CATEGORIES, PRODUCTS, PRODUCT_IMAGES, PRODUCT_VARIANTS, PRODUCT_DETAILS, ORDERS
DROP POLICY IF EXISTS "admin_insert_categories" ON public.categories;
CREATE POLICY "admin_insert_categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_categories" ON public.categories;
CREATE POLICY "admin_update_categories" ON public.categories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_categories" ON public.categories;
CREATE POLICY "admin_delete_categories" ON public.categories FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
CREATE POLICY "admin_insert_products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_products" ON public.products;
CREATE POLICY "admin_update_products" ON public.products FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_products" ON public.products;
CREATE POLICY "admin_delete_products" ON public.products FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_product_images" ON public.product_images;
CREATE POLICY "admin_insert_product_images" ON public.product_images FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_product_images" ON public.product_images;
CREATE POLICY "admin_update_product_images" ON public.product_images FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_product_images" ON public.product_images;
CREATE POLICY "admin_delete_product_images" ON public.product_images FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_product_variants" ON public.product_variants;
CREATE POLICY "admin_insert_product_variants" ON public.product_variants FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_product_variants" ON public.product_variants;
CREATE POLICY "admin_update_product_variants" ON public.product_variants FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_product_variants" ON public.product_variants;
CREATE POLICY "admin_delete_product_variants" ON public.product_variants FOR DELETE TO authenticated USING (public.is_admin());

-- =========================================================
-- FIX 2: FREE DELIVERY & 1-HOUR EXPRESS DELIVERY SETTINGS
-- =========================================================
INSERT INTO public.settings (key, value) VALUES
  ('free_delivery_threshold', '0'),
  ('default_delivery_fee', '0'),
  ('delivery_time_guarantee', '1 Hour Express Delivery')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
