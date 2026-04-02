import { STREAMS } from '../config.js';

export function mountVideo(el) {
  let activeStream = 'commentary';
  let player = null;

  el.innerHTML = `
    <div class="video-controls">
      <span class="video-stream-label" id="stream-label">${STREAMS.commentary.label}</span>
      <button class="stream-toggle-btn" id="stream-toggle">Switch to ${STREAMS.orion.label}</button>
    </div>
    <div id="yt-player-container">
      <div id="yt-player"></div>
    </div>
  `;

  // Load YouTube IFrame API
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('yt-player', {
      videoId: STREAMS.commentary.id,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: () => {
          // Player is ready — no autoplay, user initiates
        },
      },
    });
  };

  document.getElementById('stream-toggle').addEventListener('click', () => {
    if (!player) return;
    if (activeStream === 'commentary') {
      activeStream = 'orion';
      player.loadVideoById(STREAMS.orion.id);
      document.getElementById('stream-label').textContent = STREAMS.orion.label;
      document.getElementById('stream-toggle').textContent = `Switch to ${STREAMS.commentary.label}`;
    } else {
      activeStream = 'commentary';
      player.loadVideoById(STREAMS.commentary.id);
      document.getElementById('stream-label').textContent = STREAMS.commentary.label;
      document.getElementById('stream-toggle').textContent = `Switch to ${STREAMS.orion.label}`;
    }
  });
}
