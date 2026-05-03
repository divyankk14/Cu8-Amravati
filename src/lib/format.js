export function formatPrice(n) {
  if (n == null) return '';
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

export function formatDateDDMMYYYY(d) {
  if (!d) return '';
  const date = typeof d === 'string' ? parseISODate(d) : d;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function parseISODate(s) {
  // expects YYYY-MM-DD
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatTime12h(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hr = ((h + 11) % 12) + 1;
  return `${hr}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDuration(min) {
  if (min === 30) return '30 min';
  if (min === 60) return '1 hr';
  if (min === 90) return '1 hr 30 min';
  if (min === 120) return '2 hrs';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

// 10-min slots from 12:00 (12 PM) to 23:50 (close at 12 AM)
export function generateTimeSlots() {
  const slots = [];
  for (let h = 12; h < 24; h++) {
    for (let m = 0; m < 60; m += 10) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

export function tableTypeLabel(t) {
  if (t === 'mini_snooker') return 'Mini Snooker';
  if (t === 'pool') return 'Pool';
  return t;
}

export function tableTypeIcon(t) {
  return t === 'mini_snooker' ? '🟡' : '🎱';
}
