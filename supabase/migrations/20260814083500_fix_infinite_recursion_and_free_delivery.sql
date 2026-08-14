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
