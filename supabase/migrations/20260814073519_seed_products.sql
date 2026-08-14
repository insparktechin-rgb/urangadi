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
