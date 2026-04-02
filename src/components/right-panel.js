import { mountRSS }      from './rss.js';
import { mountGlossary } from './glossary.js';

export function mountRightPanel(el) {
  el.innerHTML = `
    <div class="panel-tabs" id="right-tabs">
      <button class="panel-tab active" data-tab="updates">Updates</button>
      <button class="panel-tab"        data-tab="glossary">Glossary</button>
    </div>
    <div class="panel-pane" id="right-pane-updates"></div>
    <div class="panel-pane" id="right-pane-glossary" style="display:none"></div>
  `;

  mountRSS(document.getElementById('right-pane-updates'));
  mountGlossary(document.getElementById('right-pane-glossary'));

  document.getElementById('right-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.panel-tab');
    if (!btn) return;
    const tab = btn.dataset.tab;
    document.querySelectorAll('#right-tabs .panel-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('right-pane-updates').style.display  = tab === 'updates'  ? 'block' : 'none';
    document.getElementById('right-pane-glossary').style.display = tab === 'glossary' ? 'block' : 'none';
  });
}
