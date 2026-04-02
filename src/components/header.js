import { T0_MS, SPLASHDOWN_MS, formatMET, isMissionComplete } from '../config.js';

export function mountHeader(el) {
  el.innerHTML = `
    <div class="header-inner">
      <div class="header-mission-name">ARTEMIS II</div>
      <div class="header-met" id="met-display">MET +00/00:00:00</div>
    </div>
  `;

  const metEl    = document.getElementById('met-display');

  function tick() {
    const now = Date.now();

    // MET — freeze at splashdown if mission complete
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


}
