import './styles/main.css';
import { mountHeader }    from './components/header.js';
import { mountLeftPanel } from './components/left-panel.js';
import { mountVideo }     from './components/video.js';
import { mountCrew }      from './components/crew.js';
import { isMissionComplete, SPLASHDOWN_MS, T0_MS, formatMET } from './config.js';

mountHeader(document.getElementById('header'));
mountLeftPanel(document.getElementById('col-timeline'));
mountVideo(document.getElementById('video-wrap'));
mountCrew(document.getElementById('crew-below-video'));

// Post-mission overlay
if (isMissionComplete()) {
  showMissionCompleteOverlay();
}

function showMissionCompleteOverlay() {
  const overlay = document.getElementById('mission-complete-overlay');
  if (!overlay) return;
  const elapsed = formatMET(SPLASHDOWN_MS - T0_MS);
  overlay.querySelector('.mc-met').textContent = `Total Mission Time: ${elapsed}`;
  overlay.classList.add('visible');
}

// ----- Resizable splitters -------------------------------------------
(function initSplitters() {
  const root = document.documentElement;
  const LEFT_DEFAULT  = '340px';
  const LEFT_MIN = 180, LEFT_MAX = 600;
  const VIDEO_H_MIN  = 80;
  const CREW_MIN     = 68;  // keep crew bar always visible
  const LS_LEFT    = 'artemis-left-width';
  const LS_VIDEO_H = 'artemis-video-height';

  // Restore persisted layout
  const savedLeft   = localStorage.getItem(LS_LEFT);
  const savedVideoH = localStorage.getItem(LS_VIDEO_H);
  if (savedLeft)   root.style.setProperty('--left-width', savedLeft);
  if (savedVideoH) {
    const vw = document.getElementById('video-wrap');
    if (vw) vw.style.height = savedVideoH;
  }

  function makeDraggable(el, onDrag, onReset) {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
      const onMove = (mv) => onDrag(mv);
      const onUp   = () => {
        el.classList.remove('dragging');
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup',   onUp);
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup',   onUp);
    });
    el.addEventListener('dblclick', onReset);
  }

  // Vertical splitter → --left-width
  const vSplitter = document.getElementById('splitter-v');
  if (vSplitter) {
    makeDraggable(
      vSplitter,
      (e) => {
        const rect = document.getElementById('columns').getBoundingClientRect();
        const w = Math.max(LEFT_MIN, Math.min(LEFT_MAX, e.clientX - rect.left));
        root.style.setProperty('--left-width', w + 'px');
        localStorage.setItem(LS_LEFT, w + 'px');
      },
      () => {
        root.style.setProperty('--left-width', LEFT_DEFAULT);
        localStorage.removeItem(LS_LEFT);
      }
    );
  }

  // Horizontal splitter → video-wrap height (overrides aspect-ratio when dragged)
  const hSplitter = document.getElementById('splitter-h');
  if (hSplitter) {
    const videoWrap = document.getElementById('video-wrap');
    makeDraggable(
      hSplitter,
      (e) => {
        const rect = document.getElementById('col-video').getBoundingClientRect();
        const maxH = rect.height - CREW_MIN - 5;  // leave room for crew + splitter
        const h = Math.max(VIDEO_H_MIN, Math.min(maxH, e.clientY - rect.top - 2));
        if (videoWrap) videoWrap.style.height = h + 'px';
        localStorage.setItem(LS_VIDEO_H, h + 'px');
      },
      () => {
        if (videoWrap) videoWrap.style.height = '';
        localStorage.removeItem(LS_VIDEO_H);
      }
    );
  }
}());
