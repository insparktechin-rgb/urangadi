import { Link } from '@/lib/router';
import { ChevronRight } from 'lucide-react';

export function StaticPage({ slug }: { slug: string }) {
  const content = getContent(slug);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        <Link to="/" className="hover:text-orange-600">
          Home
        </Link>
        <ChevronRight size={12} />
        <span className="text-gray-900 font-medium">{content.title}</span>
      </nav>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
        {content.body}
      </div>
    </div>
  );
}

function getContent(slug: string): { title: string; body: React.ReactNode } {
  switch (slug) {
    case 'about':
      return {
        title: 'About URANGADI',
        body: (
          <>
            <p>
              URANGADI is Mysuru's quick-commerce fashion and lifestyle
              marketplace. We bring you the latest everyday styles — clothes,
              shoes, and accessories — delivered fast across Mysuru.
            </p>
            <p className="mt-4">
              We're young, fast, stylish, and local. Our mission is to make
              fashion shopping effortless for Mysuru residents — browse, order,
              and get your style delivered to your doorstep.
            </p>
            <p className="mt-4">
              Currently serving Mysuru only, with plans to expand to more
              Karnataka cities soon. Stay tuned!
            </p>
          </>
        ),
      };
    case 'careers':
      return {
        title: 'Careers at URANGADI',
        body: (
          <>
            <p>
              We're always looking for passionate people to join URANGADI. If
              you love fashion, technology, and building something for your
              city, we'd love to hear from you.
            </p>
            <p className="mt-4">
              Send your resume to careers@urangadi.com with the role you're
              interested in.
            </p>
          </>
        ),
      };
    case 'privacy':
      return {
        title: 'Privacy Policy',
        body: (
          <>
            <p>
              URANGADI respects your privacy. We collect only the information
              necessary to process your orders and provide you with the best
              shopping experience.
            </p>
            <p className="mt-4">
              We never share your personal data with third parties without your
              consent. Your data is stored securely and used only for order
              processing, delivery, and communication.
            </p>
          </>
        ),
      };
    case 'terms':
      return {
        title: 'Terms & Conditions',
        body: (
          <>
            <p>
              By using URANGADI, you agree to our terms of service. All orders
              are subject to availability and delivery within our service area
              (currently Mysuru only).
            </p>
            <p className="mt-4">
              Prices are inclusive of all taxes. We reserve the right to cancel
              orders that cannot be fulfilled. Returns are accepted within 7
              days for unused products with original tags.
            </p>
          </>
        ),
      };
    case 'contact':
      return {
        title: 'Contact Us',
        body: (
          <>
            <p>
              Need help? We're here for you. Reach out through any of these
              channels:
            </p>
            <ul className="mt-4 space-y-2">
              <li>WhatsApp: Chat with us via the floating button</li>
              <li>Email: support@urangadi.com</li>
              <li>Service Area: Mysuru only</li>
            </ul>
          </>
        ),
      };
    case 'faq':
      return {
        title: 'Frequently Asked Questions',
        body: (
          <>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900">
                  Which cities do you deliver to?
                </h3>
                <p className="mt-1">
                  Currently, URANGADI delivers only in Mysuru. We're expanding
                  soon to more cities.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  How fast is the delivery?
                </h3>
                <p className="mt-1">
                  Fast delivery is available across Mysuru. Exact delivery time
                  is confirmed after order placement.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  What is the return policy?
                </h3>
                <p className="mt-1">
                  7-day easy returns and exchanges. Products must be unused with
                  original tags intact.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Is there free delivery?
                </h3>
                <p className="mt-1">
                  Yes! Orders above ₹999 get free delivery. Use coupon code
                  FREESHIP for free delivery on any order.
                </p>
              </div>
            </div>
          </>
        ),
      };
    case 'shipping':
      return {
        title: 'Shipping Policy',
        body: (
          <>
            <p>
              URANGADI delivers across Mysuru. Standard delivery charge is ₹49,
              and orders above ₹999 qualify for free delivery.
            </p>
            <p className="mt-4">
              Fast delivery is available for all orders within the Mysuru
              service area.
            </p>
          </>
        ),
      };
    case 'returns':
      return {
        title: 'Returns & Exchange',
        body: (
          <>
            <p>
              We offer 7-day easy returns and exchanges. Products must be
              unused, unwashed, and have all original tags intact.
            </p>
            <p className="mt-4">
              To initiate a return, contact us via WhatsApp or email with your
              order number.
            </p>
          </>
        ),
      };
    case 'exchange':
      return {
        title: 'Exchange Policy',
        body: (
          <>
            <p>
              Need a different size or color? We offer exchanges within 7 days
              of delivery. The product must be unused with original tags.
            </p>
            <p className="mt-4">
              Contact us via WhatsApp to initiate an exchange.
            </p>
          </>
        ),
      };
    default:
      return {
        title: 'Page Not Found',
        body: <p>The page you're looking for doesn't exist.</p>,
      };
  }
}
