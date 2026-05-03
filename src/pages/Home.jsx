import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Leaderboard from '../components/Leaderboard';
import TablesGrid from '../components/TablesGrid';
import FindUs from '../components/FindUs';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import { fetchSettings } from '../lib/api';
import { SUPABASE_CONFIGURED } from '../lib/supabaseClient';

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselected, setPreselected] = useState(null);
  const [settings, setSettings] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  function openBooking(table = null) {
    setPreselected(table);
    setBookingOpen(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!SUPABASE_CONFIGURED && (
        <div className="bg-accent/10 border-b border-accent/30 text-accent text-center text-xs py-2 px-3">
          Demo mode — Supabase not configured. Add <code className="font-mono">.env</code> values to enable persistence.
        </div>
      )}
      <Navbar onBook={() => openBooking(null)} settings={settings} />
      <main className="flex-1">
        <Hero onBook={() => openBooking(null)} hours={settings.hours} />
        <Leaderboard />
        <TablesGrid onBook={openBooking} refreshKey={refreshKey} />
        <FindUs settings={settings} />
      </main>
      <Footer settings={settings} />
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preselectedTable={preselected}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
