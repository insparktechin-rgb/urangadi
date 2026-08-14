export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

export function generateOrderNumber(): string {
  const prefix = 'URG';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function classNames(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ''));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getProductImageUrl(
  product: any,
  fallback = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop',
): string {
  if (!product) return fallback;

  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (first && typeof first === 'object' && first.image_url) return first.image_url;
  }

  if (product.image_url && typeof product.image_url === 'string') {
    return product.image_url;
  }

  return fallback;
}

export function getAllProductImages(product: any): string[] {
  if (!product) return [];
  const list: string[] = [];

  if (Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      if (typeof img === 'string' && img.trim()) list.push(img.trim());
      else if (img && typeof img === 'object' && img.image_url) list.push(img.image_url);
    });
  }

  if (list.length === 0 && product.image_url) {
    list.push(product.image_url);
  }

  return list.length > 0
    ? list
    : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop'];
}
