import { useEffect, useState } from 'react';
import { deletePlayer, fetchLeaderboard, upsertPlayer } from '../../lib/api';

const EMPTY = { player_name: '', hours_played: 0, tier: 'bronze' };
const tierClass = { gold: 'tier-gold', silver: 'tier-silver', bronze: 'tier-bronze' };

export default function LeaderboardPanel() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setPlayers(await fetchLeaderboard(50));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function startEdit(p) {
    setEditing(p);
    setForm({ player_name: p.player_name, hours_played: p.hours_played, tier: p.tier });
  }
  function startCreate() {
    setEditing({});
    setForm(EMPTY);
  }
  function cancel() {
    setEditing(null);
    setForm(EMPTY);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        player_name: form.player_name.trim(),
        hours_played: Number(form.hours_played),
        tier: form.tier,
      };
      if (editing && editing.id) payload.id = editing.id;
      await upsertPlayer(payload);
      await load();
      cancel();
    } finally {
      setSaving(false);
    }
  }

  async function remove(p) {
    if (!confirm(`Remove ${p.player_name} from leaderboard?`)) return;
    await deletePlayer(p.id);
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-3xl text-white tracking-wide">Leaderboard</h2>
          <p className="text-sm text-textmuted">Manually adjust player rankings, hours, and tiers.</p>
        </div>
        <button onClick={startCreate} className="btn-primary">
          + Add Player
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-10 text-center text-textmuted">Loading…</div>
        ) : players.length === 0 ? (
          <div className="p-10 text-center text-textmuted">No players yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cardalt text-left text-xs text-textmuted uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-12">#</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr key={p.id} className="border-t border-border hover:bg-cardalt/50">
                    <td className="px-4 py-3 font-display text-xl text-textmuted">{i + 1}</td>
                    <td className="px-4 py-3 text-white font-medium">{p.player_name}</td>
                    <td className="px-4 py-3 text-textmuted">{p.hours_played} hrs</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${tierClass[p.tier] || 'bg-cardalt'}`}>{p.tier}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={() => startEdit(p)} className="text-xs px-2.5 py-1.5 rounded-lg bg-cardalt border border-border hover:border-primary text-white">
                          Edit
                        </button>
                        <button onClick={() => remove(p)} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && cancel()}
        >
          <form
            onSubmit={save}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 animate-slide-up"
          >
            <h3 className="font-display text-2xl text-white tracking-wide mb-4">
              {editing.id ? 'Edit Player' : 'Add Player'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="label">Player name</label>
                <input
                  className="input"
                  required
                  value={form.player_name}
                  onChange={(e) => setForm({ ...form, player_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Hours played</label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={form.hours_played}
                    onChange={(e) => setForm({ ...form, hours_played: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Tier</label>
                  <select
                    className="input"
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={cancel} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
