import { useState } from 'react';
import { Heart, Star, Plus } from 'lucide-react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import { formatINR, classNames, getProductImageUrl, getAllProductImages } from '@/lib/utils';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const { navigate } = useRouter();
  const { toggleWishlist, isInWishlist, addToCart } = useStore();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const primaryImage = getProductImageUrl(product);
  const allImages = getAllProductImages(product);
  const secondaryImage = allImages[1] || primaryImage;
  const wished = isInWishlist(product.id);

  const discount = product.discount_pct;
  const inStock =
    (product.variants || []).filter((v) => v.stock > 0).length > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variants = product.variants || [];
    const available = variants.find((v) => v.stock > 0);
    if (!available) return;
    addToCart({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: primaryImage,
      color: available.color,
      size: available.size,
      quantity: 1,
      stock: available.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: primaryImage,
      mrp: product.mrp,
    });
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
        <img
          src={hovered ? secondaryImage : primaryImage}
          alt={product.name}
          loading="lazy"
          className={classNames(
            'h-full w-full object-cover transition-all duration-500',
            hovered ? 'scale-105' : 'scale-100',
          )}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              {discount}% OFF
            </span>
          )}
          {product.is_new && (
            <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              NEW
            </span>
          )}
          {product.is_flash_sale && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              FLASH
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={classNames(
            'absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm transition-all hover:scale-110',
            wished ? 'text-red-500' : 'text-gray-600',
          )}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={wished ? 'fill-red-500' : ''} />
        </button>

        {/* Quick Add */}
        {inStock && (
          <>
            <div
              className={classNames(
                'hidden lg:block absolute bottom-0 left-0 right-0 p-2 transition-all duration-300',
                hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
              )}
            >
              <button
                onClick={handleQuickAdd}
                className={classNames(
                  'flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors',
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-900 text-white hover:bg-orange-500',
                )}
              >
                <Plus size={14} />
                {added ? 'ADDED!' : 'QUICK ADD'}
              </button>
            </div>

            <button
              onClick={handleQuickAdd}
              className={classNames(
                'lg:hidden absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-transform active:scale-90',
                added ? 'bg-green-500 text-white' : 'bg-gray-900/90 text-white backdrop-blur-sm',
              )}
              aria-label="Quick add to cart"
            >
              <Plus size={16} />
            </button>
          </>
        )}

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          {product.brand}
        </p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="flex items-center gap-0.5">
            <Star size={12} className="fill-orange-400 text-orange-400" />
            <span className="text-xs font-medium text-gray-600">
              {product.rating}
            </span>
          </div>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-400">{product.review_count} reviews</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-sm font-bold text-gray-900">
            {formatINR(product.price)}
          </span>
          {product.mrp > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatINR(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-xl bg-gray-200" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
      </div>
    </div>
  );
}
