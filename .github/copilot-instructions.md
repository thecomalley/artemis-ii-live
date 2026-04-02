# Artemis II Mission Tracker — Project Guidelines

Vanilla JS single-page app that displays a real-time mission dashboard for NASA's Artemis II crewed lunar mission. No frameworks — plain DOM APIs throughout.

## Build & Dev

```
npm run dev      # Vite dev server with HMR
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

One dev dependency (Vite). No test runner. Validate changes manually with `npm run build` (zero warnings/errors expected).

## Architecture

```
src/
  main.js           # Entry point — imports and mounts all components
  config.js         # Mission constants + time utilities (source of truth)
  components/       # Eight independent, self-contained components
  data/milestones.js # 100+ milestone objects (id, label, utc, flightDay, note?)
  styles/main.css   # Single stylesheet (~400 lines)
index.html          # HTML skeleton with mount-point elements
```

## Component Conventions

Every component exports `mountXxx(el)` — receives a DOM element and builds its content:

```js
export function mountTimeline(el) {
  // build DOM into el, set up polling/intervals internally
}
```

- No shared state — each component owns its own timers and state
- Polling via `setInterval(fn, POLL_INTERVAL_MS)` started on mount
- Use `.textContent` (never `.innerHTML`) for any user-facing or API-sourced text to prevent XSS

## Data & Configuration

- `src/config.js` is the **single source of truth** for `T0_MS` (launch epoch), `SPLASHDOWN_MS`, API endpoints, YouTube stream IDs, and poll intervals
- Milestones in `src/data/milestones.js` are plain objects: `{ id, label, utc, flightDay, note? }`
- Crew data and glossary terms are hardcoded in their respective component files

## Styling

- Dark space theme via CSS Custom Properties (e.g. `--color-bg`, `--color-accent`)
- Three-column grid layout: timeline | video | RSS/glossary
- No CSS framework — add new styles to `src/styles/main.css`
- New CSS vars go in the `:root` block at the top of the file

## External Integrations

| Integration     | Detail |
|----------------|--------|
| Launch Library v2 | Mission status badge; ID `41699701-2ef4-4b0c-ac9d-6757820cde87` |
| RSS2JSON bridge | NASA Artemis blog feed (`rss2json.com`); free tier, no `count` param |
| YouTube IFrame API | Loaded lazily via `window.onYouTubeIframeAPIReady`; avoid mounting multiple video components |

## Key Pitfalls

- **Dates are hardcoded** — updating for a new mission requires changes to `config.js` and all milestone `utc` fields in `milestones.js`
- **Client clock** — MET is derived from the user's local clock; no server sync
- **YouTube global** — `window.onYouTubeIframeAPIReady` is a singleton; multiple video mounts conflict
- **RSS bridge** — third-party service; failures are caught but only surfaced as empty feed (no retry)
- **Mission-complete gate** — `isMissionComplete()` from `config.js` controls post-splashdown UI; current date (April 2, 2026) is already past splashdown (April 11, 2026), so the overlay will be visible in dev
