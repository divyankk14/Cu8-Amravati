import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../lib/api';

const tierClass = { gold: 'tier-gold', silver: 'tier-silver', bronze: 'tier-bronze' };
const medal = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchLeaderboard(10)
      .then((d) => alive && setPlayers(d))
      .catch(() => alive && setPlayers([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="leaderboard" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="chip text-accent border-accent/30">🏆 Hall of Fame</span>
          <h2 className="section-title mt-3">Leaderboard</h2>
          <p className="section-sub mt-2">
            Top 10 cue artists ranked by hours played at CUE8.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="card text-center py-10 text-textmuted">No players yet — be the first!</div>
      ) : (
        <div className="grid gap-2">
          {players.map((p, i) => (
            <div
              key={p.id}
              className={`group flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 rounded-xl border transition-all ${
                i < 3
                  ? 'bg-gradient-to-r from-card to-cardalt border-accent/30 hover:border-accent/60'
                  : 'bg-card border-border hover:border-primary/40'
              }`}
              style={{ animation: `slideUp 0.4s ${i * 50}ms both` }}
            >
              <div className="w-10 md:w-12 text-center">
                {i < 3 ? (
                  <div className="text-2xl md:text-3xl">{medal[i]}</div>
                ) : (
                  <div className="font-display text-2xl text-textmuted">#{i + 1}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{p.player_name}</div>
                <div className="text-xs text-textmuted">{p.hours_played} hrs played</div>
              </div>
              <div className={`badge ${tierClass[p.tier] || 'bg-cardalt'}`}>{p.tier}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
