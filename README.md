# CUE8 — Pool & Snooker Club

A complete full-stack booking platform for a pool & snooker club, inspired by `cue8.in`. Built with **React + Vite + Tailwind** on the frontend and **Supabase** (Postgres + Auth + Realtime) on the backend. Hosted free on **Vercel**.

> **Live demo mode**: if you don't configure Supabase, the app boots in an in-memory demo so you can click around immediately.

---

## ✨ Features

### Public site
- **Hero** with animated 8-ball, online-hours badge, and primary CTA
- **Leaderboard**: Top 10 players with gold/silver/bronze tier badges
- **Table Availability**: live status (Available/Busy now), grouped by Mini Snooker & Pool, with prices
- **Booking modal**: select table → name → +91 phone → date → 10-min slot → duration → confirm
- **Find Us** with embedded Google Map and contact info
- **Real-time** updates (Supabase Realtime) — table status flips the moment a booking is created

### Booking engine
- 10-minute slot grid from **12 PM to 12 AM**
- Durations: **30 min / 1 hr / 1 hr 30 min / 2 hrs**
- **Conflict detection** — checks existing bookings before insert
- **No double-booking** enforced at DB level by a Postgres `EXCLUDE` (gist) constraint
- Future-slot booking is always available even if the table is busy right now
- Estimated total computed live (price × duration)

### Admin Dashboard (`/admin`)
- Email/password login via Supabase Auth (JWT)
- 4 panels:
  1. **Bookings** — table view, filter by date / table / status, mark complete or cancel
  2. **Tables** — add / edit / delete, change price, toggle availability
  3. **Leaderboard** — add / edit / remove players, set hours and tier
  4. **Settings** — club name, tagline, hours, phone, email, address, Maps embed URL

### Tech / Design
- Dark theme: bg `#0a0a0a` · cards `#111` · primary `#2d6a4f` (green) · accent `#f4a522` (gold)
- Fonts: **Bebas Neue** (display) · **DM Sans** (body)
- Mobile-first, fully responsive
- Smooth animations (modal slide-up, fade-in, leaderboard stagger, busy-pulse)

---

## 🧱 Tech Stack (100% free tier)

| Layer | Tech |
|------|------|
| Frontend | React 18, Vite 5, Tailwind 3, React Router 6 |
| Backend | Supabase Postgres + Auth + Realtime |
| Hosting | Vercel (frontend) + Supabase (DB/Auth) |
| Optional Phase 2 | Razorpay UPI, Twilio WhatsApp, Supabase Edge Functions |

---

## 🚀 Quick start (local)

```bash
# 1. Install deps
npm install

# 2. (optional) connect to Supabase
cp .env.example .env
# then edit .env with your VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY

# 3. Run dev server
npm run dev
# open http://localhost:5173
```

If you skip step 2, the app runs in **demo mode** with in-memory data. Admin demo credentials are shown on the login screen.

---

## 🗄️ Supabase setup

1. Create a new project at [supabase.com](https://supabase.com) (free tier).
2. Go to **SQL Editor** → New query → paste the contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   This creates the 4 tables, RLS policies, no-overlap constraint, seed data, and Realtime publication.
3. **Auth** → Users → Invite an admin user with email + password (or enable email signup).
4. **Project Settings → API** → copy `Project URL` and `anon public` key into your `.env`.

### Schema overview

```sql
tables          (id, name, type, price_per_hour, is_available, created_at)
bookings        (id, table_id, customer_name, phone, date, start_time, duration_minutes, status, created_at)
leaderboard     (id, player_name, hours_played, tier, updated_at)
admin_settings  (id, key, value)
```

The `bookings` table has a Postgres `EXCLUDE USING gist (... &&)` constraint that **physically prevents** two non-cancelled bookings from overlapping on the same table. RLS policies allow public read + insert on bookings, but only authenticated admins can update/delete.

---

## ☁️ Deploy to Vercel

```bash
# install once
npm i -g vercel

# from project root
vercel

# When prompted set env vars (or do it in dashboard):
#   VITE_SUPABASE_URL       = https://YOUR-REF.supabase.co
#   VITE_SUPABASE_ANON_KEY  = eyJhbGciOi...
```

Or one-click in the Vercel dashboard:
1. **New Project** → import this repo.
2. Framework preset is auto-detected (Vite).
3. Add the two `VITE_SUPABASE_*` environment variables.
4. **Deploy**. The included `vercel.json` rewrites all routes to `index.html` so `/admin` works.

---

## 🔐 Admin login

- **Production**: any user you invite in Supabase Auth can sign in at `/admin/login`.
- **Demo mode** (no Supabase env): use
  - email: `admin@cue8.local`
  - password: `cue8admin`

---

## 🗺️ Project structure

```
.
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ vite.config.js
├─ vercel.json
├─ .env.example
├─ supabase/
│  └─ schema.sql              # full DB schema + seed + RLS
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ index.css
   ├─ context/AuthContext.jsx
   ├─ lib/
   │  ├─ supabaseClient.js    # singleton client + demo-mode flag
   │  ├─ api.js               # all data access (with demo fallbacks)
   │  ├─ demoData.js          # in-memory data for offline preview
   │  └─ format.js            # date/time/price helpers, slot generator
   ├─ pages/
   │  ├─ Home.jsx
   │  ├─ AdminLogin.jsx
   │  └─ AdminDashboard.jsx
   └─ components/
      ├─ Navbar.jsx · Hero.jsx · Leaderboard.jsx
      ├─ TablesGrid.jsx · FindUs.jsx · Footer.jsx
      ├─ BookingModal.jsx · RequireAuth.jsx
      └─ admin/
         ├─ BookingsPanel.jsx
         ├─ TablesPanel.jsx
         ├─ LeaderboardPanel.jsx
         └─ SettingsPanel.jsx
```

---

## 🔭 Phase 2 roadmap (post-MVP)

- **Razorpay UPI** payment on booking confirmation (`VITE_RAZORPAY_KEY_ID` already scaffolded)
- **WhatsApp confirmation** via Twilio (Supabase Edge Function `notify-booking`)
- **Revenue analytics** chart in admin dashboard (per day / per table)
- **Waitlist** when a table is busy — auto-notify when freed
- **Player profiles** with personal stats and history

---

## 🧪 Production checklist

- [ ] Replace seed `maps_embed` in Settings with your real Google Maps URL
- [ ] Update phone/email/address in Settings panel
- [ ] Invite at least one admin user in Supabase Auth
- [ ] Disable email signup in Supabase Auth (admin-only console)
- [ ] Set `VITE_SUPABASE_*` env vars in Vercel project
- [ ] Test a booking → check it appears in admin → mark complete

---

## 📜 License

MIT — use freely.
