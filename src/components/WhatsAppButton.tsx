import { MessageCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState } from 'react';

export function WhatsAppButton() {
  const { settings } = useStore();
  const [expanded, setExpanded] = useState(false);

  const whatsappNumber = settings?.whatsapp_number || '918000000000';
  const message = encodeURIComponent(
    'Hi URANGADI, I need help with my order.',
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-40 flex flex-col items-end gap-2">
      {expanded && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 max-w-[240px] animate-[fadeIn_0.2s_ease-out]">
          <p className="text-sm font-semibold text-gray-900">
            Need Help? Chat with URANGADI
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Our team is here to help with orders, returns, and more.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full text-center px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors"
          >
            Start Chat
          </a>
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-105"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}
