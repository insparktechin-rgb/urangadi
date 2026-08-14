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
