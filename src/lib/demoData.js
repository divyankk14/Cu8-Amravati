// In-memory demo data. Used only when Supabase env vars aren't set.
export const uid = () =>
  'd_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const demoTables = [
  { id: 't1', name: 'ASGUARD', type: 'mini_snooker', price_per_hour: 250, is_available: true, created_at: new Date().toISOString() },
  { id: 't2', name: 'TITAN',   type: 'mini_snooker', price_per_hour: 250, is_available: true, created_at: new Date().toISOString() },
  { id: 't3', name: 'NYRO',    type: 'pool',         price_per_hour: 150, is_available: true, created_at: new Date().toISOString() },
  { id: 't4', name: 'ORION',   type: 'pool',         price_per_hour: 150, is_available: true, created_at: new Date().toISOString() },
  { id: 't5', name: 'VELAR',   type: 'pool',         price_per_hour: 150, is_available: true, created_at: new Date().toISOString() },
];

export const demoLeaderboard = [
  { id: 'p1',  player_name: 'Aarav Mehta',    hours_played: 142, tier: 'gold',   updated_at: new Date().toISOString() },
  { id: 'p2',  player_name: 'Rohan Kapoor',   hours_played: 128, tier: 'gold',   updated_at: new Date().toISOString() },
  { id: 'p3',  player_name: 'Vikram Iyer',    hours_played: 119, tier: 'gold',   updated_at: new Date().toISOString() },
  { id: 'p4',  player_name: 'Sneha Verma',    hours_played:  96, tier: 'silver', updated_at: new Date().toISOString() },
  { id: 'p5',  player_name: 'Arjun Singh',    hours_played:  88, tier: 'silver', updated_at: new Date().toISOString() },
  { id: 'p6',  player_name: 'Priya Nair',     hours_played:  74, tier: 'silver', updated_at: new Date().toISOString() },
  { id: 'p7',  player_name: 'Karan Malhotra', hours_played:  61, tier: 'bronze', updated_at: new Date().toISOString() },
  { id: 'p8',  player_name: 'Ishita Roy',     hours_played:  52, tier: 'bronze', updated_at: new Date().toISOString() },
  { id: 'p9',  player_name: 'Devansh Patel',  hours_played:  44, tier: 'bronze', updated_at: new Date().toISOString() },
  { id: 'p10', player_name: 'Meera Joshi',    hours_played:  37, tier: 'bronze', updated_at: new Date().toISOString() },
];

const today = new Date().toISOString().slice(0, 10);
export const demoBookings = [
  {
    id: 'b1',
    table_id: 't3',
    customer_name: 'Sandeep Reddy',
    phone: '+919876543210',
    date: today,
    start_time: timeOffset(0),
    duration_minutes: 60,
    status: 'confirmed',
    created_at: new Date().toISOString(),
  },
];

function timeOffset(minutesFromNow) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesFromNow);
  // round to 10 min and clamp
  const total = Math.max(12 * 60, Math.min(23 * 60 + 50, Math.round((d.getHours() * 60 + d.getMinutes()) / 10) * 10));
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export const demoSettings = {
  club_name: 'CUE8',
  tagline: 'Pool & Snooker Club',
  hours: '12 PM – 12 AM',
  contact_phone: '+91 98765 43210',
  contact_email: 'hello@cue8.in',
  address: 'CUE8 Pool & Snooker Club, India',
  maps_embed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.123!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v1700000000000',
};
