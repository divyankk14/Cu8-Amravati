export default function Hero({ onBook, hours }) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/15 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-8 items-center">
          <div>
            <span className="chip border-primary/40 text-primaryLight">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
              Online {hours || '12 PM – 12 AM'}
            </span>
            <h1 className="mt-5 font-display text-6xl md:text-8xl leading-[0.9] tracking-wide text-white">
              Reserve <br />
              <span className="text-primaryLight">Your Table</span>
            </h1>
            <p className="mt-5 text-textmuted text-base md:text-lg max-w-md">
              Book online. Pay via UPI. Confirmed instantly. Walk in, rack up, and break.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button onClick={onBook} className="btn-primary px-6 py-3.5">
                Book Your Table Now
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <a href="#tables" className="btn-ghost px-5 py-3.5">
                View Tables
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="chip">⚡ Instant confirmation</span>
              <span className="chip">📱 UPI payments</span>
              <span className="chip">🎱 5 premium tables</span>
            </div>
          </div>

          <div className="relative h-72 md:h-96 flex items-center justify-center">
            {/* 8-ball animated graphic */}
            <div className="relative w-56 h-56 md:w-72 md:h-72 animate-float">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl" />
              <div className="relative w-full h-full rounded-full eight-ball shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white flex items-center justify-center font-display text-5xl md:text-7xl text-black select-none">
                    8
                  </div>
                </div>
              </div>
              {/* orbiting balls */}
              <div className="absolute inset-0 animate-spin-slow pointer-events-none">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-accent shadow-gold" />
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-500 shadow-lg" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary shadow-glow" />
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="glow-divider" />
    </section>
  );
}
