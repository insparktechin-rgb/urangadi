import { Home, LayoutGrid, Search, Heart, ShoppingBag } from 'lucide-react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import { classNames } from '@/lib/utils';

export function BottomNav() {
  const { path, navigate } = useRouter();
  const { cartCount, wishlist } = useStore();

  const items = [
    { icon: Home, label: 'Home', to: '/' },
    { icon: LayoutGrid, label: 'Categories', to: '/category/men' },
    { icon: Search, label: 'Search', to: '/search' },
    {
      icon: Heart,
      label: 'Wishlist',
      to: '/wishlist',
      badge: wishlist.length,
    },
    {
      icon: ShoppingBag,
      label: 'Cart',
      to: '/cart',
      badge: cartCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = path === item.to;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={classNames(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors',
                isActive ? 'text-orange-600' : 'text-gray-500',
              )}
            >
              <div className="relative">
                <item.icon size={22} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
