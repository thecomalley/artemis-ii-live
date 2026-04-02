import { mountTimeline } from './timeline.js';
import { mountRSS }      from './rss.js';
import { mountGlossary } from './glossary.js';

export function mountLeftPanel(el) {
  el.innerHTML = `
    <div class="panel-tabs" id="left-tabs">
      <button class="panel-tab active" data-tab="timeline">Timeline</button>
      <button class="panel-tab"        data-tab="updates">Updates</button>
      <button class="panel-tab"        data-tab="glossary">Glossary</button>
    </div>
    <div id="left-pane-wrap">
      <div class="panel-pane" id="left-pane-timeline"></div>
      <div class="panel-pane" id="left-pane-updates"  style="display:none"></div>
      <div class="panel-pane" id="left-pane-glossary" style="display:none"></div>
    </div>
  `;

  mountTimeline(document.getElementById('left-pane-timeline'));
  mountRSS(document.getElementById('left-pane-updates'));
  mountGlossary(document.getElementById('left-pane-glossary'));

  document.getElementById('left-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.panel-tab');
    if (!btn) return;
    const tab = btn.dataset.tab;
    document.querySelectorAll('#left-tabs .panel-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('left-pane-timeline').style.display = tab === 'timeline' ? 'block' : 'none';
    document.getElementById('left-pane-updates').style.display  = tab === 'updates'  ? 'block' : 'none';
    document.getElementById('left-pane-glossary').style.display = tab === 'glossary' ? 'block' : 'none';
  });
}
