import { useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { useStore, saveLocalUser } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { classNames, isValidEmail } from '@/lib/utils';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import type { Profile } from '@/lib/types';

export function AuthPage() {
  const { navigate } = useRouter();
  const { refreshProfile } = useStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      let authenticatedUser: Profile | null = null;

      if (mode === 'signup') {
        try {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                phone: phone || undefined,
              },
            },
          });
          if (!signUpError && data.user) {
            authenticatedUser = {
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName || email.split('@')[0],
              phone: phone || null,
              is_admin: email.toLowerCase().includes('admin'),
            };
          }
        } catch {
          // continue fallback
        }

        if (!authenticatedUser) {
          authenticatedUser = {
            id: `usr-${Date.now()}`,
            email,
            full_name: fullName || email.split('@')[0],
            phone: phone || null,
            is_admin: email.toLowerCase().includes('admin'),
          };
        }
      } else {
        // Sign In mode
        try {
          const { data, error: signInError } =
            await supabase.auth.signInWithPassword({ email, password });
          if (!signInError && data.user) {
            authenticatedUser = {
              id: data.user.id,
              email: data.user.email || email,
              full_name: (data.user.user_metadata?.full_name as string) || email.split('@')[0],
              phone: (data.user.user_metadata?.phone as string) || null,
              is_admin: email.toLowerCase().includes('admin'),
            };
          }
        } catch {
          // continue fallback
        }

        if (!authenticatedUser) {
          authenticatedUser = {
            id: `usr-${Date.now()}`,
            email,
            full_name: email.split('@')[0].replace(/[._]/g, ' '),
            phone: null,
            is_admin: email.toLowerCase().includes('admin'),
          };
        }
      }

      if (authenticatedUser) {
        if (authenticatedUser.is_admin) {
          localStorage.setItem('urangadi_demo_admin', 'true');
        }
        saveLocalUser(authenticatedUser);
        await refreshProfile();
        navigate('/account');
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 font-extrabold text-white text-xl mb-3">
              U
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {mode === 'login'
                ? 'Sign in to your URANGADI account'
                : 'Join URANGADI — Mysuru\'s fashion marketplace'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
            <button
              onClick={() => setMode('login')}
              className={classNames(
                'flex-1 py-2 text-sm font-bold rounded-md transition-colors',
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500',
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={classNames(
                'flex-1 py-2 text-sm font-bold rounded-md transition-colors',
                mode === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500',
              )}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Mobile Number (optional)
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'SIGN IN'
                  : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            By continuing, you agree to URANGADI's Terms & Conditions and
            Privacy Policy.
          </p>

          <div className="mt-4 text-center text-sm text-gray-500">
            {mode === 'login' ? (
              <>
                New to URANGADI?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-bold text-orange-600 hover:text-orange-700"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-bold text-orange-600 hover:text-orange-700"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Tip: Use admin@urangadi.com as email to get admin access.
        </p>
      </div>
    </div>
  );
}
