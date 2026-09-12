import {
    input, highlightCode, highlightPre, gutter,
    editorScroll, lineCount, charCount,
    fileNameDisplay, tabsBar,
} from './dom.js';
import { DEFAULT_LANG } from './state.js';
import { highlight } from './highlighters.js';
import { getActiveTab, currentFileLang, isDirty } from './tabs.js';
import { findState, highlightWithMarks } from './find.js';

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function syncSize() {
    /* The textarea is now a fixed-height scroller. The <pre> and gutter
       are translated by syncing scrollLeft / scrollTop on every scroll
       event (see the scroll listener in main.js). No content-height
       computation is needed here. */

    /* But we DO need to make sure the <pre> and gutter always match the
       current scroll of the textarea right after a render — otherwise
       when you type off-screen, the overlay temporarily lags. */
    const highlightPre = document.getElementById('highlight');
    const gutterEl = document.getElementById('gutter');
    if (highlightPre) {
        highlightPre.scrollTop  = input.scrollTop;
        highlightPre.scrollLeft = input.scrollLeft;
    }
    if (gutterEl) {
        gutterEl.scrollTop = input.scrollTop;
    }
}

export function render() {
    const selStart = input.selectionStart;
    const selEnd   = input.selectionEnd;

    const code = input.value;
    const tab  = getActiveTab();
    const lang = tab ? tab.lang : DEFAULT_LANG;

    if (findState.open && findState.matches.length > 0) {
        highlightCode.innerHTML = highlightWithMarks(code, lang, findState.matches, findState.currentIdx) + '\n';
    } else {
        highlightCode.innerHTML = highlight(code, lang) + '\n';
    }

    const lines = code.split('\n');
    gutter.textContent = lines.map((_, idx) => idx + 1).join('\n');

    lineCount.textContent = lines.length;
    charCount.textContent = code.length;

    const name = tab ? tab.name : `untitled.${DEFAULT_LANG}`;
    const base = name.replace(/\.[^.]+$/, '');
    fileNameDisplay.innerHTML = `${escapeHtml(base)}.<b>${escapeHtml(lang)}</b>`;

    syncSize();

    input.selectionStart = selStart;
    input.selectionEnd   = selEnd;

    if (tab) {
        const el = tabsBar.querySelector(`.tab[data-tab-id="${tab.id}"]`);
        if (el) el.classList.toggle('dirty', isDirty(tab));
    }
}

export { syncSize };

