import { useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useStore } from '@/lib/store';
import { checkPincodeDelivery, submitNotifyRequest } from '@/lib/api';
import { MapPin, Truck, Check, X, Bell } from 'lucide-react';
import { classNames, isValidPincode, isValidMobile } from '@/lib/utils';

export function ServiceAreaPage() {
  const { navigate } = useRouter();
  const { setDeliveryPincode } = useStore();
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<null | 'available' | 'unavailable'>(null);
  const [area, setArea] = useState('');
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyData, setNotifyData] = useState({
    name: '',
    mobile: '',
    city: '',
    pincode: '',
  });
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifyError, setNotifyError] = useState('');

  const checkPincode = async () => {
    if (!isValidPincode(pincode)) {
      setStatus('unavailable');
      setArea('');
      return;
    }
    try {
      const result = await checkPincodeDelivery(pincode);
      setStatus(result.available ? 'available' : 'unavailable');
      setArea(result.zone?.area || '');
      if (result.available) {
        setDeliveryPincode(pincode);
      } else {
        setNotifyData((prev) => ({ ...prev, pincode }));
        setShowNotifyForm(true);
      }
    } catch {
      setStatus('unavailable');
    }
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifyError('');
    if (!notifyData.name.trim()) {
      setNotifyError('Please enter your name');
      return;
    }
    if (!isValidMobile(notifyData.mobile)) {
      setNotifyError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!notifyData.city.trim()) {
      setNotifyError('Please enter your city');
      return;
    }
    if (!isValidPincode(notifyData.pincode)) {
      setNotifyError('Please enter a valid 6-digit pincode');
      return;
    }
    const { error } = await submitNotifyRequest(notifyData);
    if (error) {
      setNotifyError(error);
    } else {
      setNotifySubmitted(true);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 50%, #f97316 0%, transparent 50%)',
            }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 border border-orange-500/30 px-3 py-1 mb-4">
            <MapPin size={14} className="text-orange-400" />
            <span className="text-xs font-semibold text-orange-300">
              Mysuru Only
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            URANGADI is Now in{' '}
            <span className="text-orange-500">Mysuru</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Your Fashion. Your City. Your Delivery.
          </p>
          <p className="mt-2 text-sm text-gray-400 max-w-xl mx-auto">
            URANGADI currently delivers fashion and lifestyle products across
            Mysuru. We're starting local and growing fast.
          </p>
        </div>
      </section>

      {/* Check area */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={22} className="text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">
              Check Your Delivery Area
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Enter your pincode to see if URANGADI delivers to your location.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter your pincode"
              maxLength={6}
              className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              onKeyDown={(e) => e.key === 'Enter' && checkPincode()}
            />
            <button
              onClick={checkPincode}
              className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600"
            >
              CHECK
            </button>
          </div>

          {status === 'available' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <Check size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-bold text-green-700">
                  We deliver here!
                </p>
                {area && (
                  <p className="text-xs text-green-600">
                    {area}, Mysuru — {pincode}
                  </p>
                )}
              </div>
            </div>
          )}

          {status === 'unavailable' && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <X size={20} className="text-orange-600" />
                <p className="text-sm font-bold text-orange-700">
                  We're coming soon!
                </p>
              </div>
              <p className="mt-1 text-xs text-orange-600">
                URANGADI is currently available only in Mysuru. We're working
                hard to expand soon.
              </p>
            </div>
          )}
        </div>

        {/* Notify form */}
        {showNotifyForm && !notifySubmitted && (
          <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900">
                Notify Me When Available
              </h3>
            </div>
            <form onSubmit={handleNotifySubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={notifyData.name}
                  onChange={(e) =>
                    setNotifyData({ ...notifyData, name: e.target.value })
                  }
                  placeholder="Your Name"
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
                <input
                  type="tel"
                  value={notifyData.mobile}
                  onChange={(e) =>
                    setNotifyData({
                      ...notifyData,
                      mobile: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="Mobile Number"
                  maxLength={10}
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
                <input
                  type="text"
                  value={notifyData.city}
                  onChange={(e) =>
                    setNotifyData({ ...notifyData, city: e.target.value })
                  }
                  placeholder="Your City"
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
                <input
                  type="text"
                  value={notifyData.pincode}
                  onChange={(e) =>
                    setNotifyData({
                      ...notifyData,
                      pincode: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="Pincode"
                  maxLength={6}
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
              {notifyError && (
                <p className="text-sm text-red-500">{notifyError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800"
              >
                NOTIFY ME
              </button>
            </form>
          </div>
        )}

        {notifySubmitted && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
            <Check size={40} className="mx-auto text-green-500 mb-2" />
            <h3 className="text-lg font-bold text-green-800">
              You're on the list!
            </h3>
            <p className="mt-1 text-sm text-green-600">
              We'll notify you as soon as URANGADI launches in your city.
            </p>
          </div>
        )}
      </section>

      {/* Service areas */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Service Areas in Mysuru
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[
            'Vidyaranyapuram',
            'Kuvempunagar',
            'Gokulam',
            'Vijayanagar',
            'Jayalakshmipuram',
            'Saraswathipuram',
            'Hebbal',
            'Bogadi',
            'Rajiv Nagar',
            'Indira Nagar',
            'Siddartha Nagar',
            'Ramakrishnanagar',
            'N.R. Mohalla',
            'K.R. Mohalla',
            'Udayagiri',
            'Bannimantap',
          ].map((areaName) => (
            <div
              key={areaName}
              className="flex items-center gap-1.5 p-3 bg-white border border-gray-100 rounded-lg text-sm text-gray-700"
            >
              <MapPin size={14} className="text-orange-500 flex-shrink-0" />
              {areaName}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          And many more areas across Mysuru. Enter your pincode above to check.
        </p>
      </section>

      {/* Future expansion */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-50 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Coming Soon to More Cities
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            We're building URANGADI to serve more cities across Karnataka and
            eventually India. Stay tuned!
          </p>
          <p className="mt-3 text-xs text-gray-400">
            Future cities can be enabled from the admin dashboard without
            rebuilding the website.
          </p>
        </div>
      </section>
    </div>
  );
}
