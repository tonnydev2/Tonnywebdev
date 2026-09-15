/* ============================================================
   HTML Preview — renders the current HTML tab in a live iframe,
   inlining CSS and JS from other open tabs, plus any attached
   assets (images / audio / video / fonts).
   Also injects a console-capture prelude.
   ============================================================ */
import { input } from './dom.js';
import { tabs, savedFiles, assets } from './state.js';
import { getActiveTab } from './tabs.js';
import { consolePrelude, closeConsole } from './console-pannel.js';

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

/* ------------------------------------------------------------
   Public helpers
   ------------------------------------------------------------ */
export function isPreviewOpen() { return isOpen; }

/* ------------------------------------------------------------
   Lookup
   ------------------------------------------------------------ */
function findFileByName(name) {
    if (!name) return null;
    const clean = name.replace(/^\.\//, '').split('?')[0].split('#')[0];
    const tab = tabs.find(t => t.name === clean || t.name.endsWith('/' + clean));
    if (tab) return { name: tab.name, lang: tab.lang, content: tab.content };
    const key = Object.keys(savedFiles).find(k => k === clean || k.endsWith('/' + clean));
    if (key) return savedFiles[key];
    return null;
}

/* ------------------------------------------------------------
   Inline <link> and <script src>
   ------------------------------------------------------------ */
function inlineLinkedAssets(html) {
    html = html.replace(
        /<link\b[^>]*?rel\s*=\s*["']stylesheet["'][^>]*?>/gi,
        (tag) => {
            const hrefMatch = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i);
            if (!hrefMatch) return tag;
            const href = hrefMatch[1];
            if (/^(https?:)?\/\//i.test(href) || /^data:/i.test(href)) return tag;
            const file = findFileByName(href);
            if (!file) return tag;
            const code = file.content.replace(/<\/style/gi, '<\\/style');
            return `<style data-source="${href}">\n${code}\n</style>`;
        }
    );
    html = html.replace(
        /<script\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
        (tag, attrs1, src, attrs2) => {
            if (/^(https?:)?\/\//i.test(src) || /^data:/i.test(src)) return tag;
            const file = findFileByName(src);
            if (!file) return tag;
            const code = file.content.replace(/<\/script/gi, '<\\/script');
            const keepAttrs = (attrs1 + ' ' + attrs2)
                .replace(/\bsrc\s*=\s*["'][^"']*["']/i, '')
                .replace(/\s+/g, ' ').trim();
            const attrStr = keepAttrs ? ' ' + keepAttrs : '';
            return `<script${attrStr} data-source="${src}">\n${code}\n</script>`;
        }
    );
    return html;
}

function replaceAssetUrls(html) {
    return html.replace(
        /\b(src|href|poster|data-src|data-href)\s*=\s*["']([^"']+)["']/gi,
        (m, attr, url) => {
            if (/^(https?:)?\/\//i.test(url) || /^data:/i.test(url) || /^blob:/i.test(url)) return m;
            const clean = url.replace(/^\.\//, '').split('?')[0].split('#')[0];
            const basename = clean.split('/').pop();
            const hit = assets[clean] || assets[basename];
            if (!hit || !hit.dataUrl) return m;
            return `${attr}="${hit.dataUrl}"`;
        }
    );
}

/* ------------------------------------------------------------
   Build the document
   ------------------------------------------------------------ */
function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildPreviewDocument(tab = getActiveTab()) {
    if (!tab || tab.lang !== 'html') return null;

    let html = tab.content;
    html = inlineLinkedAssets(html);
    html = replaceAssetUrls(html);

    const prelude = consolePrelude();

    if (!/<html[\s>]/i.test(html) && !/<!doctype/i.test(html)) {
        html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(tab.name)}</title>
  ${prelude}
</head>
<body>
${html}
</body>
</html>`;
    } else if (/<head[\s>]/i.test(html)) {
        /* Inject right after <head> so console hooks are in place
           before any user script runs. */
        html = html.replace(/<head([^>]*)>/i, `<head$1>\n${prelude}\n`);
    } else if (/<html[\s>]/i.test(html)) {
        html = html.replace(/<html([^>]*)>/i, `<html$1>\n<head>${prelude}</head>\n`);
    } else {
        html = prelude + html;
    }

    return html;
}

/* ------------------------------------------------------------
   Render
   ------------------------------------------------------------ */
export function renderPreview() {
    if (!isOpen) return;

    /* Reset the console for each fresh render — otherwise logs pile
       up endlessly while the user iterates. */
    import('./console-panel.js').then(m => m.clearConsole());

    const doc = buildPreviewDocument();
    if (doc === null) {
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

    frame.srcdoc = doc;
}

/* ------------------------------------------------------------
   Device toggling
   ------------------------------------------------------------ */
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

    /* Mark active item in menu */
    if (deviceMenu) {
        deviceMenu.querySelectorAll('[data-device]').forEach(el => {
            el.classList.toggle('active', el.dataset.device === key);
        });
    }
}

/* ------------------------------------------------------------
   Open / close
   ------------------------------------------------------------ */
export function openPreview() {
    const active = getActiveTab();
    if (!active || active.lang !== 'html') {
        const htmlTab = tabs.find(t => t.lang === 'html');
        if (htmlTab) {
            import('./tabs.js').then(m => {
                m.switchToTab(htmlTab.id);
                setTimeout(renderPreview, 0);
            });
        }
    }

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
    frame.srcdoc = '';
    detachLiveReload();
    closeConsole();
}

/* ------------------------------------------------------------
   Open in browser
   ------------------------------------------------------------ */
export function openInBrowser() {
    const active = getActiveTab();
    const tab = (active && active.lang === 'html') ? active : tabs.find(t => t.lang === 'html');
    if (!tab) { alert('No HTML file to open — create or switch to one first.'); return; }

    const doc = buildPreviewDocument(tab);
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'noopener');
    if (!win) alert('Your browser blocked the new tab. Allow pop-ups for this site and try again.');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/* ------------------------------------------------------------
   Live reload
   ------------------------------------------------------------ */
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

/* ------------------------------------------------------------
   Wire up
   ------------------------------------------------------------ */
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
        externalBtn.addEventListener('click', () => {
            const doc = buildPreviewDocument();
            if (!doc) return;
            const blob = new Blob([doc], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener');
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        });
    }

    if (openBrowserBtn) openBrowserBtn.addEventListener('click', openInBrowser);

    /* Device toggle */
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