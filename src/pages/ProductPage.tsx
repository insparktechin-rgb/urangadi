import { useState, useEffect, useMemo } from 'react';
import { useRouter, Link } from '@/lib/router';
import { useStore } from '@/lib/store';
import { getProductBySlug, getProductReviews, checkPincodeDelivery } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/api';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RefreshCw,
  Shield,
  Minus,
  Plus,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { formatINR, classNames, isValidPincode, getAllProductImages } from '@/lib/utils';
import type { Product, Review } from '@/lib/types';

export function ProductPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    settings,
    deliveryPincode,
    setDeliveryPincode,
  } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(deliveryPincode || '');
  const [pincodeStatus, setPincodeStatus] = useState<
    null | 'available' | 'unavailable'
  >(null);
  const [pincodeArea, setPincodeArea] = useState('');
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await getProductBySlug(slug);
        setProduct(p);
        if (p) {
          const [revs, all] = await Promise.all([
            getProductReviews(p.id),
            getProducts({ category: p.category_id || undefined, limit: 20 }),
          ]);
          setReviews(revs);
          setRelated(all.filter((x) => x.id !== p.id).slice(0, 4));
          // Set default color/size
          const variants = p.variants || [];
          if (variants.length > 0) {
            const firstAvailable = variants.find((v) => v.stock > 0);
            if (firstAvailable) {
              setSelectedColor(firstAvailable.color);
              setSelectedSize(firstAvailable.size);
            } else {
              setSelectedColor(variants[0].color);
              setSelectedSize(variants[0].size);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load product:', e);
      } finally {
        setLoading(false);
      }
    };
    load();

    const handleProductsUpdated = () => {
      load();
    };
    window.addEventListener('urangadi_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('urangadi_products_updated', handleProductsUpdated);
    };
  }, [slug]);

  const colors = useMemo(() => {
    if (!product) return [];
    const set = new Set((product.variants || []).map((v) => v.color));
    return Array.from(set);
  }, [product]);

  const sizes = useMemo(() => {
    if (!product) return [];
    const set = new Set(
      (product.variants || [])
        .filter((v) => v.color === selectedColor)
        .map((v) => v.size),
    );
    return Array.from(set);
  }, [product, selectedColor]);

  const currentVariant = useMemo(() => {
    if (!product) return null;
    return (
      (product.variants || []).find(
        (v) => v.color === selectedColor && v.size === selectedSize,
      ) || null
    );
  }, [product, selectedColor, selectedSize]);

  const inStock = currentVariant ? currentVariant.stock > 0 : false;

  const checkPincode = async () => {
    if (!isValidPincode(pincodeInput)) {
      setPincodeStatus('unavailable');
      setPincodeArea('');
      return;
    }
    try {
      const result = await checkPincodeDelivery(pincodeInput);
      if (result.available) {
        setPincodeStatus('available');
        setPincodeArea(result.zone?.area || '');
        setDeliveryPincode(pincodeInput);
      } else {
        setPincodeStatus('unavailable');
        setPincodeArea('');
        setDeliveryPincode(null);
      }
    } catch {
      setPincodeStatus('unavailable');
    }
  };

  const handleAddToCart = () => {
    if (!product || !currentVariant) return;
    if (!selectedColor) {
      setError('Please select a color');
      return;
    }
    if (!selectedSize) {
      setError('Please select a size');
      return;
    }
    if (!inStock) {
      setError('This size is currently out of stock');
      return;
    }
    setError('');
    addToCart({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: (product.images || [])[0]?.image_url || '',
      color: selectedColor,
      size: selectedSize,
      quantity,
      stock: currentVariant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square rounded-xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-8 w-1/3 rounded bg-gray-200" />
            <div className="h-32 w-full rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link
          to="/"
          className="mt-4 inline-block text-orange-600 font-semibold"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const images = getAllProductImages(product);
  const currentImage = images[selectedImage] || images[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop';
  const details = product.details;
  const wished = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 overflow-hidden">
        <Link to="/" className="hover:text-orange-600 whitespace-nowrap">
          Home
        </Link>
        <ChevronRight size={12} className="flex-shrink-0" />
        {product.category && (
          <>
            <Link
              to={`/category/${product.category.slug}`}
              className="hover:text-orange-600 whitespace-nowrap"
            >
              {product.category.name}
            </Link>
            <ChevronRight size={12} className="flex-shrink-0" />
          </>
        )}
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 mb-3 border border-gray-100">
            <img
              src={currentImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {images.map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={classNames(
                  'h-16 w-16 overflow-hidden rounded-lg border-2 flex-shrink-0 bg-gray-100',
                  selectedImage === i ? 'border-orange-500' : 'border-transparent',
                )}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {product.brand}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.floor(product.rating)
                      ? 'fill-orange-400 text-orange-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {product.rating}
            </span>
            <span className="text-sm text-gray-400">
              ({product.review_count} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-extrabold text-gray-900">
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatINR(product.mrp)}
                </span>
                <span className="bg-orange-100 text-orange-700 text-sm font-bold px-2 py-0.5 rounded-md">
                  {product.discount_pct}% OFF
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Inclusive of all taxes</p>

          {/* Availability */}
          <div className="mt-3">
            {inStock ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600">
                <Check size={16} /> In Stock
                {currentVariant && currentVariant.stock <= 5 && (
                  <span className="text-red-500 ml-2">
                    Only {currentVariant.stock} left!
                  </span>
                )}
              </span>
            ) : (
              <span className="text-sm font-semibold text-red-500">
                Out of Stock
              </span>
            )}
          </div>

          {/* Color Selector */}
          {colors.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Color: <span className="font-normal">{selectedColor}</span>
                </h3>
              </div>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      const firstSize = (product.variants || []).find(
                        (v) => v.color === color && v.stock > 0,
                      );
                      if (firstSize) setSelectedSize(firstSize.size);
                      setError('');
                    }}
                    className={classNames(
                      'px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors',
                      selectedColor === color
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400',
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Size: <span className="font-normal">{selectedSize}</span>
                </h3>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const variant = (product.variants || []).find(
                    (v) => v.color === selectedColor && v.size === size,
                  );
                  const isAvailable = variant ? variant.stock > 0 : false;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setError('');
                      }}
                      disabled={!isAvailable}
                      className={classNames(
                        'min-w-12 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors',
                        selectedSize === size
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : isAvailable
                            ? 'border-gray-200 text-gray-700 hover:border-gray-400'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50',
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
              <span className="text-lg font-bold w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(
                    Math.min(quantity + 1, currentVariant?.stock || 99),
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={classNames(
                'flex-1 py-3.5 font-bold rounded-xl transition-all',
                !inStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : added
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white',
              )}
            >
              {added ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={18} /> ADDED TO CART
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShoppingBag size={18} /> ADD TO CART
                </span>
              )}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className={classNames(
                'flex-1 py-3.5 font-bold rounded-xl transition-all',
                !inStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600',
              )}
            >
              BUY NOW
            </button>
            <button
              onClick={() =>
                toggleWishlist({
                  product_id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image_url: images[0] || '',
                  mrp: product.mrp,
                })
              }
              className={classNames(
                'flex h-[52px] w-[52px] items-center justify-center rounded-xl border-2 transition-colors',
                wished
                  ? 'border-red-500 text-red-500 bg-red-50'
                  : 'border-gray-200 text-gray-700 hover:border-gray-400',
              )}
              aria-label="Toggle wishlist"
            >
              <Heart size={22} className={wished ? 'fill-red-500' : ''} />
            </button>
          </div>

          {/* Delivery Checker */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Truck size={18} className="text-orange-500" />
              <h3 className="text-sm font-bold text-gray-900">
                Delivery Availability
              </h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter your pincode"
                maxLength={6}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 bg-white"
              />
              <button
                onClick={checkPincode}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800"
              >
                CHECK
              </button>
            </div>
            {pincodeStatus === 'available' && (
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-600">
                <Check size={16} /> We deliver here — ⚡ 1-Hour Express Delivery (FREE Delivery)
                {pincodeArea && (
                  <span className="text-gray-500 font-normal">— {pincodeArea}</span>
                )}
              </div>
            )}
            {pincodeStatus === 'unavailable' && (
              <div className="mt-3 text-sm font-semibold text-orange-600">
                We're coming soon! URANGADI is currently available only in Mysuru.
              </div>
            )}

            <div className="mt-4 flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl text-xs text-orange-950">
              <span className="text-lg">⚡</span>
              <div>
                <p className="font-extrabold text-orange-900">Mysuru 1-Hour Express Delivery</p>
                <p className="text-orange-800 font-medium">Order now to receive within 60 minutes. 100% FREE Delivery guaranteed.</p>
              </div>
            </div>
          </div>

          {/* Delivery & Returns */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100">
              <Truck size={20} className="text-orange-500 mb-1" />
              <p className="text-xs font-semibold text-gray-700">
                Fast Delivery
              </p>
              <p className="text-[10px] text-gray-400">Across Mysuru</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100">
              <RefreshCw size={20} className="text-orange-500 mb-1" />
              <p className="text-xs font-semibold text-gray-700">
                Easy Returns
              </p>
              <p className="text-[10px] text-gray-400">7-day return</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-xl border border-gray-100">
              <Shield size={20} className="text-orange-500 mb-1" />
              <p className="text-xs font-semibold text-gray-700">
                Quality Assured
              </p>
              <p className="text-[10px] text-gray-400">Premium products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Details */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Product Details
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {product.description}
          </p>
          {details && (
            <div className="grid grid-cols-2 gap-2">
              {details.material && (
                <DetailRow label="Material" value={details.material} />
              )}
              {details.fit && (
                <DetailRow label="Fit" value={details.fit} />
              )}
              {details.pattern && (
                <DetailRow label="Pattern" value={details.pattern} />
              )}
              {details.sleeve && (
                <DetailRow label="Sleeve" value={details.sleeve} />
              )}
              {details.neck && (
                <DetailRow label="Neck" value={details.neck} />
              )}
              {details.occasion && (
                <DetailRow label="Occasion" value={details.occasion} />
              )}
              {details.wash_care && (
                <DetailRow label="Wash Care" value={details.wash_care} />
              )}
            </div>
          )}
        </div>

        <div>
          {details?.highlights && details.highlights.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Highlights
              </h2>
              <ul className="space-y-2">
                {details.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={18} className="text-green-600" />
              <h3 className="text-sm font-bold text-green-800">Delivery</h3>
            </div>
            <p className="text-sm text-green-700">
              Available for delivery across Mysuru. Fast delivery available.
            </p>
          </div>

          <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={18} className="text-gray-600" />
              <h3 className="text-sm font-bold text-gray-900">Returns</h3>
            </div>
            <p className="text-sm text-gray-600">
              7-day easy returns and exchanges. Products must be unused with
              original tags intact.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Customer Reviews ({reviews.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-xl border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < review.rating
                            ? 'fill-orange-400 text-orange-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  {review.is_demo && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      Demo
                    </span>
                  )}
                </div>
                {review.title && (
                  <h4 className="text-sm font-bold text-gray-900">
                    {review.title}
                  </h4>
                )}
                <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                <p className="mt-2 text-xs text-gray-400">
                  — {review.user_name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSizeGuide(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Size Guide</h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="p-1 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            {sizes.some((s) => ['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(s)) ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-left font-bold text-gray-900">
                      Size
                    </th>
                    <th className="py-2 text-left font-bold text-gray-900">
                      Chest
                    </th>
                    <th className="py-2 text-left font-bold text-gray-900">
                      Length
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: 'XS', chest: '36"', length: '26"' },
                    { size: 'S', chest: '38"', length: '27"' },
                    { size: 'M', chest: '40"', length: '28"' },
                    { size: 'L', chest: '42"', length: '29"' },
                    { size: 'XL', chest: '44"', length: '30"' },
                    { size: 'XXL', chest: '46"', length: '31"' },
                    { size: 'XXXL', chest: '48"', length: '32"' },
                  ].map((row) => (
                    <tr
                      key={row.size}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-2 font-semibold text-gray-900">
                        {row.size}
                      </td>
                      <td className="py-2 text-gray-600">{row.chest}</td>
                      <td className="py-2 text-gray-600">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-left font-bold text-gray-900">
                      UK Size
                    </th>
                    <th className="py-2 text-left font-bold text-gray-900">
                      Foot Length (cm)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { uk: '6', cm: '24.5' },
                    { uk: '7', cm: '25.5' },
                    { uk: '8', cm: '26.5' },
                    { uk: '9', cm: '27.5' },
                    { uk: '10', cm: '28.5' },
                    { uk: '11', cm: '29.5' },
                  ].map((row) => (
                    <tr
                      key={row.uk}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-2 font-semibold text-gray-900">
                        UK {row.uk}
                      </td>
                      <td className="py-2 text-gray-600">{row.cm} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-4 text-xs text-gray-400">
              Measurements are approximate. For best fit, measure a similar
              garment you own.
            </p>
          </div>
        </div>
      )}

      {/* Sticky Mobile Purchase Bar */}
      {inStock && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
          <div>
            {product.mrp > product.price && (
              <span className="block text-[10px] text-gray-400 line-through">
                {formatINR(product.mrp)}
              </span>
            )}
            <span className="text-base font-extrabold text-gray-900 leading-none">
              {formatINR(product.price)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-[240px]">
            <button
              onClick={handleAddToCart}
              className={classNames(
                'flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1',
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-900 text-white active:scale-95',
              )}
            >
              <ShoppingBag size={14} />
              {added ? 'ADDED' : 'ADD TO CART'}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-2.5 px-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-all shadow-sm active:scale-95"
            >
              BUY NOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-700">{value}</span>
    </div>
  );
}
