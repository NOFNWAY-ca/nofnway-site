# NOFNWAY Site Sync

## Status
Primary live site at `nofnway.ca`.

## Working Rules
- Confirm before deploying.
- Bump `CACHE_NAME` in `sw.js` before content deploys.
- Verify service worker activation after `sw.js` changes.

## Recent Changes
- `jpeger.html` now has output sharpness and JPEG quality controls, sanitized/padded download filenames, per-page size labels, a conversion summary, safer white page backgrounds for transparent PDFs, a canvas-size guard, and cleaner mobile viewport behavior.
- Deleted caylie-simple.html, caylie-standard.html, caylie-complex.html (demo files for a friend, not linked, should not have been publicly accessible).
- Added full sources section and copyright footer to `right-questions/index.html` (7 screeners cited with author credits and links where available).
- Added per-page attribution footer to all 7 screener pages (phq9, gad7, asrs, aq10, ocir, mdq, pcl5) with screener-specific credit and NOFNWAY copyright.
- Added `rq-footer` and `rq-sources` CSS to `right-questions/styles.css`.
- `magnet.html` now includes local draft restore, duplicate tile, quick-build pasted lists, starter sets, and multi-page project support with named pages plus current/all print scope.

## Next Recommended Step
- Preview `magnet.html` in a browser and verify page switching, add/duplicate/delete, current-vs-all printing, quick-build, draft restore, duplicate tile, undo/redo, save/load, and transparent PNG handling before any deploy.
