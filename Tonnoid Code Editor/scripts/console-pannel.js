/* ============================================================
   Preview console — captures console.* from the iframe and
   shows a scrollable log panel below the preview.
   ============================================================ */

const panel    = document.getElementById('consolePanel');
const logEl    = document.getElementById('consoleLog');
const clearBtn = document.getElementById('consoleClearBtn');
const toggleBtn = document.getElementById('consoleToggleBtn');
const countEl  = document.getElementById('consoleCount');

let entries = [];
let isOpen = false;

/* Serialize any value into a displayable string, mirroring what
   the browser console would show for common types. */
function stringify(v, depth = 0) {
    if (depth > 2) return '…';
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    const t = typeof v;
    if (t === 'string') return depth === 0 ? v : `"${v}"`;
    if (t === 'number' || t === 'boolean' || t === 'bigint') return String(v);
    if (t === 'function') return `ƒ ${v.name || 'anonymous'}()`;
    if (t === 'symbol') return v.toString();
    if (Array.isArray(v)) {
        return '[' + v.map(x => stringify(x, depth + 1)).join(', ') + ']';
    }
    if (v instanceof Error) return v.stack || (v.name + ': ' + v.message);
    if (t === 'object') {
        try {
            const keys = Object.keys(v);
            if (keys.length > 8) {
                return '{ ' + keys.slice(0, 8).map(k => `${k}: ${stringify(v[k], depth + 1)}`).join(', ') + ', … }';
            }
            return '{ ' + keys.map(k => `${k}: ${stringify(v[k], depth + 1)}`).join(', ') + ' }';
        } catch (e) {
            return '[object]';
        }
    }
    return String(v);
}

/* The prelude script injected into the preview iframe.
   It wraps console methods and posts messages to the parent. */
export function consolePrelude() {
    return `<script>
    (function(){
        var send = function(level, args){
            try {
                var payload = Array.prototype.slice.call(args).map(function(a){
                    if (a instanceof Error) return { __err: true, name: a.name, message: a.message, stack: a.stack };
                    try {
                        /* Attempt structured clone via JSON for plain data. */
                        JSON.stringify(a);
                        return a;
                    } catch(e) {
                        return String(a);
                    }
                });
                parent.postMessage({ __lantern: 'console', level: level, args: payload }, '*');
            } catch(e) { /* ignore */ }
        };
        ['log','info','warn','error','debug'].forEach(function(level){
            var orig = console[level] ? console[level].bind(console) : function(){};
            console[level] = function(){
                send(level, arguments);
                try { orig.apply(console, arguments); } catch(e){}
            };
        });
        window.addEventListener('error', function(e){
            send('error', [e.message + ' (' + (e.filename || '') + ':' + (e.lineno||0) + ':' + (e.colno||0) + ')']);
        });
        window.addEventListener('unhandledrejection', function(e){
            var r = e.reason;
            send('error', ['Unhandled promise rejection: ' + (r && r.message ? r.message : String(r))]);
        });
    })();
    <\/script>`;
}

/* Receive messages from the iframe. */
window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || d.__lantern !== 'console') return;
    addEntry(d.level, d.args);
});

function addEntry(level, args) {
    const text = args.map(a => {
        if (a && a.__err) return a.stack || (a.name + ': ' + a.message);
        return stringify(a);
    }).join(' ');

    entries.push({ level, text, time: Date.now() });
    if (entries.length > 500) entries.shift();

    /* Auto-open the panel on first error so it's not missed. */
    if (!isOpen && level === 'error') openConsole();

    renderConsole();
}

function renderConsole() {
    if (!logEl) return;

    /* Simple diff: if the tail is what we appended, only append. */
    logEl.innerHTML = entries.map((e, i) => `
        <div class="console-line console-${e.level}">
            <span class="console-ts">${new Date(e.time).toLocaleTimeString().split(' ')[0]}</span>
            <span class="console-msg">${escapeHtml(e.text)}</span>
        </div>
    `).join('');

    /* Auto-scroll to bottom */
    logEl.scrollTop = logEl.scrollHeight;

    /* Update the badge count. */
    if (countEl) {
        const errCount = entries.filter(e => e.level === 'error').length;
        countEl.textContent = entries.length ? String(entries.length) : '';
        countEl.classList.toggle('has-errors', errCount > 0);
    }
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function openConsole() {
    if (isOpen) return;
    isOpen = true;
    panel.hidden = false;
    document.body.classList.add('console-open');
    renderConsole();
}

export function closeConsole() {
    if (!isOpen) return;
    isOpen = false;
    panel.hidden = true;
    document.body.classList.remove('console-open');
}

export function toggleConsole() {
    if (isOpen) closeConsole(); else openConsole();
}

export function isConsoleOpen() { return isOpen; }

export function clearConsole() {
    entries = [];
    renderConsole();
}

/* Wire up */
export function initConsole() {
    if (toggleBtn) toggleBtn.addEventListener('click', toggleConsole);
    if (clearBtn)  clearBtn.addEventListener('click', clearConsole);

    /* Also toggle with the "Console" button on the preview bar. */
    const previewConsoleBtn = document.getElementById('previewConsoleBtn');
    if (previewConsoleBtn) previewConsoleBtn.addEventListener('click', toggleConsole);
}

