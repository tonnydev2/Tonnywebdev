/* ============================================================
   HTML Preview — serves the current HTML tab from the Service
   Worker virtual filesystem so <script src>, <link href>, and
   ES module imports all resolve inside the current project.
   ============================================================ */
import { input } from './dom.js';
import {
    tabsByProject, projectFiles, getActiveProjectId, getActiveProject,
} from './state.js';
import { getActiveTab } from './tabs.js';
import { consolePrelude, closeConsole } from './console-pannel.js';
import { pushSnapshot } from './sw-fs.js';

const pane            = document.getElementById('previewPane');
const frame           = document.getElementById('previewFrame');
const titleEl         = document.getElementById('previewTitle');
const reloadBtn       = document.getElementById('previewReloadBtn');
const closeBtn        = document.getElementById('previewCloseBtn');
const runBtn          = document.getElementById('runBtn');
const externalBtn     = document.getElementById('previewExternalBtn');
const openBrowserBtn  = document.getElementById('openBrowserBtn');
const deviceBtn       = document.getElementById('previewDeviceBtn');
const deviceMenu      = document.getElementById('previewDeviceMenu');

let liveReloadTimer = null;
let isOpen = false;
let currentDevice = 'full';

export function isPreviewOpen() { return isOpen; }

/* ---------- Ensure the SW has an up-to-date snapshot ---------- */
function syncSnapshot() {
    pushSnapshot();
}

/* ---------- Build the preview URL ---------- */
/* Format: /__lantern__/<projectId>/<path> */
function projectFileUrl(projectId, path) {
    /* Resolve the app's base path, e.g. /Tonnoi-Code-Editor/ */
    const base = new URL('./', location.href).pathname;   /* "/Tonnoi-Code-Editor/" */
    return `${base}__lantern__/${encodeURIComponent(projectId)}/${encodeURI(path)}`;
}

function previewUrl() {
    const tab = getActiveTab();
    if (!tab || tab.lang !== 'html') return null;
    const projectId = getActiveProjectId();
    if (!projectId) return null;
    /* If we're on a tab that isn't the project's index.html, we still
       serve it by name. */
    return projectFileUrl(projectId, tab.name);
}

/* ---------- Render ---------- */
export function renderPreview() {
    if (!isOpen) return;

    /* Push latest content to the SW before reloading. */
    syncSnapshot();

    const url = previewUrl();
    if (!url) {
        frame.srcdoc = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: system-ui, sans-serif; background:#0d1014; color:#d8dee9;
         display:flex; align-items:center; justify-content:center; height:100vh;
         margin:0; text-align:center; padding:20px; }
  code { background:#1b1f26; padding:2px 6px; border-radius:3px; color:#e8b04b; }
</style></head>
<body>
  <div>
    <p>Nothing to preview — open an <code>.html</code> tab first.</p>
  </div>
</body></html>`;
        return;
    }

    /* Force a fresh fetch by adding a cache-buster. */
    const bust = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    frame.src = bust;
}

/* ---------- Open / close ---------- */

export function openPreview() {
    const active = getActiveTab();
    if (!active || active.lang !== 'html') {
        const pid = getActiveProjectId();
        const tabs = (tabsByProject[pid] || []);
        const htmlTab = tabs.find(t => t.lang === 'html');
        if (htmlTab) {
            import('./tabs.js').then(m => {
                m.switchToTab(htmlTab.id);
                setTimeout(renderPreview, 0);
            });
        }
    }
    /* ... rest unchanged ... */
    isOpen = true;
    pane.hidden = false;
    document.body.classList.add('preview-open');

    const tab = getActiveTab();
    titleEl.textContent = tab ? tab.name : 'preview';

    applyDevice(currentDevice);
    renderPreview();
    setTimeout(renderPreview, 0);

    attachLiveReload();
}

export function closePreview() {
    isOpen = false;
    pane.hidden = true;
    document.body.classList.remove('preview-open');
    frame.src = 'about:blank';
    detachLiveReload();
    closeConsole();
}

/* ---------- Open in browser ---------- */
export function openInBrowser() {
    /* We can't easily export the project as a set of URLs, so fall
       back to building a single self-contained document via srcdoc
       — no imports, no src references. */
    const tab = getActiveTab();
    if (!tab || tab.lang !== 'html') {
        alert('Open an HTML file first.');
        return;
    }
    const projectId = getActiveProjectId();
    const files = projectFiles[projectId] || {};

    /* Inline every <script src> and <link href> from the same project. */
    let html = tab.content;
    html = html.replace(/<link\b[^>]*?rel=["']stylesheet["'][^>]*?>/gi, (tag) => {
        const m = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i);
        if (!m) return tag;
        const f = files[m[1].replace(/^\.\//, '')];
        if (!f || f.lang !== 'css') return tag;
        return `<style>\n${f.content.replace(/<\/style/gi, '<\\/style')}\n</style>`;
    });
    html = html.replace(
        /<script\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
        (tag, a1, src, a2) => {
            const f = files[src.replace(/^\.\//, '')];
            if (!f || f.lang !== 'js') return tag;
            const code = f.content.replace(/<\/script/gi, '<\\/script');
            const attrs = (a1 + ' ' + a2).replace(/\bsrc\s*=\s*["'][^"']*["']/i, '').trim();
            return `<script ${attrs}>${code}</script>`;
        }
    );

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/* ---------- Device toggling ---------- */
const DEVICES = {
    full:   { label: 'Full width', width: null,  height: null },
    iphone: { label: 'iPhone',     width: 390,   height: 844 },
    ipad:   { label: 'iPad',       width: 820,   height: 1180 },
    pixel:  { label: 'Pixel',      width: 412,   height: 915 },
};

function applyDevice(key) {
    currentDevice = key;
    const d = DEVICES[key];
    const wrapper = frame.parentElement;

    if (!d.width) {
        wrapper.classList.remove('device-frame');
        wrapper.style.removeProperty('--device-w');
        wrapper.style.removeProperty('--device-h');
        deviceBtn.textContent = '🖥 Full';
    } else {
        wrapper.classList.add('device-frame');
        wrapper.style.setProperty('--device-w', d.width + 'px');
        wrapper.style.setProperty('--device-h', d.height + 'px');
        deviceBtn.textContent = '📱 ' + d.label;
    }

    if (deviceMenu) {
        deviceMenu.querySelectorAll('[data-device]').forEach(el => {
            el.classList.toggle('active', el.dataset.device === key);
        });
    }
}

/* ---------- Live reload ---------- */
function scheduleLiveReload() {
    if (!isOpen) return;
    clearTimeout(liveReloadTimer);
    reloadBtn.classList.add('reloading');
    liveReloadTimer = setTimeout(() => {
        reloadBtn.classList.remove('reloading');
        renderPreview();
    }, 500);
}
function onEditorInput() { if (isOpen) scheduleLiveReload(); }
function attachLiveReload() { input.addEventListener('input', onEditorInput); }
function detachLiveReload() {
    input.removeEventListener('input', onEditorInput);
    clearTimeout(liveReloadTimer);
    reloadBtn.classList.remove('reloading');
}

/* ---------- Wire up ---------- */
export function initPreview() {
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            if (isOpen) closePreview();
            else openPreview();
        });
    }
    reloadBtn.addEventListener('click', () => {
        clearTimeout(liveReloadTimer);
        reloadBtn.classList.remove('reloading');
        renderPreview();
    });
    closeBtn.addEventListener('click', closePreview);

    if (externalBtn) {
        externalBtn.addEventListener('click', openInBrowser);
    }
    if (openBrowserBtn) openBrowserBtn.addEventListener('click', openInBrowser);

    if (deviceBtn && deviceMenu) {
        deviceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deviceMenu.hidden = !deviceMenu.hidden;
        });
        deviceMenu.addEventListener('click', (e) => {
            const item = e.target.closest('[data-device]');
            if (!item) return;
            applyDevice(item.dataset.device);
            deviceMenu.hidden = true;
        });
        document.addEventListener('click', (e) => {
            if (deviceMenu.hidden) return;
            if (deviceBtn.contains(e.target) || deviceMenu.contains(e.target)) return;
            deviceMenu.hidden = true;
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!isOpen) return;
        if (e.key !== 'Escape') return;
        const ae = document.activeElement;
        if (ae && (ae.id === 'findInput' || ae.id === 'replaceInput')) return;
        e.preventDefault();
        closePreview();
    });

    input.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (isOpen) renderPreview();
            else openPreview();
        }
    });
}