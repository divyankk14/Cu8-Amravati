import { Link } from 'react-router-dom';

export default function Navbar({ onBook, settings }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full eight-ball flex items-center justify-center text-accent font-display text-xl shadow-glow group-hover:scale-105 transition-transform">
            8
          </div>
          <div className="leading-none">
            <div className="font-display text-2xl tracking-wider text-white">
              {settings?.club_name || 'CUE8'}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-textmuted -mt-0.5">
              {settings?.tagline || 'Pool & Snooker Club'}
            </div>
          </div>
        </Link>
        <button onClick={onBook} className="btn-primary px-4 py-2.5 text-xs md:text-sm">
          <span className="hidden sm:inline">Book a Table</span>
          <span className="sm:hidden">Book</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
