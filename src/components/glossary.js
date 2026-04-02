const TERMS = [
  // From broadcast schedule
  { term: 'SLS',    definition: "Space Launch System — NASA's heavy-lift rocket powering Artemis missions" },
  { term: 'ICPS',   definition: 'Interim Cryogenic Propulsion Stage — upper stage that performs the TLI burn' },
  { term: 'TLI',    definition: 'Trans-Lunar Injection — the burn that sets the trajectory toward the Moon' },
  { term: 'OTC',    definition: 'Outbound Trajectory Correction — mid-course burn on the way to the Moon' },
  { term: 'RTC',    definition: 'Return Trajectory Correction — mid-course burn on the way back to Earth' },
  { term: 'PAO',    definition: "Public Affairs Office — NASA's communications team; PAO events are press briefings" },
  { term: 'MET',    definition: 'Mission Elapsed Time — time since launch, format +DD/HH:MM:SS' },
  { term: 'MECO',   definition: 'Main Engine Cutoff — moment the SLS core stage engines shut down' },
  { term: 'USS',    definition: 'Upper Stage Separation — separation of the ICPS from Orion' },
  { term: 'SAW',    definition: "Solar Array Wing — Orion's power-generating solar panels" },
  { term: 'OCSS',   definition: 'Orion Crew Survival System — the pressure suit worn during launch, entry, and abort' },
  { term: 'CSA',    definition: "Canadian Space Agency — Jeremy Hansen's agency; Canada's first astronaut to the Moon vicinity" },
  { term: 'KSC',    definition: "Kennedy Space Center — NASA's launch facility in Florida, home of LC-39B" },
  { term: 'JSC',    definition: "Johnson Space Center — NASA's astronaut training and mission control hub in Houston" },
  // Mission-specific
  { term: 'CM',     definition: 'Crew Module — the pressurised capsule that carries the crew and returns to Earth' },
  { term: 'SM',     definition: 'Service Module — the ESM-built propulsion and power module attached to the CM' },
  { term: 'ESM',    definition: 'European Service Module — built by ESA/Airbus, provides power, propulsion and consumables' },
  { term: 'LAS',    definition: 'Launch Abort System — tower on top of Orion that pulls the CM away from a failing rocket' },
  { term: 'TPS',    definition: 'Thermal Protection System — Orion\'s heat shield; must survive ~2760°C entry heating' },
  { term: 'SOI',    definition: 'Sphere of Influence — the region around the Moon where lunar gravity dominates' },
  { term: 'DFTO',   definition: 'Detailed Flight Test Objective — a specific engineering test item on the mission manifest' },
  // Communications
  { term: 'AOS',    definition: 'Acquisition of Signal — moment ground regains contact with the spacecraft' },
  { term: 'LOS',    definition: 'Loss of Signal — expected communications blackout, e.g. behind the Moon' },
  { term: 'DSN',    definition: "Deep Space Network — NASA's global antenna network for deep-space communications" },
  // General spaceflight
  { term: 'EVA',    definition: 'Extravehicular Activity — a spacewalk (none planned for Artemis II)' },
  { term: 'GNC',    definition: 'Guidance, Navigation and Control — the systems that steer the spacecraft' },
  { term: 'ECLSS',  definition: 'Environmental Control and Life Support System — manages cabin atmosphere, temperature, and water' },
  { term: 'MPCV',   definition: 'Multi-Purpose Crew Vehicle — the formal NASA designation for the Orion spacecraft' },
  { term: 'TCA',    definition: 'Trajectory Correction Maneuver — generic term for an in-flight burn to adjust course' },
  { term: 'FD',     definition: 'Flight Day — numbered days of the mission (FD1 = launch day)' },
  { term: 'CDT',    definition: 'Central Daylight Time — UTC-5; used in broadcast schedules from Houston/KSC' },
  { term: 'EDT',    definition: 'Eastern Daylight Time — UTC-4; KSC local time during Artemis II' },
  { term: 'GMT',    definition: 'Greenwich Mean Time — essentially equivalent to UTC for mission planning purposes' },
  { term: 'UTC',    definition: 'Coordinated Universal Time — the standard reference time used in all mission documentation' },
  { term: 'ISS',    definition: 'International Space Station — referenced in the Integrity-to-ISS ship-to-ship call on FD7' },
  { term: 'LC-39B', definition: 'Launch Complex 39B — the pad at KSC used for SLS launches' },
];

export function mountGlossary(el) {
  let filterTerm = '';

  el.innerHTML = `
    <div class="glossary-header">
      ACRONYM GLOSSARY
      <input class="glossary-search" id="glossary-search" type="text" placeholder="Search\u2026" autocomplete="off" />
    </div>
    <div class="glossary-table-wrap" id="glossary-table-wrap"></div>
  `;

  function render() {
    const wrap = document.getElementById('glossary-table-wrap');
    const filtered = filterTerm
      ? TERMS.filter(t =>
          t.term.toLowerCase().includes(filterTerm) ||
          t.definition.toLowerCase().includes(filterTerm)
        )
      : TERMS;

    // Build table safely — no innerHTML with term/definition data
    const table = document.createElement('table');
    table.className = 'glossary-table';
    const tbody = document.createElement('tbody');
    for (const t of filtered) {
      const tr = document.createElement('tr');
      const tdTerm = document.createElement('td');
      tdTerm.className = 'glossary-term';
      tdTerm.textContent = t.term;
      const tdDef = document.createElement('td');
      tdDef.className = 'glossary-def';
      tdDef.textContent = t.definition;
      tr.appendChild(tdTerm);
      tr.appendChild(tdDef);
      tbody.appendChild(tr);
    }
    if (filtered.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 2;
      td.className = 'glossary-empty';
      td.textContent = 'No matches.';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrap.replaceChildren(table);
  }

  render();

  document.getElementById('glossary-search').addEventListener('input', e => {
    filterTerm = e.target.value.toLowerCase().trim();
    render();
  });
}
