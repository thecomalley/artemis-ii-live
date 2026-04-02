import { RSS_URL, POLL_INTERVAL_MS } from '../config.js';

// NASA feed includes Access-Control-Allow-Origin: * so we fetch it directly.

export function mountRSS(el) {
  el.innerHTML = `
    <div class="rss-header">NASA ARTEMIS UPDATES</div>
    <div class="rss-feed-list">
      ${skeletons(4)}
    </div>
  `;

  const listEl = el.querySelector('.rss-feed-list');
  let lastFirstLink = '';
  const xmlParser = new DOMParser();

  async function fetchFeed() {
    try {
      const res = await fetch(`${RSS_URL}?_=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      const doc = xmlParser.parseFromString(text, 'application/xml');
      if (doc.querySelector('parsererror')) throw new Error('XML parse error');

      const itemEls = [...doc.querySelectorAll('item')];
      if (itemEls.length === 0) {
        showError(listEl, 'No updates found in feed.');
        return;
      }

      const NS_MEDIA   = 'http://search.yahoo.com/mrss/';
      const NS_CONTENT = 'http://purl.org/rss/1.0/modules/content/';
      const NS_DC      = 'http://purl.org/dc/elements/1.1/';

      const items = itemEls.map(item => {
        const getText = tag => item.querySelector(tag)?.textContent?.trim() ?? '';

        // Extract content:encoded once — used for thumbnail fallback and full body text
        const encodedHtml = item.getElementsByTagNameNS(NS_CONTENT, 'encoded')[0]?.textContent ?? '';

        // Extract thumbnail: prefer media:thumbnail/media:content, then first <img> in content:encoded
        let thumbnail = item.getElementsByTagNameNS(NS_MEDIA, 'thumbnail')[0]?.getAttribute('url') ?? '';
        if (!thumbnail) {
          const mc = item.getElementsByTagNameNS(NS_MEDIA, 'content')[0];
          if (mc?.getAttribute('medium') === 'image') thumbnail = mc.getAttribute('url') ?? '';
        }
        if (!thumbnail) {
          const m = encodedHtml.match(/<img[^>]+src="([^"]+)"/);
          if (m) thumbnail = m[1];
        }

        // Strip HTML from description
        const rawDesc  = getText('description');
        const descDoc  = xmlParser.parseFromString(rawDesc, 'text/html');
        const desc     = descDoc.body.textContent?.replace(/\s+/g, ' ').trim() ?? '';

        // Full plain-text body from content:encoded, split into paragraphs.
        // We extract text from each block-level element so paragraph breaks are preserved.
        const bodyDoc  = xmlParser.parseFromString(encodedHtml, 'text/html');
        const fullText = extractParagraphs(bodyDoc.body);

        const author   = item.getElementsByTagNameNS(NS_DC, 'creator')[0]?.textContent?.trim() ?? '';

        return {
          title:   getText('title'),
          link:    getText('link'),
          pubDate: getText('pubDate'),
          author,
          desc,
          fullText,
          thumbnail,
        };
      });

      // Only re-render if the first item changed
      if (items[0].link === lastFirstLink && listEl.children.length > 0 && !listEl.querySelector('.skeleton')) {
        return;
      }
      lastFirstLink = items[0].link;
      renderItems(listEl, items);

    } catch (err) {
      if (listEl.querySelector('.skeleton') || listEl.children.length === 0) {
        showError(listEl, 'Could not load updates. Retrying…');
      }
    }
  }

  fetchFeed();
  setInterval(fetchFeed, POLL_INTERVAL_MS);
}

function renderItems(container, items) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (i === 0) {
      frag.appendChild(renderFeatured(item));
      continue;
    }
    const div = document.createElement('div');
    div.className = 'rss-item';

    // Thumbnail (if present)
    if (item.thumbnail) {
      const img = document.createElement('img');
      img.className = 'rss-thumb';
      img.src = item.thumbnail;
      img.alt = '';
      img.loading = 'lazy';
      img.onerror = () => img.remove();
      div.appendChild(img);
    }

    // Title link
    const a = document.createElement('a');
    a.href = item.link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'rss-title-link';
    const title = document.createElement('div');
    title.className = 'rss-title';
    title.textContent = item.title;
    a.appendChild(title);
    div.appendChild(a);

    // Meta: time + optional author
    const meta = document.createElement('div');
    meta.className = 'rss-meta';
    meta.textContent = item.author
      ? `${relativeTime(item.pubDate)} · ${item.author}`
      : relativeTime(item.pubDate);
    div.appendChild(meta);

    // Description with expand/collapse
    if (item.desc) {
      const TRUNCATE = 200;
      const isLong = item.desc.length > TRUNCATE;
      const preview = isLong ? item.desc.slice(0, TRUNCATE).trimEnd() + '\u2026' : item.desc;

      const descEl = document.createElement('div');
      descEl.className = 'rss-desc';
      descEl.textContent = preview;
      div.appendChild(descEl);

      if (isLong) {
        const toggle = document.createElement('button');
        toggle.className = 'rss-expand-btn';
        toggle.textContent = 'Read more';
        toggle.dataset.expanded = 'false';
        toggle.addEventListener('click', () => {
          const expanded = toggle.dataset.expanded === 'true';
          if (expanded) {
            descEl.textContent = preview;
            toggle.textContent = 'Read more';
            toggle.dataset.expanded = 'false';
          } else {
            descEl.textContent = item.desc;
            toggle.textContent = 'Show less';
            toggle.dataset.expanded = 'true';
          }
        });
        div.appendChild(toggle);
      }
    }

    frag.appendChild(div);
  }
  container.replaceChildren(frag);
}

// Walk block-level elements in an HTML body and return an array of non-empty paragraph strings.
const BLOCK_TAGS = new Set(['P','H1','H2','H3','H4','H5','H6','LI','BLOCKQUOTE','FIGCAPTION','DIV','SECTION','ARTICLE']);
function extractParagraphs(bodyEl) {
  const paras = [];
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) return; // handled via block parents
    if (BLOCK_TAGS.has(node.tagName)) {
      const text = node.textContent?.replace(/\s+/g, ' ').trim();
      if (text) paras.push(text);
      return; // don't recurse into children — textContent already captures them
    }
    for (const child of node.childNodes) walk(child);
  }
  walk(bodyEl);
  return paras.length ? paras : [];
}

function renderFeatured(item) {
  const div = document.createElement('div');
  div.className = 'rss-item rss-item--featured';

  if (item.thumbnail) {
    const img = document.createElement('img');
    img.className = 'rss-thumb';
    img.src = item.thumbnail;
    img.alt = '';
    img.loading = 'eager';
    img.onerror = () => img.remove();
    div.appendChild(img);
  }

  const a = document.createElement('a');
  a.href = item.link;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = 'rss-title-link';
  const title = document.createElement('div');
  title.className = 'rss-title';
  title.textContent = item.title;
  a.appendChild(title);
  div.appendChild(a);

  const meta = document.createElement('div');
  meta.className = 'rss-meta';
  meta.textContent = item.author
    ? `${relativeTime(item.pubDate)} · ${item.author}`
    : relativeTime(item.pubDate);
  div.appendChild(meta);

  const body = document.createElement('div');
  body.className = 'rss-body';
  const paragraphs = item.fullText.length ? item.fullText : [item.desc];
  for (const para of paragraphs) {
    const p = document.createElement('p');
    p.textContent = para;
    body.appendChild(p);
  }
  div.appendChild(body);

  const readMore = document.createElement('a');
  readMore.href = item.link;
  readMore.target = '_blank';
  readMore.rel = 'noopener noreferrer';
  readMore.className = 'rss-read-more';
  readMore.textContent = 'Read full article →';
  div.appendChild(readMore);

  return div;
}

function showError(container, msg) {
  const div = document.createElement('div');
  div.className   = 'rss-error';
  div.textContent = msg;
  container.replaceChildren(div);
}

function relativeTime(pubDateStr) {
  if (!pubDateStr) return '';
  const then = new Date(pubDateStr).getTime();
  if (isNaN(then)) return pubDateStr;
  const diff = Date.now() - then;
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return 'Just now';
  if (min < 60)  return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr  < 24)  return `${hr} hr ago`;
  const d  = Math.floor(hr / 24);
  return `${d} day${d !== 1 ? 's' : ''} ago`;
}

function skeletons(n) {
  return Array.from({ length: n }, () =>
    '<div class="rss-item skeleton"><div class="sk-title"></div><div class="sk-meta"></div><div class="sk-desc"></div></div>'
  ).join('');
}
