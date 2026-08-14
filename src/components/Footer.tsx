import {
  Instagram,
  Facebook,
  Twitter,
  MapPin,
} from 'lucide-react';
import { Link } from '@/lib/router';
import { LogoWhite } from '@/components/Logo';

const SHOP_LINKS = [
  { label: 'Men', to: '/category/men' },
  { label: 'Women', to: '/category/women' },
  { label: 'Accessories', to: '/category/accessories' },
  { label: 'Shoes', to: '/category/shoes' },
  { label: 'Slippers', to: '/category/slippers' },
  { label: 'New Arrivals', to: '/category/new-arrivals' },
  { label: 'Offers', to: '/offers' },
];

const HELP_LINKS = [
  { label: 'Contact Us', to: '/help/contact' },
  { label: 'FAQ', to: '/help/faq' },
  { label: 'Shipping', to: '/help/shipping' },
  { label: 'Returns', to: '/help/returns' },
  { label: 'Exchange Policy', to: '/help/exchange' },
  { label: 'Order Tracking', to: '/track-order' },
];

const COMPANY_LINKS = [
  { label: 'About URANGADI', to: '/about' },
  { label: 'Careers', to: '/careers' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <LogoWhite />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              Mysuru's quick fashion marketplace. Your style, delivered locally.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
              <MapPin size={16} className="text-orange-500" />
              Currently serving Mysuru only
            </div>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-orange-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-orange-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-orange-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Shop
            </h4>
            <ul className="space-y-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Help
            </h4>
            <ul className="space-y-2">
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2026 URANGADI. All rights reserved. Fashion. Fast. Delivered.
          </p>
          <p className="text-xs text-gray-500">
            Made with care for Mysuru
          </p>
        </div>
      </div>
    </footer>
  );
}
