import { input } from './dom.js';
import { render } from './render.js';
import { highlightWithMarks } from './find-highlight.js';

const findBar       = document.getElementById('findBar');
const findInput     = document.getElementById('findInput');
const replaceInput  = document.getElementById('replaceInput');
const findCount     = document.getElementById('findCount');
const findPrevBtn   = document.getElementById('findPrevBtn');
const findNextBtn   = document.getElementById('findNextBtn');
const replaceOneBtn = document.getElementById('replaceOneBtn');
const replaceAllBtn = document.getElementById('replaceAllBtn');
const caseToggleBtn = document.getElementById('caseToggleBtn');
const findCloseBtn  = document.getElementById('findCloseBtn');

/* State declared first */
export const findState = {
    open: false,
    matches: [],
    currentIdx: -1,
    caseSensitive: false,
};

export { highlightWithMarks };

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function computeMatches() {
    const query = findInput.value;
    findState.matches = [];
    findState.currentIdx = -1;
    if (!query) {
        findCount.textContent = '0/0';
        findCount.classList.remove('no-matches');
        render();
        return;
    }

    const text = input.value;
    const flags = findState.caseSensitive ? 'g' : 'gi';
    let re;
    try { re = new RegExp(escapeRegex(query), flags); }
    catch (e) {
        findCount.textContent = '0/0';
        findCount.classList.add('no-matches');
        render();
        return;
    }

    let m;
    while ((m = re.exec(text)) !== null) {
        findState.matches.push({ start: m.index, end: m.index + m[0].length });
        if (m[0].length === 0) re.lastIndex++;
    }

    if (findState.matches.length > 0) {
        const caret = input.selectionStart;
        let idx = findState.matches.findIndex(m => m.start >= caret);
        if (idx === -1) idx = 0;
        findState.currentIdx = idx;
    }

    updateFindCount();
    render();
}

function updateFindCount() {
    const total = findState.matches.length;
    const cur = findState.currentIdx >= 0 ? findState.currentIdx + 1 : 0;
    findCount.textContent = `${cur}/${total}`;
    findCount.classList.toggle('no-matches', total === 0);
}

function selectMatch(idx) {
    if (findState.matches.length === 0) return;
    const total = findState.matches.length;
    findState.currentIdx = ((idx % total) + total) % total;

    const m = findState.matches[findState.currentIdx];
    input.focus();
    input.setSelectionRange(m.start, m.end);

    const before = input.value.slice(0, m.start);
    const lineNumber = before.split('\n').length;
    const lineHeight = 22;
    input.scrollTop = Math.max(0, (lineNumber - 3) * lineHeight);

    updateFindCount();
    render();
}

function nextMatch() { selectMatch(findState.currentIdx + 1); }
function prevMatch() { selectMatch(findState.currentIdx - 1); }

function replaceCurrent() {
    if (findState.matches.length === 0) return;
    const m = findState.matches[findState.currentIdx];
    const replacement = replaceInput.value;
    const value = input.value;
    input.value = value.slice(0, m.start) + replacement + value.slice(m.end);
    computeMatches();
    selectMatch(findState.currentIdx);
}

function replaceAllMatches() {
    const query = findInput.value;
    if (!query) return;
    const flags = findState.caseSensitive ? 'g' : 'gi';
    const re = new RegExp(escapeRegex(query), flags);
    const before = input.value;
    const after = before.replace(re, replaceInput.value);
    if (after === before) return;
    input.value = after;
    computeMatches();
    render();
}

function _openFindBar() {
    findBar.hidden = false;
    findState.open = true;
    const sel = input.value.slice(input.selectionStart, input.selectionEnd);
    if (sel && !sel.includes('\n')) findInput.value = sel;
    computeMatches();
    setTimeout(() => { findInput.focus(); findInput.select(); }, 0);
    document.body.classList.add('find-open');
    repositionFindBar();
}

function _closeFindBar() {
    findBar.hidden = true;
    findState.open = false;
    findState.matches = [];
    findState.currentIdx = -1;
    input.focus();
    render();
    document.body.classList.remove('find-open');
    findBar.style.bottom = '';
}

export let openFindBar = _openFindBar;
export let closeFindBar = _closeFindBar;

/* Wire up */
findInput.addEventListener('input', computeMatches);
findNextBtn.addEventListener('click', nextMatch);
findPrevBtn.addEventListener('click', prevMatch);
replaceOneBtn.addEventListener('click', replaceCurrent);
replaceAllBtn.addEventListener('click', replaceAllMatches);
caseToggleBtn.addEventListener('click', () => {
    findState.caseSensitive = !findState.caseSensitive;
    caseToggleBtn.classList.toggle('active', findState.caseSensitive);
    computeMatches();
});
findCloseBtn.addEventListener('click', closeFindBar);

findInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) prevMatch(); else nextMatch();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        closeFindBar();
    }
});
replaceInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); replaceCurrent(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeFindBar(); }
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        openFindBar();
    }
    if (e.key === 'Escape' && findState.open &&
        document.activeElement !== findInput &&
        document.activeElement !== replaceInput) {
        closeFindBar();
    }
});

/* ---- Visible button in the header ---- */
const findBtn = document.getElementById('findBtn');
if (findBtn) {
    findBtn.addEventListener('click', () => {
        if (findState.open) closeFindBar();
        else openFindBar();
    });
}

/* ---- Keep the bar above the mobile keyboard ---- */
const findBarEl = findBar;   /* already imported above as the DOM ref */

function repositionFindBar() {
    const vv = window.visualViewport;
    if (!vv) return;

    /* Distance from the layout viewport's bottom to the visual viewport's bottom.
       When the keyboard is up, this is a positive number (the keyboard height). */
    const keyboardOffset = Math.max(
        0,
        (window.innerHeight - vv.height - vv.offsetTop)
    );

    /* Push the bar up by the keyboard height, on top of the footer gap. */
    findBarEl.style.bottom = (keyboardOffset + 26) + 'px';
}

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', repositionFindBar);
    window.visualViewport.addEventListener('scroll', repositionFindBar);
}
window.addEventListener('resize', repositionFindBar);

/* Also update on open */
const _originalOpen = openFindBar;
openFindBar = function() {
    _originalOpen();
    document.body.classList.add('find-open');
    repositionFindBar();
};
const _originalClose = closeFindBar;
closeFindBar = function() {
    _originalClose();
    document.body.classList.remove('find-open');
    findBarEl.style.bottom = '';   /* reset */
};

