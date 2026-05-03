import { useEffect, useMemo, useState } from 'react';
import { fetchTables, fetchBookings, isTableBusyNow } from '../lib/api';
import { todayISO } from '../lib/format';
import { formatPrice, tableTypeLabel } from '../lib/format';

export default function TablesGrid({ onBook, refreshKey = 0 }) {
  const [tables, setTables] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([fetchTables(), fetchBookings({ date: todayISO() })])
      .then(([t, b]) => {
        if (!alive) return;
        setTables(t);
        setTodayBookings(b);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  // tick every minute so "busy now" stays accurate
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(i);
  }, []);

  const groups = useMemo(() => {
    const mini = tables.filter((t) => t.type === 'mini_snooker');
    const pool = tables.filter((t) => t.type === 'pool');
    return [
      { key: 'mini_snooker', icon: '🟡', label: 'Mini Snooker', items: mini },
      { key: 'pool', icon: '🎱', label: 'Pool', items: pool },
    ];
  }, [tables]);

  return (
    <section id="tables" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="chip text-primaryLight border-primary/30">🎯 Live Status</span>
          <h2 className="section-title mt-3">Table Availability</h2>
          <p className="section-sub mt-2">
            Real-time table status. Tap any table to book a slot — even if busy right now.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{g.icon}</span>
                <h3 className="font-display text-2xl tracking-wide text-white">{g.label}</h3>
                <span className="text-xs text-textmuted">({g.items.length})</span>
              </div>
              {g.items.length === 0 ? (
                <div className="text-textmuted text-sm">No tables in this category yet.</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {g.items.map((t) => {
                    const busy = !t.is_available || isTableBusyNow(todayBookings, t.id, now);
                    return (
                      <div
                        key={t.id}
                        className={`relative card overflow-hidden ${busy ? 'border-red-900/40' : 'hover:shadow-glow'}`}
                      >
                        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="font-display text-3xl tracking-wider text-white leading-none">
                              {t.name}
                            </div>
                            <div className="text-xs text-textmuted mt-1 uppercase tracking-wider">
                              {tableTypeLabel(t.type)}
                            </div>
                          </div>
                          <StatusPill busy={busy} />
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="font-display text-3xl text-accent leading-none">
                              {formatPrice(t.price_per_hour)}
                            </div>
                            <div className="text-[11px] text-textmuted uppercase tracking-wider mt-1">per hour</div>
                          </div>
                          <button
                            onClick={() => onBook(t)}
                            className={busy ? 'btn-ghost text-xs' : 'btn-primary text-xs'}
                          >
                            {busy ? 'Book future slot' : 'Book now'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusPill({ busy }) {
  if (busy) {
    return (
      <span className="badge bg-red-500/15 text-red-400 border border-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Busy
      </span>
    );
  }
  return (
    <span className="badge bg-primary/15 text-primaryLight border border-primary/30">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Available
    </span>
  );
}
