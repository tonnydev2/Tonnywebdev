/* ============================================================
   Lantern service worker — offline shell caching.
   Cache-first for local assets; network-first for the Supabase SDK.
   ============================================================ */

const CACHE = 'lantern-v1';

/* The shell and every module. Adjust paths if you reorganize. */
const CORE = [
    './',
    './index.html',
    './styles/style.css',
    './scripts/main.js',
    './scripts/config.js',
    './scripts/dom.js',
    './scripts/state.js',
    './scripts/storage.js',
    './scripts/highlighters.js',
    './scripts/render.js',
    './scripts/tabs.js',
    './scripts/pairing.js',
    './scripts/autocomplete.js',
    './scripts/filename-dialog.js',
    './scripts/find.js',
    './scripts/find-highlight.js',
    './scripts/files.js',
    './scripts/assets.js',
    './scripts/preview.js',
    './scripts/console-pannel.js',
    './scripts/bracket-match.js',
    './scripts/cloud.js',
    './scripts/cloud-ui.js',
    './scripts/overflow.js',
    './scripts/shortcutBar.js',
    './scripts/pwa.js',
    './scripts/bracket-match.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(CORE).catch(() => {
            /* Some modules may not exist yet; the SW still installs. */
        }))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    /* Let Supabase (auth + data) always go to the network. If it
       fails, fall through to the cache — the app will just report
       offline. Do not cache the responses. */
    if (url.hostname.endsWith('.supabase.co')) {
        event.respondWith(fetch(req).catch(() => new Response('', { status: 503 })));
        return;
    }

    /* The Supabase SDK module from esm.sh — cache it after first load. */
    if (url.hostname === 'esm.sh') {
        event.respondWith(
            caches.open(CACHE).then(cache =>
                cache.match(req).then(hit => {
                    if (hit) return hit;
                    return fetch(req).then(res => {
                        /* Only cache successful, basic-type responses. */
                        if (res.ok) cache.put(req, res.clone());
                        return res;
                    });
                })
            )
        );
        return;
    }

    /* Everything else: cache-first, network fallback. */
    event.respondWith(
        caches.match(req).then(hit => {
            if (hit) return hit;
            return fetch(req).then(res => {
                if (res.ok && url.origin === self.location.origin) {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(req, copy));
                }
                return res;
            }).catch(() => caches.match('./index.html'));
        })
    );
});

