/* ============================================================
   Shortcut toolbar above the keyboard
   ============================================================ */
import { input, fileTypeSelect } from './dom.js';
import { getActiveTab, closeTab, createTab, uniqueNewName, switchToTab } from './tabs.js';
import { render } from './render.js';
import { openFindBar } from './find.js';
import { persistSavedFiles } from './storage.js';
import { savedFiles, DEFAULT_LANG } from './state.js';
import { setCaret } from './pairing.js';
import { askFileName } from './filename-dialog.js';

const bar     = document.getElementById('shortcutBar');
const barRow  = document.getElementById('shortcutBarRow');

/* ---- Button helpers ---- */
function makeBtn({ label, title, className, onClick }) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sb-btn' + (className ? ' ' + className : '');
    b.textContent = label;
    if (title) b.title = title;
    b.setAttribute('aria-label', title || label);

    /* Prevent focus loss from the textarea, which would close (or
       re-trigger) the soft keyboard on mobile. On touchscreens the browser
       shifts focus to the tapped button as part of handling the touch
       itself — before any mousedown/click ever fires — so touchstart has
       to be the one that's cancelled, not just mousedown.

       Caveat: once touchstart is cancelled, the browser will not follow up
       with its usual synthetic mousedown/mouseup/click for that touch, so
       the button's action has to be fired from touchend directly instead
       of waiting on a 'click' that will never arrive. The 'click' listener
       stays too, purely for real mouse/trackpad use and keyboard/assistive
       activation, which don't go through touch events at all. */
    b.addEventListener('touchstart', (e) => {
        e.preventDefault();
    }, { passive: false });
    b.addEventListener('touchend', (e) => {
        e.preventDefault();
        onClick(e);
    });
    b.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    b.addEventListener('click', onClick);
    return b;
}

function makeSep() {
    const s = document.createElement('span');
    s.className = 'sb-sep';
    return s;
}

/* ---- Editor operations ---- */

/* Insert text at the caret, replacing the selection. */
function insertAtCaret(text) {
    const value = input.value;
    const start = input.selectionStart;
    const end   = input.selectionEnd;
    input.value = value.slice(0, start) + text + value.slice(end);
    setCaret(start + text.length);
    const tab = getActiveTab();
    if (tab) tab.content = input.value;
    render();
}

/* Insert a wrapping pair: if the selection exists, wrap it; if not,
   insert the pair and put the caret between them. */
function wrapPair(open, close) {
    const value = input.value;
    const start = input.selectionStart;
    const end   = input.selectionEnd;
    if (start === end) {
        input.value = value.slice(0, start) + open + close + value.slice(end);
        setCaret(start + open.length);
    } else {
        const sel = value.slice(start, end);
        input.value = value.slice(0, start) + open + sel + close + value.slice(end);
        input.selectionStart = start + open.length;
        input.selectionEnd   = start + open.length + sel.length;
    }
    const tab = getActiveTab();
    if (tab) tab.content = input.value;
    render();
}

/* Indent / outdent the current line or all selected lines by two spaces. */
function shiftIndent(direction) {
    const value = input.value;
    const start = input.selectionStart;
    const end   = input.selectionEnd;

    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', end);
    const blockEnd = lineEnd === -1 ? value.length : lineEnd;

    const block = value.slice(lineStart, blockEnd);
    const lines = block.split('\n');

    const shifted = lines.map(line => {
        if (direction > 0) {
            return '  ' + line;
        }
        /* outdent: strip up to two leading spaces */
        if (line.startsWith('  ')) return line.slice(2);
        if (line.startsWith(' '))  return line.slice(1);
        if (line.startsWith('\t')) return line.slice(1);
        return line;
    }).join('\n');

    input.value = value.slice(0, lineStart) + shifted + value.slice(blockEnd);

    /* Adjust selection roughly so the user keeps a sensible highlight */
    const deltaFirst = shifted.length - block.length;
    input.selectionStart = start + (direction > 0 ? 2 : Math.min(0, deltaFirst));
    input.selectionEnd   = end + deltaFirst;
    if (input.selectionStart < 0) input.selectionStart = 0;

    const tab = getActiveTab();
    if (tab) tab.content = input.value;
    render();
}

/* Undo / redo via the browser's built-in textarea history. */
function doUndo() {
    input.focus();
    document.execCommand('undo');
    const tab = getActiveTab();
    if (tab) tab.content = input.value;
    render();
}
function doRedo() {
    input.focus();
    document.execCommand('redo');
    const tab = getActiveTab();
    if (tab) tab.content = input.value;
    render();
}

/* Enter key, sent as a real newline that passes through beforeinput. */
function simulateEnter() {
    /* Focus the textarea so the keyboard is up, then dispatch a beforeinput
       with the same shape the browser would produce. */
    input.focus();
    const evt = new InputEvent('beforeinput', {
        inputType: 'insertLineBreak',
        bubbles: true,
        cancelable: true,
    });
    input.dispatchEvent(evt);
    /* If our beforeinput handler didn't preventDefault, insert a plain \n. */
    if (!evt.defaultPrevented) insertAtCaret('\n');
}

/* Semicolon + newline (handy for JS). */
function semicolonNewline() {
    input.focus();
    insertAtCaret(';\n');
}

/* Close the current tab (or open a new one if it's the last). */
function closeCurrentTab() {
    const tab = getActiveTab();
    if (!tab) return;
    closeTab(tab.id);
}

/* Ask for a name, then create a tab (same flow as the header button). */
function newTabViaDialog() {
    const lang = fileTypeSelect.value || DEFAULT_LANG;
    askFileName({
        title: 'New file',
        lang,
        onConfirm: (baseName) => {
            const name = `${baseName}.${lang}`;
            const emptyContent =
                lang === 'js'   ? '// New JavaScript file\n' :
                lang === 'html' ? '' :
                                  '/* CSS file */\n';
            const existing = (window.__lantern_tabs || []).find(t => t.name === name);
            if (existing) { switchToTab(existing.id); return; }
            createTab({ name, lang, content: emptyContent });
        },
    });
}

/* Save the current tab. */
function saveTab() {
    const tab = getActiveTab();
    if (!tab) return;
    tab.content = input.value;
    tab.savedContent = input.value;
    savedFiles[tab.name] = { name: tab.name, lang: tab.lang, content: tab.content };
    persistSavedFiles();

    import('./cloud.js')
        .then(m => m.pushFile({ name: tab.name, lang: tab.lang, content: tab.content }))
        .catch(() => {});

    const btn = bar.querySelector('.sb-save');
    if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✅';
        setTimeout(() => { btn.textContent = orig; }, 700);
    }
}

/* ============================================================
   CURSOR MOVERS
   Move the caret one position at a time without touching the text.
   Each respects the current selection: if there's a selection,
   collapse it to the corresponding edge first.
   ============================================================ */

/* Move caret one character to the left. */
function cursorLeft() {
    const v = input.value;
    let pos = input.selectionStart;
    if (input.selectionStart !== input.selectionEnd) {
        /* Collapse selection to its left edge */
        pos = input.selectionStart;
    } else if (pos > 0) {
        pos -= 1;
    }
    input.focus();
    input.setSelectionRange(pos, pos);
}

/* Move caret one character to the right. */
function cursorRight() {
    const v = input.value;
    let pos = input.selectionEnd;
    if (input.selectionStart !== input.selectionEnd) {
        pos = input.selectionEnd;
    } else if (pos < v.length) {
        pos += 1;
    }
    input.focus();
    input.setSelectionRange(pos, pos);
}

/* Move caret up one visual line, preserving the column if possible. */
function cursorUp() {
    const v = input.value;
    const pos = input.selectionStart;
    const lineStart = v.lastIndexOf('\n', pos - 1) + 1;
    const column = pos - lineStart;      /* 0-based column in the current line */
    if (lineStart === 0) return;         /* already on the first line */

    const prevLineEnd = lineStart - 1;   /* index of the \n ending the previous line */
    const prevLineStart = v.lastIndexOf('\n', prevLineEnd - 1) + 1;
    const prevLineLen = prevLineEnd - prevLineStart;
    const newCol = Math.min(column, prevLineLen);
    const newPos = prevLineStart + newCol;
    input.focus();
    input.setSelectionRange(newPos, newPos);
}

/* Move caret down one visual line, preserving the column if possible. */
function cursorDown() {
    const v = input.value;
    const pos = input.selectionStart;
    const lineEnd = v.indexOf('\n', pos);
    if (lineEnd === -1) return;          /* already on the last line */

    const lineStart = v.lastIndexOf('\n', pos - 1) + 1;
    const column = pos - lineStart;

    const nextLineStart = lineEnd + 1;
    const nextLineEnd = v.indexOf('\n', nextLineStart);
    const nextLineLen = (nextLineEnd === -1 ? v.length : nextLineEnd) - nextLineStart;

    const newCol = Math.min(column, nextLineLen);
    const newPos = nextLineStart + newCol;
    input.focus();
    input.setSelectionRange(newPos, newPos);
}

/* Move caret to the start of the current line. */
function cursorLineStart() {
    const v = input.value;
    const pos = input.selectionStart;
    const lineStart = v.lastIndexOf('\n', pos - 1) + 1;
    input.focus();
    input.setSelectionRange(lineStart, lineStart);
}

/* Move caret to the end of the current line. */
function cursorLineEnd() {
    const v = input.value;
    const pos = input.selectionEnd;
    let lineEnd = v.indexOf('\n', pos);
    if (lineEnd === -1) lineEnd = v.length;
    input.focus();
    input.setSelectionRange(lineEnd, lineEnd);
}

/* ============================================================
   LINE MOVERS
   Move the current line (or all selected lines) up or down.
   Selection moves with the lines so repeated presses work.
   ============================================================ */

/* Swap the block of currently selected (or caret) lines with the
   adjacent block above or below. */
function moveLines(direction) {
    const v = input.value;
    const selStart = input.selectionStart;
    const selEnd   = input.selectionEnd;

    /* Find the whole lines the selection/caret touches */
    const blockStart = v.lastIndexOf('\n', selStart - 1) + 1;
    let blockEnd = v.indexOf('\n', selEnd);
    if (blockEnd === -1) blockEnd = v.length;

    const block = v.slice(blockStart, blockEnd);
    const blockLineCount = block.split('\n').length;

    if (direction < 0) {
        /* Move UP: swap with the line above, if any */
        if (blockStart === 0) return;                 /* already at the top */
        const aboveEnd = blockStart - 1;              /* the \n ending the line above */
        const aboveStart = v.lastIndexOf('\n', aboveEnd - 1) + 1;
        const aboveLine = v.slice(aboveStart, aboveEnd);

        const newBlock = block + '\n' + aboveLine;
        input.value = v.slice(0, aboveStart) + newBlock + v.slice(blockEnd);

        /* Shift the selection up by the length of the above line + 1 */
        const shift = aboveLine.length + 1;
        input.selectionStart = selStart - shift;
        input.selectionEnd   = selEnd   - shift;
    } else {
        /* Move DOWN: swap with the line below, if any */
        if (blockEnd >= v.length) return;             /* already at the bottom */
        const belowEnd = v.indexOf('\n', blockEnd + 1);
        const belowStop = belowEnd === -1 ? v.length : belowEnd;
        const belowStart = blockEnd + 1;
        const belowLine = v.slice(belowStart, belowStop);

        const newBlock = belowLine + '\n' + block;
        input.value = v.slice(0, blockStart) + newBlock + v.slice(belowStop);

        /* Shift the selection down by the length of the below line + 1 */
        const shift = belowLine.length + 1;
        input.selectionStart = selStart + shift;
        input.selectionEnd   = selEnd   + shift;
    }

    const tab = getActiveTab();
    if (tab) tab.content = input.value;
    render();
}
/* ---- Build the bar once ---- */
 function buildBar() {
    barRow.innerHTML = '';

    /* --- History --- */
    barRow.appendChild(makeBtn({ label: '↶', title: 'Undo', onClick: doUndo }));
    barRow.appendChild(makeBtn({ label: '↷', title: 'Redo', onClick: doRedo }));

    barRow.appendChild(makeSep());

    /* --- Cursor movers --- */
    barRow.appendChild(makeBtn({ label: '◀', title: 'Cursor left',  onClick: cursorLeft }));
    barRow.appendChild(makeBtn({ label: '▲', title: 'Cursor up',    onClick: cursorUp }));
    barRow.appendChild(makeBtn({ label: '▼', title: 'Cursor down',  onClick: cursorDown }));
    barRow.appendChild(makeBtn({ label: '▶', title: 'Cursor right', onClick: cursorRight }));
    barRow.appendChild(makeBtn({ label: '⇤', title: 'Line start',   onClick: cursorLineStart }));
    barRow.appendChild(makeBtn({ label: '⇥', title: 'Line end',     onClick: cursorLineEnd }));

    barRow.appendChild(makeSep());

    /* --- Whitespace --- */
    barRow.appendChild(makeBtn({ label: '⇢', title: 'Insert tab (2 spaces)', onClick: () => insertAtCaret('  ') }));
    barRow.appendChild(makeBtn({ label: '→', title: 'Indent line(s)',   onClick: () => shiftIndent(+1) }));
    barRow.appendChild(makeBtn({ label: '←', title: 'Outdent line(s)',  onClick: () => shiftIndent(-1) }));

    barRow.appendChild(makeSep());

    /* --- Line movers --- */
    barRow.appendChild(makeBtn({ label: '⤒', title: 'Move line up',   onClick: () => moveLines(-1) }));
    barRow.appendChild(makeBtn({ label: '⤓', title: 'Move line down', onClick: () => moveLines(+1) }));

    barRow.appendChild(makeSep());

    /* --- Pairs --- */
    barRow.appendChild(makeBtn({ label: '( )', title: 'Parentheses', className: 'sb-wide', onClick: () => wrapPair('(', ')') }));
    barRow.appendChild(makeBtn({ label: '[ ]', title: 'Brackets',    className: 'sb-wide', onClick: () => wrapPair('[', ']') }));
    barRow.appendChild(makeBtn({ label: '{ }', title: 'Braces',      className: 'sb-wide', onClick: () => wrapPair('{', '}') }));
    barRow.appendChild(makeBtn({ label: '""',  title: 'Double quotes', onClick: () => wrapPair('"', '"') }));
    barRow.appendChild(makeBtn({ label: "''",  title: 'Single quotes', onClick: () => wrapPair("'", "'") }));
    barRow.appendChild(makeBtn({ label: '``',  title: 'Backticks',     onClick: () => wrapPair('`', '`') }));
    barRow.appendChild(makeBtn({ label: '< >', title: 'Angle brackets', className: 'sb-wide', onClick: () => wrapPair('<', '>') }));

    barRow.appendChild(makeSep());

    /* --- Insert / newline --- */
    barRow.appendChild(makeBtn({ label: ';↵', title: 'Semicolon + newline', className: 'sb-wide', onClick: semicolonNewline }));
    barRow.appendChild(makeBtn({ label: '↵', title: 'New line', onClick: simulateEnter }));

    barRow.appendChild(makeSep());

    /* --- Tabs --- */
    barRow.appendChild(makeBtn({ label: '＋', title: 'New tab',   onClick: newTabViaDialog }));
    barRow.appendChild(makeBtn({ label: '✕',  title: 'Close tab', onClick: closeCurrentTab }));

    barRow.appendChild(makeSep());

    /* --- Save / Find --- */
    const save = makeBtn({ label: '💾', title: 'Save', onClick: saveTab });
    save.classList.add('sb-save');
    barRow.appendChild(save);

    barRow.appendChild(makeBtn({ label: '🔍', title: 'Find & Replace', onClick: () => { input.blur(); openFindBar(); } }));
}

/* ---- Keyboard-aware positioning ---- */
function repositionBar() {
    const vv = window.visualViewport;
    if (!vv) return;
    const keyboardOffset = Math.max(
        0,
        (window.innerHeight - vv.height - vv.offsetTop)
    );
    const restingGap = 26; /* clearance above the footer when no keyboard is showing */
    bar.style.bottom = (keyboardOffset > 0 ? keyboardOffset : restingGap) + 'px';
}

/* ---- Show/hide based on focus ---- */
function showBar() {
    bar.classList.remove('hidden');
    document.body.classList.add('shortcutbar-open');
    repositionBar();
}
function hideBar() {
    bar.classList.add('hidden');
    document.body.classList.remove('shortcutbar-open');
}

/* ---- Wire up ---- */
export function initShortcutBar() {
    buildBar();

    input.addEventListener('focus', showBar);
    input.addEventListener('blur', () => {
        /* Delay so tapping a bar button doesn't hide the bar mid-tap */
        setTimeout(() => {
            if (document.activeElement && bar.contains(document.activeElement)) return;
            hideBar();
        }, 150);
    });

    /* Show by default on narrow / touch screens so the user finds it. */
    const isTouch = matchMedia('(hover: none)').matches || window.innerWidth < 720;
    if (isTouch) {
        showBar();
    } else {
        hideBar();
    }

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', repositionBar);
        window.visualViewport.addEventListener('scroll', repositionBar);
    }
    window.addEventListener('resize', repositionBar);
}

