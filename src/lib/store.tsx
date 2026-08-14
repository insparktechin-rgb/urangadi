import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type {
  CartItem,
  WishlistItem,
  Profile,
  Settings,
  Coupon,
} from '@/lib/types';
import { generateOrderNumber } from '@/lib/utils';

interface StoreContextValue {
  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateQuantity: (
    productId: string,
    color: string,
    size: string,
    quantity: number,
  ) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  // Auth
  user: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Settings
  settings: Settings | null;
  // Coupon
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon | null) => void;
  // Location
  deliveryPincode: string | null;
  setDeliveryPincode: (pincode: string | null) => void;
  // Order number for checkout
  pendingOrderNumber: string;
  generateNewOrderNumber: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const CART_KEY = 'urangadi_cart';
const WISHLIST_KEY = 'urangadi_wishlist';
const PINCODE_KEY = 'urangadi_pincode';
const USER_KEY = 'urangadi_user';

export function getLocalUser(): Profile | null {
  try {
    const data = localStorage.getItem(USER_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }
  return null;
}

export function saveLocalUser(user: Profile | null) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    window.dispatchEvent(new Event('urangadi_auth_updated'));
  } catch (e) {
    console.error('Failed to save local user', e);
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [user, setUser] = useState<Profile | null>(getLocalUser());
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [deliveryPincode, setDeliveryPincodeState] = useState<string | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string>(
    generateOrderNumber(),
  );

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedWishlist = localStorage.getItem(WISHLIST_KEY);
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      const savedPincode = localStorage.getItem(PINCODE_KEY);
      if (savedPincode) setDeliveryPincodeState(savedPincode);
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase.from('settings').select('key, value');
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((s) => {
            map[s.key] = s.value;
          });
          setSettings({
            free_delivery_threshold: parseInt(
              map.free_delivery_threshold || '0',
            ),
            default_delivery_fee: parseInt(map.default_delivery_fee || '0'),
            whatsapp_number: map.whatsapp_number || '918000000000',
            admin_email: map.admin_email || 'admin@urangadi.com',
            flash_sale_end: map.flash_sale_end || '2026-12-31T23:59:59',
          });
          return;
        }
      } catch {
        // continue fallback
      }

      setSettings({
        free_delivery_threshold: 0,
        default_delivery_fee: 0,
        whatsapp_number: '918000000000',
        admin_email: 'admin@urangadi.com',
        flash_sale_end: '2026-12-31T23:59:59',
      });
    };
    loadSettings();
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        if (profile) {
          setUser(profile as Profile);
          saveLocalUser(profile as Profile);
          return;
        }
      }
    } catch {
      // continue fallback
    }

    const localUser = getLocalUser();
    if (localUser) {
      setUser(localUser);
    } else {
      setUser(null);
    }
  }, []);

  // Auth: check session on mount
  useEffect(() => {
    const initAuth = async () => {
      await refreshProfile();
      setLoading(false);
    };
    initAuth();

    const handleAuthUpdate = () => {
      refreshProfile();
    };
    window.addEventListener('urangadi_auth_updated', handleAuthUpdate);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          await refreshProfile();
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('urangadi_auth_updated', handleAuthUpdate);
    };
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    saveLocalUser(null);
    localStorage.removeItem('urangadi_demo_admin');
    setUser(null);
  }, []);

  // Cart operations
  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) =>
          c.product_id === item.product_id &&
          c.color === item.color &&
          c.size === item.size,
      );
      if (existing) {
        return prev.map((c) =>
          c.product_id === item.product_id &&
          c.color === item.color &&
          c.size === item.size
            ? { ...c, quantity: Math.min(c.quantity + item.quantity, c.stock) }
            : c,
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback(
    (productId: string, color: string, size: string) => {
      setCart((prev) =>
        prev.filter(
          (c) =>
            !(c.product_id === productId && c.color === color && c.size === size),
        ),
      );
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, color: string, size: string, quantity: number) => {
      setCart((prev) =>
        prev.map((c) => {
          if (
            c.product_id === productId &&
            c.color === color &&
            c.size === size
          ) {
            return {
              ...c,
              quantity: Math.max(1, Math.min(quantity, c.stock)),
            };
          }
          return c;
        }),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setCart([]), []);

  // Wishlist operations
  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.some((w) => w.product_id === item.product_id);
      if (exists) {
        return prev.filter((w) => w.product_id !== item.product_id);
      }
      return [...prev, item];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((w) => w.product_id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((w) => w.product_id === productId),
    [wishlist],
  );

  // Coupon
  const applyCoupon = useCallback((coupon: Coupon | null) => {
    setAppliedCoupon(coupon);
  }, []);

  // Location
  const setDeliveryPincode = useCallback((pincode: string | null) => {
    setDeliveryPincodeState(pincode);
    if (pincode) {
      localStorage.setItem(PINCODE_KEY, pincode);
    } else {
      localStorage.removeItem(PINCODE_KEY);
    }
  }, []);

  const generateNewOrderNumber = useCallback(() => {
    setPendingOrderNumber(generateOrderNumber());
  }, []);

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartSubtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const value: StoreContextValue = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    wishlist,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
    user,
    loading,
    signOut,
    refreshProfile,
    settings,
    appliedCoupon,
    applyCoupon,
    deliveryPincode,
    setDeliveryPincode,
    pendingOrderNumber,
    generateNewOrderNumber,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
