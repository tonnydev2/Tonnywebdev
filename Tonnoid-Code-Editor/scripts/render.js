import {
    input, highlightCode, highlightPre, gutter,
    editorScroll, lineCount, charCount,
    fileNameDisplay, tabsBar,
} from './dom.js';
import { DEFAULT_LANG } from './state.js';
import { highlight } from './highlighters.js';
import { getActiveTab, currentFileLang, isDirty } from './tabs.js';
import { findState, highlightWithMarks } from './find.js';
import { findBracketMatch, findTagMatch } from './bracket-match.js';
import { detectInlineLang } from './inline-lang.js';

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function syncSize() {
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

/* Cheap string/comment detector (unchanged). */
function makeStringOrCommentDetector(text, lang) {
    return function isInStringOrComment(pos) {
        const lineStart = text.lastIndexOf('\n', pos - 1) + 1;
        let i = lineStart;
        let inSingle = false, inDouble = false, inBacktick = false;
        let inLineComment = false, inBlockComment = false;
        while (i < pos) {
            const c = text[i];
            const next = text[i + 1];
            if (inLineComment) {
                if (c === '\n') inLineComment = false;
                i++; continue;
            }
            if (inBlockComment) {
                if (c === '*' && next === '/') { inBlockComment = false; i += 2; continue; }
                i++; continue;
            }
            if (inSingle)   { if (c === '\\') i += 2; else if (c === "'") inSingle = false; else i++; continue; }
            if (inDouble)   { if (c === '\\') i += 2; else if (c === '"') inDouble = false; else i++; continue; }
            if (inBacktick) { if (c === '\\') i += 2; else if (c === '`') inBacktick = false; else i++; continue; }
            if (c === '/' && next === '/') { inLineComment = true; i += 2; continue; }
            if (c === '/' && next === '*') { inBlockComment = true; i += 2; continue; }
            if (c === "'") { inSingle = true; i++; continue; }
            if (c === '"') { inDouble = true; i++; continue; }
            if (c === '`') { inBacktick = true; i++; continue; }
            i++;
        }
        return inSingle || inDouble || inBacktick || inLineComment || inBlockComment;
    };
}

export function render() {
    const selStart = input.selectionStart;
    const selEnd   = input.selectionEnd;

    const code = input.value;
    const tab  = getActiveTab();
    const fileLang = tab ? tab.lang : DEFAULT_LANG;

    /* First pass: syntax highlighting. */
    let html;
    if (findState.open && findState.matches.length > 0) {
        html = highlightWithMarks(code, fileLang, findState.matches, findState.currentIdx);
    } else {
        html = highlight(code, fileLang);
    }

    /* Second pass: bracket/tag matching. */
    if (selStart === selEnd) {
        /* Effective language — HTML files can be "really" CSS or JS
           inside a <style>/<script> block. */
        let effective = fileLang;
        if (fileLang === 'html') {
            effective = detectInlineLang(code, selStart).lang;
        }

        if (effective === 'html') {
            const tagMatch = findTagMatch(code, selStart);
            if (tagMatch) {
                html = wrapHtmlTagsByTextOffsets(html, [
                    textTagRange(code, tagMatch.open),
                    textTagRange(code, tagMatch.close),
                ]);
            }
        } else {
            /* JS or CSS — bracket matching. */
            const detector = makeStringOrCommentDetector(code, effective);
            const bm = findBracketMatch(code, selStart, detector);
            if (bm) {
                html = wrapByTextOffsets(html, [bm.open, bm.close]);
            }
        }
    }

    highlightCode.innerHTML = html + '\n';

    const lines = code.split('\n');
    gutter.textContent = lines.map((_, idx) => idx + 1).join('\n');

    lineCount.textContent = lines.length;
    charCount.textContent = code.length;

    const name = tab ? tab.name : `untitled.${DEFAULT_LANG}`;
    const base = name.replace(/\.[^.]+$/, '');
    fileNameDisplay.innerHTML = `${escapeHtml(base)}.<b>${escapeHtml(fileLang)}</b>`;

    syncSize();

    input.selectionStart = selStart;
    input.selectionEnd   = selEnd;

    if (tab) {
        const el = tabsBar.querySelector(`.tab[data-tab-id="${tab.id}"]`);
        if (el) el.classList.toggle('dirty', isDirty(tab));
    }
}

/* For a tag starting at text-offset `start`, return the [start, end)
   range of the whole tag in the source. */
function textTagRange(text, start) {
    if (start < 0) return { from: -1, to: -1 };
    const end = text.indexOf('>', start);
    if (end === -1) return { from: start, to: start + 1 };
    return { from: start, to: end + 1 };
}

/* Wrap individual characters at the given text offsets. */
function wrapByTextOffsets(html, textOffsets) {
    const targets = new Set(textOffsets);
    let out = '';
    let textIdx = 0;
    let i = 0;
    const n = html.length;

    while (i < n) {
        if (html[i] === '<') {
            const end = html.indexOf('>', i);
            if (end === -1) { out += html.slice(i); break; }
            out += html.slice(i, end + 1);
            i = end + 1;
            continue;
        }
        if (html[i] === '&') {
            const semi = html.indexOf(';', i);
            if (semi !== -1 && semi - i <= 8) {
                const entity = html.slice(i, semi + 1);
                out += targets.has(textIdx) ? `<span class="bmatch">${entity}</span>` : entity;
                textIdx++;
                i = semi + 1;
                continue;
            }
        }
        const ch = html[i];
        out += targets.has(textIdx) ? `<span class="bmatch">${ch}</span>` : ch;
        textIdx++;
        i++;
    }
    return out;
}

/* Wrap ranges of source text (multi-char — used for HTML tags). */
function wrapHtmlTagsByTextOffsets(html, textRanges) {
    const inRange = (idx) => textRanges.some(r => r.from !== -1 && idx >= r.from && idx < r.to);
    let out = '';
    let textIdx = 0;
    let i = 0;
    const n = html.length;

    while (i < n) {
        if (html[i] === '<') {
            const end = html.indexOf('>', i);
            if (end === -1) { out += html.slice(i); break; }
            out += html.slice(i, end + 1);
            i = end + 1;
            continue;
        }
        if (html[i] === '&') {
            const semi = html.indexOf(';', i);
            if (semi !== -1 && semi - i <= 8) {
                const entity = html.slice(i, semi + 1);
                out += inRange(textIdx) ? `<span class="bmatch">${entity}</span>` : entity;
                textIdx++;
                i = semi + 1;
                continue;
            }
        }
        const ch = html[i];
        out += inRange(textIdx) ? `<span class="bmatch">${ch}</span>` : ch;
        textIdx++;
        i++;
    }
    return out;
}

export { syncSize };