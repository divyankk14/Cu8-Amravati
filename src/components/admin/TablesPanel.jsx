import { useEffect, useState } from 'react';
import { createTable, deleteTable, fetchTables, updateTable } from '../../lib/api';
import { formatPrice, tableTypeLabel } from '../../lib/format';

const EMPTY = { name: '', type: 'pool', price_per_hour: 150, is_available: true };

export default function TablesPanel() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // table object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setTables(await fetchTables());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function startEdit(t) {
    setEditing(t);
    setForm({
      name: t.name,
      type: t.type,
      price_per_hour: t.price_per_hour,
      is_available: t.is_available,
    });
    setError('');
  }
  function startCreate() {
    setEditing({});
    setForm(EMPTY);
    setError('');
  }
  function cancel() {
    setEditing(null);
    setForm(EMPTY);
    setError('');
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim().toUpperCase(),
        type: form.type,
        price_per_hour: Number(form.price_per_hour),
        is_available: !!form.is_available,
      };
      if (editing && editing.id) {
        await updateTable(editing.id, payload);
      } else {
        await createTable(payload);
      }
      await load();
      cancel();
    } catch (err) {
      setError(err.message || 'Could not save table');
    } finally {
      setSaving(false);
    }
  }

  async function remove(t) {
    if (!confirm(`Delete table "${t.name}"? This cannot be undone.`)) return;
    await deleteTable(t.id);
    await load();
  }

  async function toggleAvailability(t) {
    await updateTable(t.id, { is_available: !t.is_available });
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-3xl text-white tracking-wide">Manage Tables</h2>
          <p className="text-sm text-textmuted">Add, edit, price, and toggle availability.</p>
        </div>
        <button onClick={startCreate} className="btn-primary">
          + Add Table
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-display text-3xl text-white tracking-wider leading-none">{t.name}</div>
                  <div className="text-xs text-textmuted mt-1 uppercase tracking-wider">
                    {tableTypeLabel(t.type)}
                  </div>
                </div>
                <span
                  className={`badge ${
                    t.is_available
                      ? 'bg-primary/15 text-primaryLight border border-primary/30'
                      : 'bg-red-500/15 text-red-300 border border-red-500/30'
                  }`}
                >
                  {t.is_available ? 'Available' : 'Disabled'}
                </span>
              </div>
              <div className="font-display text-3xl text-accent leading-none">
                {formatPrice(t.price_per_hour)}
                <span className="text-textmuted text-xs font-body ml-1">/hr</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => startEdit(t)} className="btn-ghost text-xs flex-1">
                  Edit
                </button>
                <button onClick={() => toggleAvailability(t)} className="btn-ghost text-xs flex-1">
                  {t.is_available ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => remove(t)} className="btn-danger text-xs">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
              {editing.id ? 'Edit Table' : 'Add Table'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. ORION"
                />
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="pool">Pool</option>
                  <option value="mini_snooker">Mini Snooker</option>
                </select>
              </div>
              <div>
                <label className="label">Price per hour (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  className="input"
                  value={form.price_per_hour}
                  onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-textmuted cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                Available for booking
              </label>
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm text-red-300">
                  {error}
                </div>
              )}
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
