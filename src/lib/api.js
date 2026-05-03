// Thin data-access layer that wraps Supabase.
// Falls back to in-memory demo data when Supabase isn't configured,
// so the UI is fully usable for local preview/screenshots.

import { supabase, SUPABASE_CONFIGURED } from './supabaseClient';
import {
  demoTables,
  demoLeaderboard,
  demoBookings,
  demoSettings,
  uid,
} from './demoData';

// ---------- Tables ----------
export async function fetchTables() {
  if (!SUPABASE_CONFIGURED) return [...demoTables];
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createTable(payload) {
  if (!SUPABASE_CONFIGURED) {
    const row = { id: uid(), created_at: new Date().toISOString(), ...payload };
    demoTables.push(row);
    return row;
  }
  const { data, error } = await supabase.from('tables').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateTable(id, patch) {
  if (!SUPABASE_CONFIGURED) {
    const i = demoTables.findIndex((t) => t.id === id);
    if (i >= 0) demoTables[i] = { ...demoTables[i], ...patch };
    return demoTables[i];
  }
  const { data, error } = await supabase.from('tables').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTable(id) {
  if (!SUPABASE_CONFIGURED) {
    const i = demoTables.findIndex((t) => t.id === id);
    if (i >= 0) demoTables.splice(i, 1);
    return true;
  }
  const { error } = await supabase.from('tables').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ---------- Bookings ----------
export async function fetchBookings({ date = null, tableId = null } = {}) {
  if (!SUPABASE_CONFIGURED) {
    return demoBookings
      .filter((b) => (date ? b.date === date : true))
      .filter((b) => (tableId ? b.table_id === tableId : true))
      .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
  }
  let q = supabase.from('bookings').select('*, tables(name,type,price_per_hour)');
  if (date) q = q.eq('date', date);
  if (tableId) q = q.eq('table_id', tableId);
  const { data, error } = await q.order('date', { ascending: false }).order('start_time', { ascending: true });
  if (error) throw error;
  return data || [];
}

// Returns conflicting bookings for the same table that overlap [start, end)
export async function findConflictingBookings({ tableId, date, startTime, durationMinutes }) {
  const startMin = toMinutes(startTime);
  const endMin = startMin + Number(durationMinutes);

  const all = SUPABASE_CONFIGURED
    ? (
        await supabase
          .from('bookings')
          .select('*')
          .eq('table_id', tableId)
          .eq('date', date)
          .neq('status', 'cancelled')
      ).data || []
    : demoBookings.filter(
        (b) => b.table_id === tableId && b.date === date && b.status !== 'cancelled'
      );

  return all.filter((b) => {
    const s = toMinutes(b.start_time);
    const e = s + Number(b.duration_minutes);
    return s < endMin && e > startMin; // overlap
  });
}

export async function createBooking(payload) {
  // Always re-check conflicts server-side (best effort) before inserting.
  const conflicts = await findConflictingBookings({
    tableId: payload.table_id,
    date: payload.date,
    startTime: payload.start_time,
    durationMinutes: payload.duration_minutes,
  });
  if (conflicts.length) {
    const c = conflicts[0];
    const err = new Error(
      `This table is already booked from ${c.start_time} for ${c.duration_minutes} min on ${c.date}. Please pick a different slot.`
    );
    err.code = 'CONFLICT';
    throw err;
  }

  if (!SUPABASE_CONFIGURED) {
    const row = {
      id: uid(),
      created_at: new Date().toISOString(),
      status: 'confirmed',
      ...payload,
    };
    demoBookings.push(row);
    return row;
  }
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...payload, status: 'confirmed' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBookingStatus(id, status) {
  if (!SUPABASE_CONFIGURED) {
    const i = demoBookings.findIndex((b) => b.id === id);
    if (i >= 0) demoBookings[i].status = status;
    return demoBookings[i];
  }
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- Leaderboard ----------
export async function fetchLeaderboard(limit = 10) {
  if (!SUPABASE_CONFIGURED) {
    return [...demoLeaderboard].sort((a, b) => b.hours_played - a.hours_played).slice(0, limit);
  }
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('hours_played', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function upsertPlayer(payload) {
  if (!SUPABASE_CONFIGURED) {
    if (payload.id) {
      const i = demoLeaderboard.findIndex((p) => p.id === payload.id);
      if (i >= 0) demoLeaderboard[i] = { ...demoLeaderboard[i], ...payload, updated_at: new Date().toISOString() };
      return demoLeaderboard[i];
    }
    const row = { id: uid(), updated_at: new Date().toISOString(), ...payload };
    demoLeaderboard.push(row);
    return row;
  }
  if (payload.id) {
    const { data, error } = await supabase
      .from('leaderboard')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', payload.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('leaderboard').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deletePlayer(id) {
  if (!SUPABASE_CONFIGURED) {
    const i = demoLeaderboard.findIndex((p) => p.id === id);
    if (i >= 0) demoLeaderboard.splice(i, 1);
    return true;
  }
  const { error } = await supabase.from('leaderboard').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ---------- Settings ----------
export async function fetchSettings() {
  if (!SUPABASE_CONFIGURED) return { ...demoSettings };
  const { data, error } = await supabase.from('admin_settings').select('*');
  if (error) throw error;
  const map = {};
  (data || []).forEach((row) => (map[row.key] = row.value));
  return map;
}

export async function updateSetting(key, value) {
  if (!SUPABASE_CONFIGURED) {
    demoSettings[key] = value;
    return { key, value };
  }
  const { data, error } = await supabase
    .from('admin_settings')
    .upsert({ key, value }, { onConflict: 'key' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- Helpers ----------
export function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
}

export function isTableBusyNow(bookingsForToday, tableId, now = new Date()) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return bookingsForToday.some((b) => {
    if (b.table_id !== tableId) return false;
    if (b.status === 'cancelled') return false;
    const s = toMinutes(b.start_time);
    const e = s + Number(b.duration_minutes);
    return s <= nowMin && e > nowMin;
  });
}
