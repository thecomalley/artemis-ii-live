import { MILESTONES, FLIGHT_DAY_LABELS } from '../data/milestones.js';
import { T0_MS, formatMETShort, isMissionComplete } from '../config.js';

export function mountTimeline(el) {
  el.innerHTML = buildHTML();

  let lastActiveId = null;

  function updateStates() {
    const missionDone = isMissionComplete();
    const now = missionDone ? Infinity : Date.now();
    let activeId = null;

    if (!missionDone) {
      // Find the most recent past milestone
      for (const m of MILESTONES) {
        const ms = new Date(m.utc).getTime();
        if (ms <= now) {
          activeId = m.id;
        }
      }
    }

    MILESTONES.forEach(m => {
      const milestoneEl = document.getElementById(`milestone-${m.id}`);
      if (!milestoneEl) return;
      const ms = new Date(m.utc).getTime();
      milestoneEl.classList.remove('past', 'active', 'upcoming');
      if (m.id === activeId) {
        milestoneEl.classList.add('active');
      } else if (ms <= now) {
        milestoneEl.classList.add('past');
      } else {
        milestoneEl.classList.add('upcoming');
      }
    });

    // Find active index and next index for progress bar / countdown
    let activeIndex = -1;
    let nextIndex   = -1;
    if (!missionDone) {
      for (let i = 0; i < MILESTONES.length; i++) {
        if (MILESTONES[i].id === activeId) activeIndex = i;
      }
      nextIndex = (activeIndex !== -1 && activeIndex + 1 < MILESTONES.length) ? activeIndex + 1 : -1;
    }

    // Second pass: update progress bar and countdown
    MILESTONES.forEach((m, i) => {
      const progressWrap = document.querySelector(`#milestone-${m.id} .milestone-progress-wrap`);
      const progressBar  = document.querySelector(`#milestone-${m.id} .milestone-progress-bar`);
      const countdownEl  = document.querySelector(`#milestone-${m.id} .milestone-countdown`);

      if (progressWrap) {
        if (!missionDone && i === activeIndex && nextIndex !== -1) {
          const activeMs = new Date(MILESTONES[activeIndex].utc).getTime();
          const nextMs   = new Date(MILESTONES[nextIndex].utc).getTime();
          const pct      = Math.min(100, Math.max(0, ((now - activeMs) / (nextMs - activeMs)) * 100));
          progressWrap.style.display = 'block';
          progressBar.style.width    = `${pct.toFixed(1)}%`;
        } else {
          progressWrap.style.display = 'none';
        }
      }

      if (countdownEl) {
        if (!missionDone && i === nextIndex) {
          const nextMs = new Date(MILESTONES[nextIndex].utc).getTime();
          const diff   = nextMs - now;
          countdownEl.style.display = 'block';
          countdownEl.textContent   = diff > 0 ? `T-${formatCountdown(diff)}` : 'T+00:00:00';
        } else {
          countdownEl.style.display = 'none';
          countdownEl.textContent   = '';
        }
      }
    });

    // Auto-scroll to active milestone if it changed
    if (activeId && activeId !== lastActiveId) {
      lastActiveId = activeId;
      const activeEl = document.getElementById(`milestone-${activeId}`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }

  updateStates();
  setInterval(updateStates, 1000);
}

function buildHTML() {
  const groups = {};
  for (const m of MILESTONES) {
    if (!groups[m.flightDay]) groups[m.flightDay] = [];
    groups[m.flightDay].push(m);
  }

  let html = '<div class="timeline-header">MISSION TIMELINE<span class="timeline-disclaimer">Times approximate</span></div>';

  for (const day of Object.keys(groups).sort((a, b) => Number(a) - Number(b))) {
    const label = FLIGHT_DAY_LABELS[day] ?? `Flight Day ${day}`;
    html += `<div class="flight-day-header">${escapeText(label)}</div>`;

    for (const m of groups[day]) {
      const metMs    = new Date(m.utc).getTime() - T0_MS;
      const metLabel = formatMETShort(metMs);
      const localTime = new Date(m.utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      html += `
        <div class="milestone upcoming" id="milestone-${m.id}" data-utc="${m.utc}">
          <div class="milestone-met">${escapeText(metLabel)}</div>
          <div class="milestone-label">${escapeText(m.label)}</div>
          <div class="milestone-local">${escapeText(localTime)} local</div>
          ${m.note ? `<div class="milestone-note">${escapeText(m.note)}</div>` : ''}
          <div class="milestone-progress-wrap"><div class="milestone-progress-bar"></div></div>
          <div class="milestone-countdown"></div>
        </div>
      `;
    }
  }

  return html;
}

function formatCountdown(ms) {
  const totalS = Math.floor(Math.abs(ms) / 1000);
  const s = String(totalS % 60).padStart(2, '0');
  const m = String(Math.floor(totalS / 60) % 60).padStart(2, '0');
  const h = String(Math.floor(totalS / 3600)).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function escapeText(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
