/* ============================================================
   Lantern service worker:
     1. Cache the shell for offline use.
     2. Serve the current project's files as a virtual webserver
        under /__lantern__/<projectId>/<path>.
   ============================================================ */

const CACHE = 'lantern-v7';   /* bumped again — force refresh */

const CORE = [
    './',
    './index.html',
    './manifest.webmanifest',
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
    './scripts/inline-lang.js',
    './scripts/cloud.js',
    './scripts/overflow.js',
    './scripts/shortcutBar.js',
    './scripts/pwa.js',
    './scripts/projects.js',
    './scripts/sw-fs.js',
];

/* ---------- Snapshot storage ---------- */
let snapshot = { projects: {}, activeProjectId: null };

self.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.__lantern !== 'snapshot') return;
    snapshot = data.snap || { projects: {}, activeProjectId: null };
});

/* ---------- MIME types ---------- */
function mimeFor(path) {
    const ext = (path.split('.').pop() || '').toLowerCase();
    switch (ext) {
        case 'html': return 'text/html; charset=utf-8';
        case 'htm':  return 'text/html; charset=utf-8';
        case 'js':   return 'text/javascript; charset=utf-8';
        case 'mjs':  return 'text/javascript; charset=utf-8';
        case 'css':  return 'text/css; charset=utf-8';
        case 'json': return 'application/json; charset=utf-8';
        case 'svg':  return 'image/svg+xml';
        case 'png':  return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'gif':  return 'image/gif';
        case 'webp': return 'image/webp';
        case 'ico':  return 'image/x-icon';
        case 'mp3':  return 'audio/mpeg';
        case 'mp4':  return 'video/mp4';
        case 'wav':  return 'audio/wav';
        case 'woff': return 'font/woff';
        case 'woff2':return 'font/woff2';
        case 'ttf':  return 'font/ttf';
        case 'txt':  return 'text/plain; charset=utf-8';
        default:     return 'application/octet-stream';
    }
}

/* ---------- Project file lookup ---------- */
function lookupProjectFile(projectId, path) {
    const clean = path.replace(/^\/+/, '').split('?')[0].split('#')[0];
    const proj = snapshot.projects[projectId];
    if (!proj) return null;
    const file = proj[clean];
    if (!file) return null;
    return file;
}

/* ---------- Console prelude injection ---------- */
function injectConsolePrelude(html) {
    if (html.includes('__lantern_console_prelude__')) return html;

    const prelude = `<script data-lantern-console="__lantern_console_prelude__">
    (function(){
        if (window.__lanternConsoleInstalled) return;
        window.__lanternConsoleInstalled = true;

        var send = function(level, args){
            try {
                var payload = Array.prototype.slice.call(args).map(function(a){
                    if (a instanceof Error) {
                        return { __err: true, name: a.name, message: a.message, stack: a.stack };
                    }
                    try {
                        JSON.stringify(a);
                        return a;
                    } catch (e) {
                        return String(a);
                    }
                });
                parent.postMessage({ __lantern: 'console', level: level, args: payload }, '*');
            } catch (e) { /* ignore */ }
        };

        ['log','info','warn','error','debug'].forEach(function(level){
            var orig = console[level] ? console[level].bind(console) : function(){};
            console[level] = function(){
                send(level, arguments);
                try { orig.apply(console, arguments); } catch (e) {}
            };
        });

        window.addEventListener('error', function(e){
            var loc = (e.filename || '') + ':' + (e.lineno || 0) + ':' + (e.colno || 0);
            send('error', [ (e.message || 'Error') + ' (' + loc + ')' ]);
        });

        window.addEventListener('unhandledrejection', function(e){
            var r = e.reason;
            var msg = r && r.message ? r.message : String(r);
            send('error', [ 'Unhandled promise rejection: ' + msg ]);
        });
    })();
    <\/script>`;

    const headOpen = /<head\b[^>]*>/i;
    const m = html.match(headOpen);
    if (m) {
        const idx = m.index + m[0].length;
        return html.slice(0, idx) + prelude + html.slice(idx);
    }

    const htmlOpen = /<html\b[^>]*>/i;
    const m2 = html.match(htmlOpen);
    if (m2) {
        const idx = m2.index + m2[0].length;
        return html.slice(0, idx) + prelude + html.slice(idx);
    }

    return prelude + html;
}

/* ---------- Install / activate ---------- */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(CORE).catch(() => {}))
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

/* ---------- Fetch interception ---------- */
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    /* ---- Virtual project files: .../__lantern__/<projectId>/<path> ---- */
    /* Note: no leading ^ so it matches /Tonnoi-Code-Editor/__lantern__/... */
    const m = url.pathname.match(/\/__lantern__\/([^/]+)\/(.*)$/);
    if (m) {
        const projectId = decodeURIComponent(m[1]);
        const inner     = decodeURIComponent(m[2]);
        const file      = lookupProjectFile(projectId, inner);

        if (!file) {
            if (inner === '' || inner === 'index.html') {
                const index = lookupProjectFile(projectId, 'index.html');
                if (index) {
                    event.respondWith(new Response(index.content, {
                        headers: { 'Content-Type': 'text/html; charset=utf-8' },
                    }));
                    return;
                }
            }
            event.respondWith(new Response(
                `/* Lantern: file "${inner}" not found in project */`,
                { status: 404, headers: { 'Content-Type': 'text/plain' } }
            ));
            return;
        }

        let body = file.content;
        const mime = mimeFor(inner);
        if (/^text\/html/i.test(mime)) {
            body = injectConsolePrelude(body);
        }

        event.respondWith(new Response(body, {
            headers: {
                'Content-Type': mime,
                'Cache-Control': 'no-store',
            },
        }));
        return;
    }

    /* ---- Supabase: never cache ---- */
    if (url.hostname.endsWith('.supabase.co')) {
        event.respondWith(fetch(req).catch(() => new Response('', { status: 503 })));
        return;
    }

    /* ---- Supabase SDK from esm.sh: cache after first fetch ---- */
    if (url.hostname === 'esm.sh') {
        event.respondWith(
            caches.open(CACHE).then(cache =>
                cache.match(req).then(hit => {
                    if (hit) return hit;
                    return fetch(req).then(res => {
                        if (res.ok) cache.put(req, res.clone());
                        return res;
                    });
                })
            )
        );
        return;
    }

    /* ---- Everything else: cache-first with network fallback ---- */
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