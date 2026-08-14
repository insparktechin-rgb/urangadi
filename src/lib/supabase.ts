import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim() || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

const validUrl = supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co';

let client: ReturnType<typeof createClient>;
try {
  client = createClient(validUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} catch (e) {
  console.warn('Supabase client initialization failed, falling back to dummy client:', e);
  client = {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      eq: function() { return this; },
      order: function() { return this; },
      single: function() { return Promise.resolve({ data: null, error: new Error('Supabase not configured') }); },
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
    },
  } as unknown as ReturnType<typeof createClient>;
}

export const supabase = client;
