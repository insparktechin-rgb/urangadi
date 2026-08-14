import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export function WishlistPage() {
  const { navigate } = useRouter();
  const { wishlist, removeFromWishlist, addToCart } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 mb-6">
            <Heart size={36} className="text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Save the styles you love.
          </h1>
          <p className="mt-2 text-gray-500">
            Your wishlist is empty. Start adding your favorite pieces!
          </p>
          <button
            onClick={() => navigate('/category/men')}
            className="mt-6 px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
          >
            START SHOPPING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Your Wishlist ({wishlist.length})
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {wishlist.map((item) => (
          <div key={item.product_id} className="relative">
            <Link to={`/product/${item.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={item.image_url}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(item.product_id);
                  }}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm text-red-500 hover:scale-110 transition-transform"
                  aria-label="Remove from wishlist"
                >
                  <Heart size={16} className="fill-red-500" />
                </button>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm font-bold text-gray-900">
                    {formatINR(item.price)}
                  </span>
                  {item.mrp > item.price && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatINR(item.mrp)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            <button
              onClick={() => {
                addToCart({
                  product_id: item.product_id,
                  name: item.name,
                  slug: item.slug,
                  price: item.price,
                  image_url: item.image_url,
                  color: '',
                  size: '',
                  quantity: 1,
                  stock: 99,
                });
                removeFromWishlist(item.product_id);
              }}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg bg-gray-900 text-white hover:bg-orange-500 transition-colors"
            >
              <ShoppingBag size={14} />
              MOVE TO CART
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
