export default function FindUs({ settings }) {
  const embed =
    settings?.maps_embed ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.123!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1';
  return (
    <section id="find-us" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="chip text-primaryLight border-primary/30">📍 Visit Us</span>
          <h2 className="section-title mt-3">Find Us</h2>
          <p className="section-sub mt-2">
            {settings?.club_name || 'CUE8'} — {settings?.address || 'India'}
          </p>
        </div>
        <div className="text-sm text-textmuted">
          {settings?.contact_phone && (
            <div>📞 <a className="hover:text-white" href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a></div>
          )}
          {settings?.contact_email && (
            <div>✉️ <a className="hover:text-white" href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></div>
          )}
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden border border-border bg-card aspect-video">
        <iframe
          title="CUE8 location"
          src={embed}
          className="w-full h-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
