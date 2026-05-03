import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingsPanel from '../components/admin/BookingsPanel';
import TablesPanel from '../components/admin/TablesPanel';
import LeaderboardPanel from '../components/admin/LeaderboardPanel';
import SettingsPanel from '../components/admin/SettingsPanel';
import { SUPABASE_CONFIGURED } from '../lib/supabaseClient';

const TABS = [
  { id: 'bookings', label: 'Bookings', icon: '📅' },
  { id: 'tables', label: 'Tables', icon: '🎱' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState('bookings');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full eight-ball flex items-center justify-center text-accent font-display text-xl shadow-glow">
              8
            </div>
            <div className="leading-none">
              <div className="font-display text-2xl tracking-wider text-white">CUE8</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-textmuted -mt-0.5">
                Admin Console
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs text-textmuted">Signed in</div>
              <div className="text-sm text-white truncate max-w-[180px]">{user?.email}</div>
            </div>
            <button onClick={signOut} className="btn-ghost text-xs px-3 py-2">
              Sign out
            </button>
          </div>
        </div>
        <nav className="border-t border-border bg-bg">
          <div className="max-w-7xl mx-auto px-2 md:px-4 flex overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 md:px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-primary text-white'
                    : 'border-transparent text-textmuted hover:text-white'
                }`}
              >
                <span className="mr-1.5">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {!SUPABASE_CONFIGURED && (
        <div className="bg-accent/10 border-b border-accent/30 text-accent text-center text-xs py-2 px-3">
          Demo mode — changes are stored in memory only and reset on reload.
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        {tab === 'bookings' && <BookingsPanel />}
        {tab === 'tables' && <TablesPanel />}
        {tab === 'leaderboard' && <LeaderboardPanel />}
        {tab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}
