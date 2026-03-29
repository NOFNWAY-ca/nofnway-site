---
name: scaffold
description: Scaffold a new NOFNWAY tool. Use when starting a new tool page for nofnway.ca. Creates a complete single-file HTML starting point with full brand compliance.
argument-hint: "[tool name and one-sentence description of what it does]"
user-invocable: true
---

# Scaffold a New NOFNWAY Tool

Create a new single-file HTML tool for nofnway.ca based on the argument provided.

## Requirements

The file must:

1. Follow the filename convention: `lowercase_with_underscores.html`
2. Include the theme flash-prevention script as the first thing in `<head>`:
   ```html
   <script>document.documentElement.setAttribute('data-theme', localStorage.getItem('nofnway-theme') || 'light');</script>
   ```
3. Link to `theme.css` and `privacy.js` (shared site files)
4. Include the standard navbar with:
   - NOFNWAY logo/home link
   - Privacy button: `<button class="privacy-btn" onclick="togglePrivacy()">PRIVACY</button>`
5. Include the privacy panel: `<div id="privacy-panel" class="privacy-panel" hidden>`
   - Privacy text must accurately describe what data the tool touches (or doesn't)
6. Use CSS custom properties from `theme.css` -- never hardcode brand colors
7. Include a footer consistent with other tool pages
8. All JS inline before `</body>`
9. No frameworks, no external dependencies except Google Fonts (already in theme.css)

## Brand Rules

- Bangers font for any display headings
- Offset shadows only: e.g. `4px 4px 0 var(--brand)`
- Voice: dry, direct, personal. Never corporate.
- `[FN]` notation is the implicit swear -- use it where appropriate, never replace with actual profanity

## After Creating

Remind Gerry to:
1. Add a card to `index.html` manually
2. Bump `CACHE_NAME` in `sw.js` before deploying
3. Test the service worker after deploy
