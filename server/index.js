import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsFilePath = path.join(__dirname, 'data', 'products.json');

function loadProductsFromDisk() {
  try {
    if (fs.existsSync(productsFilePath)) {
      const data = fs.readFileSync(productsFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error loading products.json:', err.message);
  }
  return defaultProducts;
}

function saveProductsToDisk(products) {
  try {
    const dir = path.dirname(productsFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving products.json:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Single Unified Admin Console Redirect
app.get(['/', '/admin', '/products', '/dashboard'], (req, res) => {
  res.redirect('http://localhost:5173/admin');
});

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ilcoylecsxjxsjofjcwe.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsY295bGVjc3hqeHNqb2ZqY3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODk5MzMsImV4cCI6MjEwMjI2NTkzM30.tGHtyrs9x5e0nRdGIjOl0uSi6eteXGYlLypwquEATzs';
const supabase = createClient(supabaseUrl, supabaseKey);

const razorpayKeyId = process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TPaLtagTgXunnc';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'S7kZiR5MEZ5FFByCkN7NUQs7';

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

// Disk persistent store for demo/standalone server mode
const defaultProducts = [
  {
    id: 'prod-1',
    name: 'Mysuru Silk Blend Festive Kurta',
    slug: 'mysuru-silk-blend-festive-kurta',
    description: 'Traditional handcrafted Mysuru silk blend festive kurta with rich zari borders.',
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
    images: [{ id: 'img-1', product_id: 'prod-1', image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop', sort_order: 0 }],
    variants: [
      { id: 'v-1', product_id: 'prod-1', color: 'Royal Blue', size: 'M', sku: 'MSK-RB-M', stock: 15 },
      { id: 'v-2', product_id: 'prod-1', color: 'Royal Blue', size: 'L', sku: 'MSK-RB-L', stock: 8 },
    ],
  },
  {
    id: 'prod-2',
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
    images: [{ id: 'img-2', product_id: 'prod-2', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop', sort_order: 0 }],
    variants: [
      { id: 'v-3', product_id: 'prod-2', color: 'Yellow', size: 'Free Size', sku: 'CPS-YEL-FS', stock: 30 },
    ],
  },
];

let mockProducts = loadProductsFromDisk();

let mockOrders = [
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
    payment_status: 'paid',
    transaction_id: 'TXN_UPI_9948123',
    coupon_code: 'WELCOME100',
    address: {
      full_name: 'Suhas Gowda',
      mobile: '9845012345',
      house: '#12, 4th Main',
      street: 'Gokulam 3rd Stage',
      area: 'Gokulam',
      pincode: '570002',
      city: 'Mysuru',
      state: 'Karnataka',
    },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'oi-1',
        order_id: 'ord-1001',
        product_id: 'prod-1',
        product_name: 'Mysuru Silk Blend Festive Kurta',
        image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop',
        color: 'Royal Blue',
        size: 'M',
        quantity: 1,
        price: 1499,
      },
    ],
  },
  {
    id: 'ord-1002',
    user_id: 'usr-2',
    order_number: 'URG-2026-9482',
    status: 'out_for_delivery',
    subtotal: 999,
    discount: 0,
    delivery_fee: 49,
    total: 1048,
    payment_method: 'COD',
    payment_status: 'pending',
    transaction_id: 'TXN_COD_9948124',
    coupon_code: null,
    address: {
      full_name: 'Priya Sharma',
      mobile: '9741098765',
      house: '#88, Vijayanagar',
      street: '1st Stage',
      area: 'Vijayanagar',
      pincode: '570017',
      city: 'Mysuru',
      state: 'Karnataka',
    },
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'oi-2',
        order_id: 'ord-1002',
        product_id: 'prod-2',
        product_name: 'Channapatna Printed Georgette Saree',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop',
        color: 'Yellow',
        size: 'Free Size',
        quantity: 1,
        price: 999,
      },
    ],
  },
];

let mockUsers = [
  { id: 'usr-1', email: 'admin@urangadi.com', full_name: 'Store Admin', phone: '9845000000', is_admin: true, created_at: new Date().toISOString() },
  { id: 'usr-2', email: 'suhas@example.com', full_name: 'Suhas Gowda', phone: '9845012345', is_admin: false, created_at: new Date().toISOString() },
  { id: 'usr-3', email: 'priya@example.com', full_name: 'Priya Sharma', phone: '9741098765', is_admin: false, created_at: new Date().toISOString() },
];

let mockPayments = [
  { id: 'pay-1', order_id: 'ord-1001', order_number: 'URG-2026-9481', customer_name: 'Suhas Gowda', amount: 1399, method: 'UPI', status: 'completed', gateway_ref: 'UPI_REF_881923', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 'pay-2', order_id: 'ord-1002', order_number: 'URG-2026-9482', customer_name: 'Priya Sharma', amount: 1048, method: 'COD', status: 'pending', gateway_ref: 'COD_REF_881924', created_at: new Date(Date.now() - 3600000 * 1).toISOString() },
];

// ------------ API ENDPOINTS ------------

// Health check & Razorpay Gateway Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'URANGADI Admin Backend Server',
    razorpay_configured: Boolean(razorpayKeyId && razorpayKeySecret),
    razorpay_key_id: razorpayKeyId ? `${razorpayKeyId.slice(0, 8)}...` : null,
    timestamp: new Date(),
  });
});

// RAZORPAY PAYMENT ENDPOINTS
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency,
      receipt: receipt || `rec_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
    });
  } catch (err) {
    console.error('Razorpay Order Creation Failed:', err);
    res.status(500).json({ error: err.message || 'Failed to create Razorpay Order' });
  }
});

app.post('/api/verify-razorpay-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
      const newPay = {
        id: `pay-${Date.now()}`,
        order_id: order_id || `ord-${Date.now()}`,
        order_number: order_id || `URG-2026-${Date.now().toString().slice(-4)}`,
        customer_name: req.body.customer_name || 'Online Customer',
        amount: req.body.amount || 0,
        method: 'Razorpay / UPI / Card',
        status: 'completed',
        gateway_ref: razorpay_payment_id,
        created_at: new Date().toISOString(),
      };
      mockPayments.unshift(newPay);

      return res.json({
        success: true,
        message: 'Razorpay payment verified successfully',
        payment_id: razorpay_payment_id,
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid Razorpay signature verification' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. STATS OVERVIEW
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalRevenue = mockOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    const pendingCount = mockOrders.filter((o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'out_for_delivery').length;
    res.json({
      total_revenue: totalRevenue,
      total_orders: mockOrders.length,
      pending_orders: pendingCount,
      total_products: mockProducts.length,
      total_customers: mockUsers.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. PRODUCTS API
app.get('/api/admin/products', async (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.redirect('http://localhost:5173/admin');
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*), category:categories(*)');
    if (error || !data || data.length === 0) {
      return res.json(mockProducts);
    }
    res.json(data);
  } catch (err) {
    res.json(mockProducts);
  }
});

app.get('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  const product = mockProducts.find((p) => p.id === id || p.slug === id);
  if (product) return res.json(product);
  res.status(404).json({ error: 'Product not found' });
});

app.post('/api/admin/products', async (req, res) => {
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: req.body.name || 'New Product',
    slug: req.body.slug || `product-${Date.now()}`,
    description: req.body.description || '',
    category_id: req.body.category_id || 'cat-men',
    gender: req.body.gender || 'unisex',
    price: Number(req.body.price) || 999,
    mrp: Number(req.body.mrp) || 1999,
    discount_pct: Math.round((1 - (req.body.price / req.body.mrp)) * 100) || 50,
    rating: 4.5,
    review_count: 0,
    brand: 'URANGADI',
    is_new: req.body.is_new ?? true,
    is_bestseller: req.body.is_bestseller ?? false,
    is_flash_sale: req.body.is_flash_sale ?? false,
    flash_sale_stock: Number(req.body.flash_sale_stock) || 0,
    created_at: new Date().toISOString(),
    images: (req.body.images || ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop']).map((url, i) => ({
      id: `img-${Date.now()}-${i}`,
      product_id: `prod-${Date.now()}`,
      image_url: url,
      sort_order: i,
    })),
    variants: (req.body.variants || [{ color: 'Default', size: 'M', stock: 10 }]).map((v, i) => ({
      id: `var-${Date.now()}-${i}`,
      product_id: `prod-${Date.now()}`,
      color: v.color,
      size: v.size,
      sku: `${req.body.slug}_${v.color}_${v.size}`.toUpperCase(),
      stock: v.stock,
    })),
  };
  mockProducts.unshift(newProduct);
  saveProductsToDisk(mockProducts);
  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  let index = mockProducts.findIndex((p) => p.id === id || p.slug === id);

  const updatedImages = req.body.images && Array.isArray(req.body.images)
    ? req.body.images.map((url, i) => ({ id: `img-${Date.now()}-${i}`, product_id: id, image_url: url, sort_order: i }))
    : [{ id: `img-${Date.now()}-0`, product_id: id, image_url: req.body.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop', sort_order: 0 }];

  const updatedVariants = req.body.variants && Array.isArray(req.body.variants)
    ? req.body.variants.map((v, i) => ({ id: `var-${Date.now()}-${i}`, product_id: id, color: v.color, size: v.size, sku: `${(req.body.slug || 'prod')}_${v.color}_${v.size}`.toUpperCase(), stock: v.stock }))
    : [{ id: `var-${Date.now()}-0`, product_id: id, color: 'Default', size: 'M', sku: 'DEFAULT-M', stock: 15 }];

  if (index !== -1) {
    mockProducts[index] = {
      ...mockProducts[index],
      ...req.body,
      images: updatedImages,
      variants: updatedVariants,
    };
  } else {
    const newProduct = {
      id,
      name: req.body.name || 'New Product',
      slug: req.body.slug || `product-${Date.now()}`,
      description: req.body.description || '',
      category_id: req.body.category_id || 'cat-men',
      gender: req.body.gender || 'unisex',
      price: Number(req.body.price) || 999,
      mrp: Number(req.body.mrp) || 1999,
      discount_pct: Math.round((1 - (req.body.price / req.body.mrp)) * 100) || 50,
      rating: 4.5,
      review_count: 0,
      brand: 'URANGADI',
      is_new: req.body.is_new ?? true,
      is_bestseller: req.body.is_bestseller ?? false,
      is_flash_sale: req.body.is_flash_sale ?? false,
      flash_sale_stock: Number(req.body.flash_sale_stock) || 0,
      created_at: new Date().toISOString(),
      images: updatedImages,
      variants: updatedVariants,
    };
    mockProducts.unshift(newProduct);
    index = 0;
  }

  saveProductsToDisk(mockProducts);
  return res.json({ success: true, product: mockProducts[index] });
});

app.patch('/api/admin/products/:id/stock', (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  const product = mockProducts.find((p) => p.id === id);
  if (product) {
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => { v.stock = Number(stock) || 0; });
    }
    saveProductsToDisk(mockProducts);
    return res.json({ success: true, product });
  }
  res.status(404).json({ error: 'Product not found' });
});

app.delete('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  mockProducts = mockProducts.filter((p) => p.id !== id);
  saveProductsToDisk(mockProducts);
  res.json({ success: true, deleted_id: id });
});

// 3. ORDERS & TRACKING MANAGEMENT API
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)');
    if (error || !data || data.length === 0) {
      return res.json(mockOrders);
    }
    res.json(data);
  } catch (err) {
    res.json(mockOrders);
  }
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = mockOrders.find((o) => o.id === id || o.order_number === id);
  if (order) {
    order.status = status;
    order.updated_at = new Date().toISOString();
    return res.json({ success: true, order });
  }
  res.status(404).json({ error: 'Order not found' });
});

// 4. USER & PROFILES API
app.get('/api/admin/users', async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error || !data || data.length === 0) {
      return res.json(mockUsers);
    }
    res.json(data);
  } catch (err) {
    res.json(mockUsers);
  }
});

app.put('/api/admin/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { is_admin } = req.body;
  const user = mockUsers.find((u) => u.id === id);
  if (user) {
    user.is_admin = Boolean(is_admin);
    return res.json({ success: true, user });
  }
  res.status(404).json({ error: 'User not found' });
});

// 5. PAYMENTS MANAGEMENT API
app.get('/api/admin/payments', (req, res) => {
  res.json(mockPayments);
});

app.put('/api/admin/payments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const payment = mockPayments.find((p) => p.id === id);
  if (payment) {
    payment.status = status;
    return res.json({ success: true, payment });
  }
  res.status(404).json({ error: 'Payment record not found' });
});

app.listen(PORT, () => {
  console.log(`✅ URANGADI Backend Admin API Server running on http://localhost:${PORT}`);
});
