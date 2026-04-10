/* ============================================================
   NOFNWAY Service Worker
   Cache version — bump CACHE_NAME on every deploy to push
   updates to users: e.g. nofnway-v1 → nofnway-v2
   ============================================================ */

const CACHE_NAME = 'nofnway-v27';

/* Pre-cached on install — all HTML, CSS, JS, SVG.
   Images are cached on first access (see fetch handler). */
const PRECACHE = [
    '/',
    '/theme.css',
    '/privacy.js',
    '/favicon.svg',
    '/og-image.svg',
    '/og-image.png',

    /* Tool pages — extension-free (Cloudflare Pages serves these directly) */
    '/jpeger',
    '/pdfer',
    '/how_long',
    '/how_much',
    '/get_lost',
    '/magnet',
    '/copy_that',
    '/fidget',
    '/dial_in',
    '/one_thing',
    '/sleep_math',
    '/just_pick',
    '/duly_noted',
    '/i_knew_that',
    '/this_works_at_school',
    '/accountabilibugs',
    '/about',

    /* Right Questions screeners */
    '/right-questions/',
    '/right-questions/styles.css',
    '/right-questions/phq9',
    '/right-questions/gad7',
    '/right-questions/asrs',
    '/right-questions/aq10',
    '/right-questions/mdq',
    '/right-questions/ocir',
    '/right-questions/pcl5',

    /* Vendor libs */
    '/vendor/pdf.min.js',
    '/vendor/pdf.worker.min.js',
    '/vendor/jspdf.umd.min.js',

    /* Game */
    '/nofs-game/',
    '/nofs-game/card-sandbox',
    '/nofs-game/print-layout',
    '/nofs-game/rulebook',
    '/nofs-game/css/styles.css',
    '/nofs-game/css/print-styles.css',
    '/nofs-game/css/rulebook-styles.css',
    '/nofs-game/js/game.js',
    '/nofs-game/js/ui.js',
    '/nofs-game/js/main.js',
    '/nofs-game/js/ai.js',
    '/nofs-game/js/data/rules.js',
    '/nofs-game/js/data/tasks.js',
    '/nofs-game/js/print-builder.js',
    '/nofs-game/js/rulebook-builder.js',
];

/* ── Install: pre-cache static assets ── */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            /* addAll per-file so a single 404 doesn't abort everything */
            Promise.all(
                PRECACHE.map(url =>
                    cache.add(url).catch(() => {
                        console.warn('[SW] Failed to pre-cache:', url);
                    })
                )
            )
        ).then(() => self.skipWaiting())
    );
});

/* ── Activate: delete stale caches, claim all clients ── */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

/* ── Fetch ── */
self.addEventListener('fetch', event => {
    const { request } = event;

    /* Only handle GET */
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    /* Google Fonts: stale-while-revalidate */
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    /* External requests: pass through */
    if (url.origin !== self.location.origin) return;

    /* HTML navigation: network-first so pages are always fresh.
       Falls back to cache when offline, then to 404.html. */
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).then(response => {
                if (response.ok) {
                    caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
                }
                return response;
            }).catch(() =>
                caches.match(request).then(cached => cached || caches.match('/'))
            )
        );
        return;
    }

    /* Static assets (CSS, JS, images): cache-first, network fallback */
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (response && response.ok) {
                    caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
                }
                return response;
            });
        })
    );
});

/* ── Stale-while-revalidate helper ── */
function staleWhileRevalidate(request) {
    return caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
            const networkFetch = fetch(request).then(response => {
                if (response && response.ok) {
                    cache.put(request, response.clone());
                }
                return response;
            }).catch(() => cached);

            return cached || networkFetch;
        })
    );
}
