import { MessageCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState } from 'react';

export function WhatsAppButton() {
  const { settings } = useStore();
  const [expanded, setExpanded] = useState(false);

  const whatsappNumber = settings?.whatsapp_number || '917975539512';
  const message = encodeURIComponent(
    'Hi URANGADI, I need help with my order.',
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-40 flex flex-col items-end gap-2">
      {expanded && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-[260px] animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-bold text-gray-900">
              Need Help? Chat with Us
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Our Mysuru support team is online to assist with orders and styling.
          </p>
          <div className="mt-2.5 px-2.5 py-1.5 bg-green-50/80 border border-green-200/60 rounded-lg flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">WhatsApp:</span>
            <span className="font-bold text-green-700 font-mono">+91 79755 39512</span>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 w-full text-center px-4 py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 shadow-md shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <MessageCircle size={16} />
            Start Chat (+91 79 7553 9512)
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
