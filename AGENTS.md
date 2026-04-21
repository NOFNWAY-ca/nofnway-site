# AGENTS.md

## Commands

- **Deploy:** `bash sync.sh` -- runs `git add . && git commit -m "FN_SYNC" && git push -u origin main`
- **Before deploying content changes:** bump `CACHE_NAME` in `sw.js` (e.g. `nofnway-v1` -> `nofnway-v2`) so the service worker pushes fresh assets to all users
- **After any `sw.js` change:** open the live site, go to DevTools -> Application -> Service Workers, confirm the new SW activated, then click at least two tool links to verify navigation works. Also check Application -> Cache Storage to confirm cached responses are actual HTML. Do this before moving on.
- **Preview locally:** Open any `.html` file directly in a browser -- no build step needed
- **No test suite, no linter, no package manager** -- this is pure static HTML/CSS/JS

## Architecture

No framework, no build system, no dependencies except local vendor libs and Google Fonts. Every tool is a self-contained `.html` file.

### Shared Infrastructure
- **`theme.css`** -- loaded by every page. Defines all CSS custom properties (`--brand`, `--accent`, `--gold`, etc.), component styles (navbar, cards, hero, privacy panel, footer), and `[data-theme="dark"]` overrides.
- **`privacy.js`** -- shared script for the privacy shield popover present in every tool page. Exposes `togglePrivacy()` and handles click-outside + Escape to close.
- **`vendor/`** -- local copies of pdf.js, pdf.worker.js, jspdf.umd.js for offline capability.

### Theme System
Every page must include this in `<head>` before any stylesheet to prevent flash-of-wrong-theme:
```html
<script>document.documentElement.setAttribute('data-theme', localStorage.getItem('nofnway-theme') || 'light');</script>
```
Theme is toggled via `localStorage.setItem('nofnway-theme', next)` + `data-theme` attribute on `<html>`. Dark mode overrides are in `theme.css` under `[data-theme="dark"]`.

### Homepage (`index.html`)
Tool cards are static HTML in `#main-content` -- no JS renderer. To add a tool, add a `<a href="..." class="card">` block directly in the grid. Coming Soon placeholders use `<div class="card card-coming-soon">` (non-clickable, dimmed). The `GET LOST` card includes `<div class="net-badge">Requires internet</div>`.

### Service Worker (`sw.js`)
Registered on all 14 public pages via `<script>if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});</script>` in `<head>`. Pre-caches all HTML/CSS/JS/SVG on install; caches images on first access. Google Fonts use stale-while-revalidate. External API calls (get_lost routing) pass through unmodified. **Bump `CACHE_NAME` on every deploy** -- this is the only mechanism for pushing updates to cached users.

### Privacy Shield Pattern
Every tool page needs:
1. A `<button class="privacy-btn" onclick="togglePrivacy()">` in the navbar
2. A `<div id="privacy-panel" class="privacy-panel" hidden>` with per-tool disclosure text
3. `<script src="privacy.js"></script>` at the bottom

CSS for both lives in `theme.css`.

### Security Rule (Copy That / user-data tools)
Never use `innerHTML` to render user-supplied data -- use `textContent` or DOM methods. `copy_that.html` also has a strict CSP header (`connect-src 'none'`) that blocks all network requests; maintain this when editing that file.

### NO Fs TO GIVE Game (`nofs-game/`)
Multi-file vanilla JS game. Module responsibilities:
- **`game.js`** -- `Game` class: all state, logic, deck management, turn flow
- **`ui.js`** -- all DOM rendering; reads from `game` object, never holds state
- **`main.js`** -- event handlers and initialization; bridges UI events to `game` methods
- **`ai.js`** -- opponent AI logic
- **`data/tasks.js`** / **`data/rules.js`** -- static game data (task cards, F-cards, conditions)
- **`print-builder.js`** / **`rulebook-builder.js`** -- print layout generators

The pattern is: user action -> `main.js` handler -> `game.js` mutation -> `render()` call -> `ui.js` redraws everything. Don't store derived state in `ui.js`.

## Brand & Design Rules

Always check `MEMORY.md` for full voice and visual guidelines. Short version:
- **Colors:** `--brand: #0057B8` (Superman blue), `--accent: #C62828` (red), `--gold: #F9A825`
- **Fonts:** Bangers for brand/display headings, Montserrat 900 for subheadings, Roboto for body
- **Shadows:** Offset (e.g. `4px 4px 0 var(--brand)`), never blur-based
- **Voice:** Personal and dry, never corporate or preachy. Lead with vulnerability. Match the About strip tone.
- **[FN]** notation is the implicit swear -- preserve it, don't replace it with actual profanity or sanitize it away

## Agent Sync

- Read `SYNC.md` before starting work.
- Update `SYNC.md` after meaningful changes so Codex and Claude share the current state.

## See also: lessons.md, SYNC.md
