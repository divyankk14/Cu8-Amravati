import { useEffect, useState } from 'react';
import { fetchSettings, updateSetting } from '../../lib/api';

const FIELDS = [
  { key: 'club_name', label: 'Club Name', placeholder: 'CUE8' },
  { key: 'tagline', label: 'Tagline', placeholder: 'Pool & Snooker Club' },
  { key: 'hours', label: 'Operating Hours', placeholder: '12 PM – 12 AM' },
  { key: 'contact_phone', label: 'Contact Phone', placeholder: '+91 98765 43210' },
  { key: 'contact_email', label: 'Contact Email', placeholder: 'hello@cue8.in' },
  { key: 'address', label: 'Address', placeholder: 'Street, City, State' },
  { key: 'maps_embed', label: 'Google Maps Embed URL', placeholder: 'https://www.google.com/maps/embed?...', textarea: true },
];

export default function SettingsPanel() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);

  useEffect(() => {
    fetchSettings()
      .then(setValues)
      .finally(() => setLoading(false));
  }, []);

  async function save(key) {
    setSavingKey(key);
    try {
      await updateSetting(key, values[key] ?? '');
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 1800);
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return <div className="card text-center py-10 text-textmuted">Loading settings…</div>;
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-3xl text-white tracking-wide">Club Settings</h2>
        <p className="text-sm text-textmuted">
          These values appear across the public site (header, hero, footer, find-us).
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className={`card ${f.textarea ? 'md:col-span-2' : ''}`}>
            <label className="label">{f.label}</label>
            {f.textarea ? (
              <textarea
                className="input min-h-[100px] font-mono text-xs"
                placeholder={f.placeholder}
                value={values[f.key] || ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
            ) : (
              <input
                className="input"
                placeholder={f.placeholder}
                value={values[f.key] || ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
            )}
            <div className="flex justify-end mt-3">
              <button
                onClick={() => save(f.key)}
                disabled={savingKey === f.key}
                className={savedKey === f.key ? 'btn-gold text-xs' : 'btn-primary text-xs'}
              >
                {savingKey === f.key ? 'Saving…' : savedKey === f.key ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
