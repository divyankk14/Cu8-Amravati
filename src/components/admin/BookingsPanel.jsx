import { useEffect, useMemo, useState } from 'react';
import { fetchBookings, fetchTables, updateBookingStatus } from '../../lib/api';
import {
  formatDateDDMMYYYY,
  formatTime12h,
  formatDuration,
  todayISO,
  tableTypeIcon,
} from '../../lib/format';

const STATUS_STYLE = {
  confirmed: 'bg-primary/15 text-primaryLight border border-primary/30',
  completed: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border border-red-500/30',
};

export default function BookingsPanel() {
  const [bookings, setBookings] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      fetchBookings({
        date: filterDate || null,
        tableId: filterTable || null,
      }),
      fetchTables(),
    ])
      .then(([b, t]) => {
        if (!alive) return;
        setBookings(b);
        setTables(t);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [filterDate, filterTable, tick]);

  const tableMap = useMemo(() => Object.fromEntries(tables.map((t) => [t.id, t])), [tables]);

  const filtered = useMemo(
    () => (filterStatus ? bookings.filter((b) => b.status === filterStatus) : bookings),
    [bookings, filterStatus]
  );

  const stats = useMemo(() => {
    const today = todayISO();
    return {
      total: bookings.length,
      today: bookings.filter((b) => b.date === today).length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    };
  }, [bookings]);

  async function setStatus(id, status) {
    await updateBookingStatus(id, status);
    setTick((x) => x + 1);
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total" value={stats.total} />
        <Stat label="Today" value={stats.today} accent />
        <Stat label="Confirmed" value={stats.confirmed} />
        <Stat label="Cancelled" value={stats.cancelled} />
      </div>

      <div className="card mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="label">Filter by Date</label>
            <input
              type="date"
              className="input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Filter by Table</label>
            <select className="input" value={filterTable} onChange={(e) => setFilterTable(e.target.value)}>
              <option value="">All tables</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="btn-ghost w-full"
              onClick={() => {
                setFilterDate('');
                setFilterTable('');
                setFilterStatus('');
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-10 text-center text-textmuted">Loading bookings…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-textmuted">No bookings match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cardalt text-left text-xs text-textmuted uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Table</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Slot</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const tbl = tableMap[b.table_id] || b.tables;
                  return (
                    <tr key={b.id} className="border-t border-border hover:bg-cardalt/50">
                      <td className="px-4 py-3 text-white font-medium">{b.customer_name}</td>
                      <td className="px-4 py-3 text-textmuted">
                        <a href={`tel:${b.phone}`} className="hover:text-white">
                          {b.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {tbl ? `${tableTypeIcon(tbl.type)} ${tbl.name}` : b.table_id}
                      </td>
                      <td className="px-4 py-3 text-textmuted">{formatDateDDMMYYYY(b.date)}</td>
                      <td className="px-4 py-3 text-textmuted">
                        {formatTime12h(b.start_time)} · {formatDuration(b.duration_minutes)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${STATUS_STYLE[b.status] || 'bg-cardalt'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          {b.status !== 'completed' && (
                            <button
                              onClick={() => setStatus(b.id, 'completed')}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25"
                            >
                              Complete
                            </button>
                          )}
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => setStatus(b.id, 'cancelled')}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25"
                            >
                              Cancel
                            </button>
                          )}
                          {b.status === 'cancelled' && (
                            <button
                              onClick={() => setStatus(b.id, 'confirmed')}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primaryLight hover:bg-primary/25"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="card py-4">
      <div className="text-xs text-textmuted uppercase tracking-wider">{label}</div>
      <div
        className={`font-display text-4xl mt-1 leading-none ${accent ? 'text-accent' : 'text-white'}`}
      >
        {value}
      </div>
    </div>
  );
}
