import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { SUPABASE_CONFIGURED } from '../lib/supabaseClient';

export default function AdminLogin() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    nav('/admin', { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[140px]" />
      </div>

      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-6 group">
          <div className="w-10 h-10 rounded-full eight-ball flex items-center justify-center text-accent font-display text-xl shadow-glow">
            8
          </div>
          <div className="leading-none">
            <div className="font-display text-2xl tracking-wider text-white">CUE8</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-textmuted -mt-0.5">Admin Console</div>
          </div>
        </Link>

        <div className="card animate-slide-up">
          <h1 className="font-display text-3xl tracking-wide text-white">Welcome back</h1>
          <p className="text-textmuted text-sm mt-1 mb-6">Sign in to manage bookings and tables.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="admin@cue8.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {!SUPABASE_CONFIGURED && (
            <div className="mt-5 rounded-xl bg-accent/10 border border-accent/30 px-4 py-3 text-xs text-accent">
              <div className="font-semibold mb-1">Demo credentials</div>
              <div className="font-mono text-[11px]">
                {DEMO_CREDENTIALS.email}<br />
                {DEMO_CREDENTIALS.password}
              </div>
            </div>
          )}

          <Link to="/" className="block text-center text-xs text-textmuted hover:text-primaryLight mt-5">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
