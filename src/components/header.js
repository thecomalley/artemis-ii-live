import { T0_MS, SPLASHDOWN_MS, formatMET, isMissionComplete, LL_EVENTS_API, POLL_INTERVAL_MS } from '../config.js';

export function mountHeader(el) {
  el.innerHTML = `
    <div class="header-inner">
      <img src="/patch-logo.png" alt="Artemis II mission patch" class="header-patch" />
      <div class="header-mission-name">ARTEMIS II</div>
      <div class="header-met" id="met-display">MET +00/00:00:00</div>
      <div class="header-events-wrap">
        <div class="header-events" id="header-events"></div>
      </div>
    </div>
  `;

  const metEl    = document.getElementById('met-display');
  const eventsEl = document.getElementById('header-events');

  function tick() {
    const now = Date.now();
    const elapsed = isMissionComplete()
      ? SPLASHDOWN_MS - T0_MS
      : now - T0_MS;
    metEl.textContent = `MET ${formatMET(elapsed)}`;
    if (isMissionComplete()) {
      metEl.classList.add('met-frozen');
    }
  }

  tick();
  setInterval(tick, 1000);

  // --- Upcoming events (next 3) --------------------------------------

  function fmtEventDate(utc) {
    const d = new Date(utc);
    const today = new Date();
    const isToday = d.getFullYear() === today.getFullYear()
      && d.getMonth() === today.getMonth()
      && d.getDate() === today.getDate();
    const timePart = d.toLocaleString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    }).toLowerCase();
    if (isToday) return timePart + ' local';
    const datePart = d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    return datePart + ' · ' + timePart;
  }

  function stripPrefix(name) {
    return name.replace(/^Artemis\s+II\s+/i, '');
  }

  function buildEvents(events) {
    const now = Date.now();
    const next3 = events
      .filter(e => new Date(e.date).getTime() > now)
      .slice(0, 3);

    eventsEl.textContent = '';
    next3.forEach((e, i) => {
      if (i > 0) {
        const div = document.createElement('div');
        div.className = 'header-event-divider';
        eventsEl.appendChild(div);
      }

      const col = document.createElement('div');
      col.className = 'header-event';

      const name = document.createElement('span');
      name.className = 'header-event__name';
      name.textContent = stripPrefix(e.name);

      const time = document.createElement('span');
      time.className = 'header-event__time';
      time.textContent = fmtEventDate(e.date);

      col.appendChild(name);
      col.appendChild(time);
      eventsEl.appendChild(col);
    });
  }

  async function loadEvents() {
    try {
      const res = await fetch(LL_EVENTS_API);
      if (!res.ok) return;
      const data = await res.json();
      buildEvents(data.results || []);
    } catch {
      // Silently fail
    }
  }

  loadEvents();
  setInterval(loadEvents, POLL_INTERVAL_MS);
}
