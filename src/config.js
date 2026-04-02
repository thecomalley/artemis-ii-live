export const T0_UTC = '2026-04-01T22:35:12Z';
export const T0_MS  = new Date(T0_UTC).getTime();

export const SPLASHDOWN_UTC = '2026-04-11T00:06:00Z';
export const SPLASHDOWN_MS  = new Date(SPLASHDOWN_UTC).getTime();

export const LAUNCH_LIBRARY_ID = '41699701-2ef4-4b0c-ac9d-6757820cde87';
export const LAUNCH_LIBRARY_API = `https://ll.thespacedevs.com/2.3.0/launches/${LAUNCH_LIBRARY_ID}/`;
export const LL_EVENTS_API = 'https://ll.thespacedevs.com/2.3.0/events/upcoming/?search=Artemis&ordering=date&limit=30';

export const STREAMS = {
  commentary: { id: 'm3kR2KK8TEs', label: 'Commentary' },
  orion:      { id: '6RwfNBtepa4', label: 'Orion Live Views' },
};

export const AROW_TRACKER_URL = 'https://www.nasa.gov/missions/artemis-ii/arow/';

export const RSS_URL = 'https://www.nasa.gov/blogs/artemis/feed/';

export const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function isMissionComplete() {
  return Date.now() >= SPLASHDOWN_MS;
}

/** Format a MET duration in milliseconds as +DD/HH:MM:SS */
export function formatMET(ms) {
  const sign    = ms < 0 ? '-' : '+';
  const abs     = Math.abs(ms);
  const totalS  = Math.floor(abs / 1000);
  const s       = totalS % 60;
  const totalM  = Math.floor(totalS / 60);
  const m       = totalM % 60;
  const totalH  = Math.floor(totalM / 60);
  const h       = totalH % 24;
  const d       = Math.floor(totalH / 24);
  return `${sign}${String(d).padStart(2,'0')}/${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/** Format a MET duration in milliseconds as +DD/HH:MM (no seconds — for timeline display) */
export function formatMETShort(ms) {
  const sign    = ms < 0 ? '-' : '+';
  const abs     = Math.abs(ms);
  const totalM  = Math.floor(abs / 60000);
  const m       = totalM % 60;
  const totalH  = Math.floor(totalM / 60);
  const h       = totalH % 24;
  const d       = Math.floor(totalH / 24);
  return `${sign}${String(d).padStart(2,'0')}/${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
