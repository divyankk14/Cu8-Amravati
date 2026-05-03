import { useEffect, useMemo, useRef, useState } from 'react';
import { createBooking, fetchTables } from '../lib/api';
import {
  formatPrice,
  formatTime12h,
  formatDuration,
  formatDateDDMMYYYY,
  generateTimeSlots,
  tableTypeLabel,
  tableTypeIcon,
  todayISO,
} from '../lib/format';

const DURATIONS = [30, 60, 90, 120];

export default function BookingModal({ open, onClose, preselectedTable, onSuccess }) {
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState('12:00');
  const [duration, setDuration] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const dialogRef = useRef(null);

  const slots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
    if (!open) return;
    fetchTables().then(setTables).catch(() => setTables([]));
    setError('');
    setSuccess(null);
  }, [open]);

  useEffect(() => {
    if (open && preselectedTable) setTableId(preselectedTable.id);
  }, [open, preselectedTable]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const selectedTable = tables.find((t) => t.id === tableId);
  const totalCost = selectedTable ? Math.round((selectedTable.price_per_hour * duration) / 60) : 0;

  const canSubmit =
    !!tableId &&
    name.trim().length >= 2 &&
    /^\+?\d{10,15}$/.test(phone.replace(/\s/g, '')) &&
    !!date &&
    !!startTime &&
    !!duration &&
    !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const booking = await createBooking({
        table_id: tableId,
        customer_name: name.trim(),
        phone: phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim().replace(/\D/g, '')}`,
        date,
        start_time: startTime,
        duration_minutes: Number(duration),
      });
      setSuccess({ ...booking, tableName: selectedTable?.name, tableType: selectedTable?.type, total: totalCost });
      onSuccess?.(booking);
    } catch (err) {
      setError(err.message || 'Could not save booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSuccess(null);
    setName('');
    setPhone('');
    setStartTime('12:00');
    setDuration(60);
    setError('');
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === dialogRef.current && onClose()}
      ref={dialogRef}
    >
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl animate-slide-up">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-9 h-9 rounded-full bg-cardalt border border-border text-textmuted hover:text-white hover:border-primary flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
          </svg>
        </button>

        {success ? (
          <SuccessView data={success} onClose={onClose} onAnother={reset} />
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="mb-6">
              <span className="chip text-primaryLight border-primary/30">🎱 New Booking</span>
              <h3 className="font-display text-3xl md:text-4xl tracking-wide text-white mt-3">
                Book Your Table
              </h3>
              <p className="text-sm text-textmuted mt-1">
                Pick a table, slot, and we'll lock it in instantly.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Select Table</label>
                <select
                  className="input"
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  required
                >
                  <option value="">— Choose a table —</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {tableTypeIcon(t.type)} {t.name} · {tableTypeLabel(t.type)} · {formatPrice(t.price_per_hour)}/hr
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Your Name</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone (+91)</label>
                  <input
                    className="input"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Date {date && <span className="text-textmuted normal-case">— {formatDateDDMMYYYY(date)}</span>}</label>
                <input
                  className="input"
                  type="date"
                  value={date}
                  min={todayISO()}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Time</label>
                  <select className="input" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                    {slots.map((s) => (
                      <option key={s} value={s}>
                        {formatTime12h(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Duration</label>
                  <select className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {formatDuration(d)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedTable && (
                <div className="rounded-xl bg-cardalt border border-border p-4 flex items-center justify-between">
                  <div className="text-sm">
                    <div className="text-textmuted text-xs uppercase tracking-wider">Estimated total</div>
                    <div className="font-display text-3xl text-accent leading-none mt-1">
                      {formatPrice(totalCost)}
                    </div>
                  </div>
                  <div className="text-right text-xs text-textmuted">
                    <div>{tableTypeIcon(selectedTable.type)} {selectedTable.name}</div>
                    <div>{formatDuration(duration)} · {formatTime12h(startTime)}</div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-primary w-full py-4 text-base"
              >
                {submitting ? 'Confirming…' : 'Confirm Booking'}
              </button>

              <p className="text-[11px] text-textmuted text-center">
                You'll receive instant confirmation. Payment via UPI on arrival or in-app (coming soon).
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SuccessView({ data, onClose, onAnother }) {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 shadow-glow">
        <svg className="w-8 h-8 text-primaryLight" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="font-display text-3xl tracking-wide text-white">Booking Confirmed</h3>
      <p className="text-textmuted text-sm mt-1">See you at the table.</p>

      <div className="mt-6 text-left rounded-xl bg-cardalt border border-border p-4 space-y-2 text-sm">
        <Row label="Table" value={`${tableTypeIcon(data.tableType)} ${data.tableName || data.table_id}`} />
        <Row label="Name" value={data.customer_name} />
        <Row label="Phone" value={data.phone} />
        <Row label="Date" value={formatDateDDMMYYYY(data.date)} />
        <Row label="Slot" value={`${formatTime12h(data.start_time)} · ${formatDuration(data.duration_minutes)}`} />
        <Row label="Total" value={formatPrice(data.total)} highlight />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button onClick={onAnother} className="btn-ghost">Book another</button>
        <button onClick={onClose} className="btn-primary">Done</button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-textmuted">{label}</span>
      <span className={highlight ? 'text-accent font-display text-xl leading-none' : 'text-white font-medium'}>
        {value}
      </span>
    </div>
  );
}
