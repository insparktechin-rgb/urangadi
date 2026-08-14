import { useEffect, useState } from 'react';
import { RouterProvider, useRouter } from '@/lib/router';
import { StoreProvider } from '@/lib/store';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BottomNav } from '@/components/BottomNav';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { HomePage } from '@/pages/HomePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage';
import { TrackOrderPage } from '@/pages/TrackOrderPage';
import { SearchPage } from '@/pages/SearchPage';
import { AuthPage } from '@/pages/AuthPage';
import { AccountPage } from '@/pages/AccountPage';
import { ServiceAreaPage } from '@/pages/ServiceAreaPage';
import { AdminPage } from '@/pages/AdminPage';
import { StaticPage } from '@/pages/StaticPage';
import { getCategories } from '@/lib/api';
import type { Category } from '@/lib/types';

function AppContent() {
  const { path } = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Parse route
  const renderPage = () => {
    if (path === '/' || path === '') return <HomePage />;

    if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '');
      return <CategoryPage slug={slug} />;
    }

    if (path.startsWith('/product/')) {
      const slug = path.replace('/product/', '');
      return <ProductPage slug={slug} />;
    }

    if (path === '/cart') return <CartPage />;
    if (path === '/wishlist') return <WishlistPage />;
    if (path === '/checkout') return <CheckoutPage />;

    if (path.startsWith('/order/')) {
      const orderNumber = path.replace('/order/', '');
      return <OrderConfirmationPage orderNumber={orderNumber} />;
    }

    if (path.startsWith('/track-order')) {
      const url = new URL(path, window.location.origin);
      const id = url.searchParams.get('id') || undefined;
      return <TrackOrderPage orderId={id} />;
    }

    if (path.startsWith('/search')) {
      const url = new URL(path, window.location.origin);
      const q = url.searchParams.get('q') || '';
      return <SearchPage query={q} />;
    }

    if (path === '/auth') return <AuthPage />;
    if (path === '/account') return <AccountPage />;
    if (path === '/service-area') return <ServiceAreaPage />;
    if (path === '/admin') return <AdminPage />;

    // Static pages
    if (path.startsWith('/help/')) {
      const slug = path.replace('/help/', '');
      return <StaticPage slug={slug} />;
    }
    if (['/about', '/careers', '/privacy', '/terms'].includes(path)) {
      return <StaticPage slug={path.replace('/', '')} />;
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-500">
          The page you're looking for doesn't exist.
        </p>
      </div>
    );
  };

  // Don't show header/footer on admin page
  const isAdmin = path === '/admin';

  if (isAdmin) {
    return <div className="min-h-screen">{renderPage()}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header categories={categories} />
      <main className="flex-1 pb-20 lg:pb-0">{renderPage()}</main>
      <Footer />
      <BottomNav />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </RouterProvider>
  );
}
