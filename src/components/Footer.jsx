import { Link } from 'react-router-dom';

export default function Footer({ settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full eight-ball flex items-center justify-center text-accent font-display text-xl">
            8
          </div>
          <div>
            <div className="font-display text-xl tracking-wider text-white">
              {settings?.club_name || 'CUE8'}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-textmuted">
              {settings?.tagline || 'Pool & Snooker Club'}
            </div>
          </div>
        </div>
        <div className="text-xs text-textmuted">
          © {year} {settings?.club_name || 'CUE8'}. All rights reserved.
        </div>
        <Link to="/admin/login" className="text-xs text-textmuted hover:text-primaryLight transition-colors">
          Admin →
        </Link>
      </div>
    </footer>
  );
}
