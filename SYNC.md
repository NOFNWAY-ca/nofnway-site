# NOFNWAY Site Sync

## Status
Primary live site at `nofnway.ca`.

## Working Rules
- Confirm before deploying.
- Bump `CACHE_NAME` in `sw.js` before content deploys.
- Verify service worker activation after `sw.js` changes.

## Recent Changes
- Added `just_write.html`, a browser-only distraction-free writing surface where typed words fade, older words lock outside the editable window, sessions save as localStorage blurbs, and blurbs can be copied, deleted, or exported as text.
- Added the `JUST [FN] WRITE` homepage card, sitemap entry, service worker cache entry, and bumped `sw.js` to `nofnway-v39`.
- Added gentler landing-state spacing and centered intro lines to `let_me_talk.html` and `help_me_listen.html`, and bumped `sw.js` to `nofnway-v38`.
- Added optional `Why people say this` expandable notes after LISTEN reflections, tied to each speaker turn rather than scoring or correct answers.
- Added optional `Conversation starters` chips to `let_me_talk.html` so users can insert bracketed opening lines under the context field without using templates or scripts.
- Added `let_me_talk.html`, a browser-only conversation alignment card tool with mode selection, optional context, helper lines, fullscreen, copy, native share support, theme and font selectors, privacy panel, metadata, and service worker registration.
- Added `help_me_listen.html`, a browser-only active listening practice tool with six realistic scenarios, reflective response feedback, no scoring, no storage, privacy panel, metadata, and service worker registration.
- Added a new homepage category, `Connect & Communicate`, with cards for `LET ME [FN] TALK` and `HELP ME [FN] LISTEN`.
- Added both new pages to `sitemap.xml` and `sw.js`, and bumped `CACHE_NAME` to `nofnway-v37`.
- Bumped `sw.js` to `nofnway-v36` for the `[FN] FIDGET` Ripple trail deploy.
- Smoothed `[FN] FIDGET` Ripple trails with capped DPR canvas rendering, interpolated drag particles between pointer events, slower particle drift, and recycled particle slots after the 300-particle cap to avoid memory growth.
- Upgraded the `[FN] FIDGET` Ripple tab with a dark canvas field, semi-transparent fade overlay, capped sparkler-style trail particles on drag/touch, tap bursts that preserve the original ripple rings, and cleanup after inactivity.
- Updated `accountabilibugs.html` setup/done copy per Gerry's exact text, and bumped `sw.js` to `nofnway-v35` for deploy.
- Polished `accountabilibugs.html` for release: rebuilt the setup panel, replaced the shoddy bug scene with a branded workbench scene, upgraded the bug SVG art, added visible activity labels, improved the timer treatment, and bumped `sw.js` to `nofnway-v34`.
- Added shared `bug-report.js` and a fixed "Report bug" mailto button to the public tool pages, with `theme.css` styling and `sw.js` bumped to `nofnway-v33`.
- `accountabilibugs.html` is live-ready: added the homepage card, tightened mobile/nav layout, restored user zoom, added reduced-motion handling, made hold-to-stop work from keyboard, and bumped `sw.js` to `nofnway-v32`.
- `jpeger.html` now has output sharpness and JPEG quality controls, sanitized/padded download filenames, per-page size labels, a conversion summary, safer white page backgrounds for transparent PDFs, a canvas-size guard, and cleaner mobile viewport behavior.
- Added `MEMORY.md` as the fuller NOFNWAY voice/design reference for future sessions, covering tone, visual identity, interaction rules, privacy language, anti-patterns, and in-repo examples to follow.
- Rebuilt `pdfer.html` into a stronger NOFNWAY tool with a branded hero, theme toggle, local-save messaging, paper-size and fit controls, multi-photo intake, dedicated camera button, device-only draft workflow, clearer page stats, and stronger mobile layout.
- `pdfer.html` page management now supports move up/down, duplicate, per-page status chips, and cleaner card-based previews instead of the old thin list rows.
- `pdfer.html` editor flow keeps non-destructive crop and redaction editing, with the first save of a newly captured page now correctly preserving crop/redaction edits instead of dropping them.
- Deleted caylie-simple.html, caylie-standard.html, caylie-complex.html (demo files for a friend, not linked, should not have been publicly accessible).
- Added full sources section and copyright footer to `right-questions/index.html` (7 screeners cited with author credits and links where available).
- Added per-page attribution footer to all 7 screener pages (phq9, gad7, asrs, aq10, ocir, mdq, pcl5) with screener-specific credit and NOFNWAY copyright.
- Added `rq-footer` and `rq-sources` CSS to `right-questions/styles.css`.
- `magnet.html` now includes local draft restore, duplicate tile, quick-build pasted lists, starter sets, and multi-page project support with named pages plus current/all print scope.
- `magnet.html` print flow now includes optional cut-guide outlines and a 1-inch calibration square for print-size verification.
- `magnet.html` page manager now supports moving pages earlier/later inside the same project so multi-board routines can be reordered without rebuilding them.
- `magnet.html` now shows a visible page strip of clickable page chips so multi-page projects can be scanned and switched faster than a dropdown alone.
- `sleep_math.html` now has a stronger hero, keyboard-accessible mode toggles and result buttons, clearer input validation, best-result emphasis, softer estimation copy, and DOM-built result cards instead of `innerHTML`.

## Next Recommended Step
- Before deploying, recheck `accountabilibugs.html` on desktop and mobile width, then verify start, pause/resume, hide timer, sound toggle, hold-to-stop by pointer and keyboard, natural finish, privacy panel, theme toggle, and homepage navigation.
