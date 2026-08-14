import { useState, useEffect } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { getProducts, getCategories } from '@/lib/api';
import type { Product, Category } from '@/lib/types';
import {
  Zap,
  Shirt,
  Tag,
  MapPin,
  Star,
  ArrowRight,
  Truck,
  Clock,
  Sparkles,
  Instagram,
} from 'lucide-react';

export function HomePage() {
  const { navigate } = useRouter();
  const { settings } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashSale, setFlashSale] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [menProducts, setMenProducts] = useState<Product[]>([]);
  const [womenProducts, setWomenProducts] = useState<Product[]>([]);
  const [shoesProducts, setShoesProducts] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        const shoesCat = cats.find((c) => c.slug === 'shoes');
        const accCat = cats.find((c) => c.slug === 'accessories');
        const [flash, newArr, men, women, shoes, acc, best] =
          await Promise.all([
            getProducts({ is_flash_sale: true, limit: 8 }),
            getProducts({ is_new: true, limit: 8 }),
            getProducts({ gender: 'men', limit: 8 }),
            getProducts({ gender: 'women', limit: 8 }),
            getProducts({ category: shoesCat?.id, limit: 8 }),
            getProducts({ category: accCat?.id, limit: 8 }),
            getProducts({ is_bestseller: true, limit: 8 }),
          ]);
        setFlashSale(flash);
        setNewArrivals(newArr);
        setMenProducts(men);
        setWomenProducts(women);
        setShoesProducts(shoes);
        setAccessories(acc);
        setBestSellers(best);
      } catch (e) {
        console.error('Failed to load home data:', e);
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
  }, []);

  // Flash sale countdown
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const target = new Date(settings?.flash_sale_end || '2026-12-31T23:59:59');
    const timer = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0 });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    }, 1000);
    return () => clearInterval(timer);
  }, [settings]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/13006909/pexels-photo-13006909.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920"
            alt="Fashion"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 border border-orange-500/30 px-3 py-1 mb-6">
              <Zap size={14} className="text-orange-400" />
              <span className="text-xs font-semibold text-orange-300">
                Fast Delivery in Mysuru
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Fashion. Fast.
              <br />
              <span className="text-orange-500">Delivered.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              Shop clothes, shoes & accessories from URANGADI — your local
              fashion marketplace in Mysuru.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/category/men')}
                className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all hover:scale-105 shadow-lg"
              >
                SHOP MEN
              </button>
              <button
                onClick={() => navigate('/category/women')}
                className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
              >
                SHOP WOMEN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                src={cat.image_url || ''}
                alt={cat.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      {flashSale.length > 0 && (
        <section className="bg-gradient-to-r from-red-50 to-orange-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Zap size={24} className="text-red-500 fill-red-500" />
                <h2 className="text-2xl font-bold text-gray-900">Flash Sale</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Ends in:</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white text-sm font-bold">
                    {String(timeLeft.h).padStart(2, '0')}
                  </span>
                  <span className="text-gray-900 font-bold">:</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white text-sm font-bold">
                    {String(timeLeft.m).padStart(2, '0')}
                  </span>
                  <span className="text-gray-900 font-bold">:</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white text-sm font-bold">
                    {String(timeLeft.s).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : flashSale.slice(0, 4).map((p) => (
                    <div key={p.id} className="relative">
                      <ProductCard product={p} />
                      {p.flash_sale_stock > 0 && p.flash_sale_stock <= 10 && (
                        <div className="absolute top-12 left-2 z-10">
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Only {p.flash_sale_stock} left
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={22} className="text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          </div>
          <Link
            to="/category/new-arrivals"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : newArrivals.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* Men's Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Men's Collection</h2>
          <Link
            to="/category/men"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : menProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* Women's Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Women's Collection
          </h2>
          <Link
            to="/category/women"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : womenProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* Shoes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shoes</h2>
          <Link
            to="/category/shoes"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : shoesProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* Accessories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Accessories</h2>
          <Link
            to="/category/accessories"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : accessories.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star size={22} className="text-orange-500 fill-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
          </div>
          <Link
            to="/search?q=bestseller"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : bestSellers.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </div>
      </section>

      {/* Offers Section */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <Tag size={24} className="text-orange-500" />
              <h2 className="text-2xl font-bold text-white">Today's Deals</h2>
            </div>
            <p className="mt-2 text-gray-400">Up to 50% Off</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
              <p className="text-3xl font-extrabold text-orange-500">₹100 OFF</p>
              <p className="mt-2 text-sm text-gray-300">
                On orders above ₹999
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Use code: <span className="font-mono font-bold text-orange-400">WELCOME100</span>
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
              <p className="text-3xl font-extrabold text-orange-500">20% OFF</p>
              <p className="mt-2 text-sm text-gray-300">Selected fashion</p>
              <p className="mt-2 text-xs text-gray-500">
                Use code: <span className="font-mono font-bold text-orange-400">FASHION20</span>
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
              <p className="text-3xl font-extrabold text-orange-500">
                FREE DELIVERY
              </p>
              <p className="mt-2 text-sm text-gray-300">On orders above ₹999</p>
              <p className="mt-2 text-xs text-gray-500">
                Use code: <span className="font-mono font-bold text-orange-400">FREESHIP</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why URANGADI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Why URANGADI</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Zap,
              title: 'FAST',
              desc: 'Quick local delivery',
              color: 'text-orange-500 bg-orange-50',
            },
            {
              icon: Shirt,
              title: 'FASHION',
              desc: 'Latest everyday styles',
              color: 'text-gray-900 bg-gray-100',
            },
            {
              icon: Tag,
              title: 'VALUE',
              desc: 'Affordable prices',
              color: 'text-green-600 bg-green-50',
            },
            {
              icon: MapPin,
              title: 'MYSURU',
              desc: 'Local delivery made easy',
              color: 'text-blue-600 bg-blue-50',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-100 p-6 text-center hover:shadow-md transition-shadow"
            >
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
              >
                <item.icon size={24} />
              </div>
              <h3 className="mt-4 text-sm font-bold text-gray-900 uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mysuru Delivery Section */}
      <section className="bg-gradient-to-br from-orange-50 to-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 mb-4">
              <MapPin size={14} className="text-orange-600" />
              <span className="text-xs font-semibold text-orange-700">
                Mysuru, We've Got You Covered
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              URANGADI is Now in Mysuru
            </h2>
            <p className="mt-3 text-gray-600">
              Your Fashion. Your City. Your Delivery. URANGADI currently delivers
              fashion and lifestyle products across Mysuru. We're starting local
              and growing fast.
            </p>
            <button
              onClick={() => navigate('/service-area')}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Truck size={18} />
              Check Your Delivery Area
            </button>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            What Mysuru Says About Us
          </h2>
          <p className="mt-1 text-sm text-gray-500">Demo reviews for display</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Rahul',
              city: 'Mysuru',
              rating: 5,
              text: 'Loved the quality and the delivery was really quick!',
            },
            {
              name: 'Ananya',
              city: 'Mysuru',
              rating: 5,
              text: 'Finally a fashion store with easy local delivery.',
            },
            {
              name: 'Ganesh',
              city: 'Mysuru',
              rating: 5,
              text: 'Super fast delivery and great products. URANGADI is my go-to now.',
            },
          ].map((review, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={16}
                    className="fill-orange-400 text-orange-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed">"{review.text}"</p>
              <p className="mt-4 text-sm font-semibold text-gray-900">
                — {review.name}, {review.city}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram-style Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <Instagram size={22} className="text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">@urangadi</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Tag us to get featured
          </p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            'https://images.pexels.com/photos/11805134/pexels-photo-11805134.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
            'https://images.pexels.com/photos/12660566/pexels-photo-12660566.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
            'https://images.pexels.com/photos/8979071/pexels-photo-8979071.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
            'https://images.pexels.com/photos/3380158/pexels-photo-3380158.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
            'https://images.pexels.com/photos/13643931/pexels-photo-13643931.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
            'https://images.pexels.com/photos/2381613/pexels-photo-2381613.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
          ].map((url, i) => (
            <div
              key={i}
              className="aspect-square overflow-hidden rounded-lg bg-gray-100 group cursor-pointer"
            >
              <img
                src={url}
                alt="Instagram"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter / WhatsApp CTA */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            Stay in Style with URANGADI
          </h2>
          <p className="mt-2 text-gray-400">
            Get the latest drops, exclusive offers, and fashion updates.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 text-sm text-white bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-orange-400 placeholder:text-gray-500"
            />
            <button className="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors whitespace-nowrap">
              SUBSCRIBE
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Clock size={16} className="text-orange-500" />
            <span>Fashion delivered fast across Mysuru</span>
          </div>
        </div>
      </section>
    </div>
  );
}
