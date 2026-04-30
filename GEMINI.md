# GEMINI.md — NO[FN]WAY Site context

This file provides guidance to Gemini CLI when working in the `NO[FN]WAY_Site/` directory.

## Commands

- **Deploy:** `bash sync.sh` — runs `git add . && git commit -m "FN_SYNC" && git push -u origin main`.
- **Cache Invalidation:** Before deploying content changes, bump `CACHE_NAME` in `sw.js` (e.g. `nofnway-v1` → `nofnway-v2`) so the service worker pushes fresh assets to all users.
- **Service Worker Validation:** After any `sw.js` change:
    1. Open the live site.
    2. Go to DevTools → Application → Service Workers, confirm the new SW activated.
    3. Click at least two tool links to verify navigation works.
    4. Check Application → Cache Storage to confirm cached responses are actual HTML.
- **Preview:** Open any `.html` file directly in a browser.

## Architecture

Pure static HTML/CSS/JS. No framework, no build system, no dependencies except local vendor libs and Google Fonts.

### Shared Infrastructure
- **`theme.css`** — Loaded by every page. Defines CSS variables, component styles, and dark mode.
- **`privacy.js`** — Shared script for the privacy shield popover. Exposes `togglePrivacy()`.
- **`vendor/`** — Local copies of `pdf.js`, `jspdf.umd.js`, etc., for offline use.

### Theme System
Include in `<head>` before stylesheets:
```html
<script>document.documentElement.setAttribute('data-theme', localStorage.getItem('nofnway-theme') || 'light');</script>
```
Dark mode overrides are in `theme.css` under `[data-theme="dark"]`.

### Homepage (`index.html`)
Tool cards are static HTML. To add a tool, add a `<a href="..." class="card">` block.

### Service Worker (`sw.js`)
Pre-caches all static assets. Google Fonts use stale-while-revalidate. **Bump `CACHE_NAME` on every deploy.**

### Privacy Shield Pattern
Every tool page needs:
1. `<button class="privacy-btn" onclick="togglePrivacy()">` in the navbar.
2. `<div id="privacy-panel" class="privacy-panel" hidden>` with tool-specific text.
3. `<script src="privacy.js"></script>` at the bottom.

### Security
- **Strictly No `innerHTML`:** Never use `innerHTML` for user-supplied data; use `textContent` or DOM methods.
- **`copy_that.html` CSP:** Maintain the strict CSP header (`connect-src 'none'`).

### NO Fs TO GIVE Game (`nofs-game/`)
Pattern: User action → `main.js` (handler) → `game.js` (mutation) → `render()` call → `ui.js` (redraw).
- `game.js`: State, logic, turn flow.
- `ui.js`: DOM rendering only (no state).
- `main.js`: Initialization and event bridging.

## Brand & Design

- **Colors:** `--brand: #0057B8`, `--accent: #C62828`, `--gold: #F9A825`.
- **Fonts:** Bangers (headings), Montserrat 900 (subheadings), Roboto (body).
- **Shadows:** Offset only (e.g. `4px 4px 0 var(--brand)`), no blur.
- **Voice:** Personal, dry, vulnerable.
- **[FN]** notation must be preserved.

## Agent Sync

- Read `SYNC.md` before starting.
- Update `SYNC.md` after changes.
- Refer to `lessons.md` for long-term memory.
