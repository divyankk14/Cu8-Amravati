import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Detect missing config and switch to demo/mock mode so the UI still works
// during local preview without a Supabase project.
export const SUPABASE_CONFIGURED = Boolean(url && key);

export const supabase = SUPABASE_CONFIGURED
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

if (!SUPABASE_CONFIGURED && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn(
    '[CUE8] Supabase not configured — running in demo mode. ' +
      'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to connect.'
  );
}
