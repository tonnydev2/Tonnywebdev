import { input, acBox } from './dom.js';
import { currentFileLang } from './tabs.js';
import { render } from './render.js';
import { setCaret, VOID_TAGS } from './pairing.js';
import { detectInlineLang } from './inline-lang.js';
import { projectFiles, getActiveProjectId } from './state.js';


function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------- Dictionaries ---------- */
const AC_JS = [
    { label:'console.log',kind:'fn'},{label:'console.error',kind:'fn'},
    { label:'console.warn',kind:'fn'},{label:'console.table',kind:'fn'},
    { label:'document',kind:'prop'},{label:'document.getElementById',kind:'fn'},
    { label:'document.querySelector',kind:'fn'},{label:'document.querySelectorAll',kind:'fn'},
    { label:'document.createElement',kind:'fn'},{label:'document.addEventListener',kind:'fn'},
    { label:'window',kind:'prop'},{label:'setTimeout',kind:'fn'},{label:'setInterval',kind:'fn'},
    { label:'clearTimeout',kind:'fn'},{label:'clearInterval',kind:'fn'},
    { label:'addEventListener',kind:'fn'},{label:'removeEventListener',kind:'fn'},
    { label:'JSON.stringify',kind:'fn'},{label:'JSON.parse',kind:'fn'},
    { label:'Math.random',kind:'fn'},{label:'Math.floor',kind:'fn'},{label:'Math.ceil',kind:'fn'},
    { label:'Math.round',kind:'fn'},{label:'Math.max',kind:'fn'},{label:'Math.min',kind:'fn'},
    { label:'Math.abs',kind:'fn'},{label:'Object.keys',kind:'fn'},{label:'Object.values',kind:'fn'},
    { label:'Object.entries',kind:'fn'},{label:'Object.assign',kind:'fn'},
    { label:'Array.from',kind:'fn'},{label:'Array.isArray',kind:'fn'},
    { label:'Promise',kind:'prop'},{label:'Promise.all',kind:'fn'},{label:'Promise.resolve',kind:'fn'},
    { label:'async',kind:'kw'},{label:'await',kind:'kw'},{label:'const',kind:'kw'},
    { label:'let',kind:'kw'},{label:'var',kind:'kw'},{label:'function',kind:'kw'},
    { label:'return',kind:'kw'},{label:'if',kind:'kw'},{label:'else',kind:'kw'},
    { label:'for',kind:'kw'},{label:'while',kind:'kw'},{label:'switch',kind:'kw'},
    { label:'case',kind:'kw'},{label:'break',kind:'kw'},{label:'continue',kind:'kw'},
    { label:'class',kind:'kw'},{label:'extends',kind:'kw'},{label:'constructor',kind:'kw'},
    { label:'new',kind:'kw'},{label:'this',kind:'kw'},{label:'try',kind:'kw'},
    { label:'catch',kind:'kw'},{label:'finally',kind:'kw'},{label:'throw',kind:'kw'},
    { label:'import',kind:'kw'},{label:'export',kind:'kw'},{label:'from',kind:'kw'},
    { label:'default',kind:'kw'},{label:'true',kind:'kw'},{label:'false',kind:'kw'},
    { label:'null',kind:'kw'},{label:'undefined',kind:'kw'},{label:'typeof',kind:'kw'},
    { label:'instanceof',kind:'kw'},{label:'of',kind:'kw'},{label:'in',kind:'kw'},
];

const AC_HTML_TAGS = [
    'html','head','body','title','meta','link','style','script',
    'div','span','p','a','img','br','hr','ul','ol','li',
    'table','thead','tbody','tfoot','tr','td','th',
    'form','input','button','select','option','textarea','label',
    'header','footer','nav','main','section','article','aside',
    'h1','h2','h3','h4','h5','h6','pre','code','blockquote',
    'video','audio','source','canvas','svg','iframe','template',
].map(t => ({ label: t, kind: 'tag' }));

const AC_HTML_ATTRS = [
    'class','id','style','href','src','alt','title','type','name','value',
    'placeholder','disabled','checked','selected','readonly','required',
    'target','rel','width','height','role','tabindex',
].map(a => ({ label: a, kind: 'attr' }));

const AC_CSS_PROPS = [
    'color','background','background-color','background-image','background-size',
    'background-position','background-repeat','border','border-radius','border-color',
    'border-width','border-style','margin','margin-top','margin-right','margin-bottom',
    'margin-left','padding','padding-top','padding-right','padding-bottom','padding-left',
    'display','flex','flex-direction','flex-wrap','justify-content','align-items',
    'align-content','align-self','gap','row-gap','column-gap','grid',
    'grid-template-columns','grid-template-rows','grid-gap','position',
    'top','right','bottom','left','z-index','width','min-width','max-width',
    'height','min-height','max-height','overflow','overflow-x','overflow-y',
    'font','font-family','font-size','font-weight','font-style','line-height',
    'letter-spacing','text-align','text-decoration','text-transform','white-space',
    'cursor','opacity','visibility','box-shadow','transition','transform',
    'animation','content','outline','filter','object-fit','box-sizing',
].map(p => ({ label: p, kind: 'cssprop' }));

const AC_CSS_SELECTORS = [
    '.container','.wrapper','.button','.header','.footer','.nav','.card',
    '.row','.col','.active','.hidden',
    ':hover',':focus',':active',':visited',':first-child',':last-child',':nth-child',
    '::before','::after','@media','@keyframes','@import','@font-face','@supports',
].map(s => ({ label: s, kind: 'sel' }));

/* ---------- State ---------- */
const acState = {
    open: false,
    items: [],
    activeIdx: 0,
    startPos: 0,
    endPos: 0,
    manual: false,
};

export function getAcState() { return acState; }
export function renderAcBox() { renderAutocompleteBox(); }

export function getWordAtCaret() {
    const value = input.value;
    const caret = input.selectionStart;
    let start = caret;
    while (start > 0 && /[A-Za-z0-9_$.\-:@]/.test(value[start - 1])) start--;
    return { start, prefix: value.slice(start, caret), caret };
}


function getProjectFileNames() {
    const pid = getActiveProjectId();
    const files = projectFiles[pid] || {};
    return Object.keys(files);
}

function getDictionary() {
    const fileLang = currentFileLang();
    const value = input.value;
    const caret = input.selectionStart;

    let lang = fileLang;
    if (fileLang === 'html') {
        const ctx = detectInlineLang(value, caret);
        lang = ctx.lang;
    }

    if (lang === 'html') {
        const before = value.slice(0, caret);

        /* Inside a src="" or href="" attribute? Offer project files. */
        const attrValueMatch = before.match(/\b(src|href)\s*=\s*["']([^"']*)$/i);
        if (attrValueMatch) {
            const names = getProjectFileNames();
            if (names.length) {
                return names.map(n => ({ label: n, kind: 'file' }));
            }
        }

        const lastLt = before.lastIndexOf('<');
        const lastGt = before.lastIndexOf('>');
        if (lastLt > lastGt) {
            const tagText = before.slice(lastLt);
            if (/^<[a-zA-Z][a-zA-Z0-9-]*\s/.test(tagText)) {
                return AC_HTML_ATTRS.concat(AC_HTML_TAGS);
            }
            return AC_HTML_TAGS;
        }
        return AC_HTML_TAGS;
    }
    if (lang === 'css') {
        const before = value.slice(0, caret);
        const lastOpen  = before.lastIndexOf('{');
        const lastClose = before.lastIndexOf('}');
        if (lastOpen > lastClose) return AC_CSS_PROPS;
        return AC_CSS_SELECTORS;
    }
    return AC_JS;
}
function getMatches(prefix) {
    const dict = getDictionary();
    const p = prefix.toLowerCase();
    const starts = [];
    const contains = [];
    for (const item of dict) {
        const l = item.label.toLowerCase();
        if (l === p) continue;
        if (l.startsWith(p)) starts.push(item);
        else if (p.length > 1 && l.includes(p)) contains.push(item);
        if (starts.length + contains.length >= 60) break;
    }
    return starts.concat(contains).slice(0, 30);
}

export function openAutocomplete(manual = false) {
    const { start, prefix, caret } = getWordAtCaret();
    const lineStart  = input.value.lastIndexOf('\n', caret) + 1;
    const beforeWord = input.value.slice(lineStart, start);
    if (/["'`]/.test(beforeWord) && !/["'`][^"'`]*["'`]/.test(beforeWord)) {
        if (!manual) { closeAutocomplete(); return; }
    }

    const items = getMatches(prefix);
    if (items.length === 0) { closeAutocomplete(); return; }

    acState.open = true;
    acState.items = items;
    acState.activeIdx = 0;
    acState.startPos = start;
    acState.endPos = caret;
    acState.manual = manual;

    renderAutocompleteBox();
}

export function closeAutocomplete() {
    acState.open = false;
    acState.items = [];
    acBox.hidden = true;
    acBox.innerHTML = '';
}

function renderAutocompleteBox() {
    if (!acState.open || acState.items.length === 0) {
        acBox.hidden = true;
        return;
    }
    acBox.innerHTML = acState.items.map((item, idx) => `
        <div class="ac-item ${idx === acState.activeIdx ? 'active' : ''}" data-idx="${idx}">
            <span class="ac-label">${escapeHtml(item.label)}</span>
            <span class="ac-kind ${item.kind}">${item.kind}</span>
        </div>
    `).join('');
    acBox.hidden = false;

    requestAnimationFrame(repositionAutocomplete);
    const active = acBox.querySelector('.ac-item.active');
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
}

export function repositionAutocomplete() {
    if (!acState.open) return;
    const coords = caretCoords(input, acState.endPos);

    const vv = window.visualViewport;
    const viewportTop    = vv ? vv.offsetTop  : 0;
    const viewportHeight = vv ? vv.height     : window.innerHeight;
    const viewportLeft   = vv ? vv.offsetLeft : 0;
    const viewportWidth  = vv ? vv.width      : window.innerWidth;

    const GAP = 2;
    const rect = acBox.getBoundingClientRect();
    const boxW = rect.width  || 220;
    const boxH = rect.height || 220;

    let left = coords.left;
    let top  = coords.top + coords.height + GAP;

    const bottomLimit = viewportTop + viewportHeight - 6;
    if (top + boxH > bottomLimit) {
        const above = coords.top - boxH - GAP;
        if (above >= viewportTop + 6) top = above;
        else top = Math.max(viewportTop + 6, bottomLimit - boxH);
    }
    const rightLimit = viewportLeft + viewportWidth - 6;
    if (left + boxW > rightLimit) left = rightLimit - boxW;
    if (left < viewportLeft + 6) left = viewportLeft + 6;

    acBox.style.left = left + 'px';
    acBox.style.top  = top  + 'px';
}

function caretCoords(textarea, position) {
    const mirror = document.createElement('div');
    const computed = window.getComputedStyle(textarea);
    const props = [
        'fontFamily','fontSize','fontWeight','fontStyle','letterSpacing',
        'textTransform','wordSpacing','textIndent','whiteSpace','lineHeight',
        'paddingTop','paddingRight','paddingBottom','paddingLeft',
        'borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth',
        'boxSizing',
    ];
    for (const p of props) mirror.style[p] = computed[p];
    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre';
    mirror.style.top = '0';
    mirror.style.left = '0';
    mirror.style.overflow = 'hidden';
    mirror.style.width = textarea.clientWidth + 'px';

    mirror.textContent = textarea.value.slice(0, position);
    const span = document.createElement('span');
    span.textContent = textarea.value.slice(position, position + 1) || '.';
    mirror.appendChild(span);

    document.body.appendChild(mirror);
    const spanRect = span.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();
    const taRect = textarea.getBoundingClientRect();

    const result = {
        left: spanRect.left - mirrorRect.left - textarea.scrollLeft + taRect.left,
        top:  spanRect.top  - mirrorRect.top  - textarea.scrollTop  + taRect.top,
        height: spanRect.height,
    };
    document.body.removeChild(mirror);
    return result;
}

export function acceptAutocomplete() {
    if (!acState.open || acState.items.length === 0) return;

    const item   = acState.items[acState.activeIdx];
    const value  = input.value;
    const before = value.slice(0, acState.startPos);
    const after  = value.slice(acState.endPos);

    let inserted   = item.label;
    let caretShift = item.label.length;

    /* Are we actually in HTML right now? (Not inside <style> / <script>) */
    const fileLang = currentFileLang();
    const effectiveLang = fileLang === 'html'
        ? detectInlineLang(value, acState.startPos).lang
        : fileLang;

    if (effectiveLang === 'html' && item.kind === 'attr') {
        const afterTrim = after.replace(/^\s*/, '');
        if (!/^=/.test(afterTrim)) {
            inserted = item.label + '=""';
            caretShift = item.label.length + 2;
        }
    }

    if (effectiveLang === 'html' && item.kind === 'tag') {
        const b = value.slice(0, acState.startPos);
        const lastLt = b.lastIndexOf('<');
        const lastGt = b.lastIndexOf('>');
        const insideTag = lastLt > lastGt;
        if (insideTag) {
            const tagLower = item.label.toLowerCase();
            const alreadyHasGt = after.startsWith('>');
            const hasCloseAhead = after.toLowerCase().startsWith('</' + tagLower);
            let decoration = '';
            let shift = item.label.length;
            if (!alreadyHasGt) { decoration += '>'; shift += 1; }
            const isVoid = VOID_TAGS.has(tagLower);
            if (!isVoid && !hasCloseAhead && !alreadyHasGt) decoration += `</${tagLower}>`;
            inserted = item.label + decoration;
            caretShift = shift;
        }
    }

    input.value = before + inserted + after;
    setCaret(acState.startPos + caretShift);
    closeAutocomplete();
    render();
}

/* Wire mouse & touch inside this module, since acBox lives here */
acBox.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.ac-item');
    if (!item) return;
    e.preventDefault();
    acState.activeIdx = parseInt(item.dataset.idx, 10);
    acceptAutocomplete();
});
acBox.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.ac-item');
    if (!item) return;
    e.preventDefault();
    acState.activeIdx = parseInt(item.dataset.idx, 10);
    acceptAutocomplete();
}, { passive: false });

input.addEventListener('blur', () => setTimeout(closeAutocomplete, 120));

if (window.visualViewport) {
    const vv = window.visualViewport;
    const onVV = () => { if (acState.open) repositionAutocomplete(); };
    vv.addEventListener('resize', onVV);
    vv.addEventListener('scroll', onVV);
}

