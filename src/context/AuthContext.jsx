import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabaseClient';

const AuthCtx = createContext(null);

const DEMO_ADMIN_EMAIL = 'admin@cue8.local';
const DEMO_ADMIN_PASSWORD = 'cue8admin';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub;
    (async () => {
      if (!SUPABASE_CONFIGURED) {
        // demo mode: read flag from localStorage
        const flag = localStorage.getItem('cue8_demo_admin');
        if (flag === '1') setUser({ email: DEMO_ADMIN_EMAIL, role: 'admin', demo: true });
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      unsub = sub.subscription;
    })();
    return () => unsub?.unsubscribe?.();
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!SUPABASE_CONFIGURED) {
      if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
        localStorage.setItem('cue8_demo_admin', '1');
        setUser({ email: DEMO_ADMIN_EMAIL, role: 'admin', demo: true });
        return { error: null };
      }
      return { error: new Error(`Demo login: use ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`) };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    setUser(data.user);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (!SUPABASE_CONFIGURED) {
      localStorage.removeItem('cue8_demo_admin');
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signOut, demoMode: !SUPABASE_CONFIGURED }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export const DEMO_CREDENTIALS = { email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD };
