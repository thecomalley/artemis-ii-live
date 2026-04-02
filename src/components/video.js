import { AROW_TRACKER_URL, STREAMS } from '../config.js';

export function mountVideo(el) {
  let activeTab = 'commentary';
  let activeStream = null;
  let player = null;
  let ytApiPromise = null;

  el.innerHTML = `
    <div class="video-tabs-layout">
      <div class="panel-tabs" id="video-tabs">
        <button class="panel-tab active" data-tab="commentary">${STREAMS.commentary.label}</button>
        <button class="panel-tab" data-tab="orion">${STREAMS.orion.label}</button>
        <button class="panel-tab" data-tab="tracker">AROW Tracker</button>
      </div>
      <div id="video-pane-wrap">
        <div class="panel-pane" id="video-pane-stream">
          <div id="yt-player-container">
            <div id="yt-player"></div>
          </div>
        </div>
        <div class="panel-pane" id="video-pane-tracker" style="display:none">
          <iframe
            class="tracker-frame"
            src="${AROW_TRACKER_URL}"
            title="Artemis II AROW Tracker"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  `;

  function loadYouTubeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (ytApiPromise) return ytApiPromise;

    ytApiPromise = new Promise((resolve) => {
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (typeof prevReady === 'function') prevReady();
        resolve();
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    });
    return ytApiPromise;
  }

  async function ensurePlayerFor(streamKey) {
    if (streamKey !== 'commentary' && streamKey !== 'orion') return;
    await loadYouTubeApi();

    if (!player) {
      player = new YT.Player('yt-player', {
        videoId: STREAMS[streamKey].id,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
      });
      activeStream = streamKey;
      return;
    }

    if (activeStream !== streamKey) {
      player.loadVideoById(STREAMS[streamKey].id);
      activeStream = streamKey;
    }
  }

  function setActiveTab(tab) {
    activeTab = tab;
    document.querySelectorAll('#video-tabs .panel-tab').forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === tab);
    });

    const showTracker = tab === 'tracker';
    document.getElementById('video-pane-stream').style.display = showTracker ? 'none' : 'block';
    document.getElementById('video-pane-tracker').style.display = showTracker ? 'block' : 'none';

    if (!showTracker) {
      ensurePlayerFor(tab);
    }
  }

  document.getElementById('video-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('.panel-tab');
    if (!button) return;

    const tab = button.dataset.tab;
    if (!tab || tab === activeTab) return;
    setActiveTab(tab);
  });

  setActiveTab('commentary');
}
