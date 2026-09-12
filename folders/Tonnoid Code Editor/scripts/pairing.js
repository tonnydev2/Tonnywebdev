import { input } from './dom.js';
import { currentFileLang, getActiveTab } from './tabs.js';
import { render } from './render.js';
import { closeAutocomplete, getAcState, renderAcBox } from './autocomplete.js';

export const BRACKET_PAIRS = { '(': ')', '[': ']', '{': '}' };
export const CLOSERS        = new Set(Object.values(BRACKET_PAIRS));
export const QUOTE_CHARS    = new Set(['"', "'", '`']);
export const VOID_TAGS      = new Set([
    'area','base','br','col','embed','hr','img','input',
    'link','meta','param','source','track','wbr'
]);

export function setCaret(pos) {
    input.selectionStart = input.selectionEnd = pos;
}

export function isBetweenPair(value, caret) {
    if (caret <= 0 || caret >= value.length) return false;
    const prevChar = value[caret - 1];
    const nextChar = value[caret];
    if (BRACKET_PAIRS[prevChar] === nextChar) return true;
    if (QUOTE_CHARS.has(prevChar) && prevChar === nextChar) return true;
    return false;
}

export function openTagAtCursor(value, pos) {
    const before = value.slice(0, pos);
    const lastLt = before.lastIndexOf('<');
    const lastGt = before.lastIndexOf('>');
    if (lastLt === -1 || lastLt < lastGt) return null;
    const tagText = before.slice(lastLt);
    if (/^<!/.test(tagText) || /^<\//.test(tagText)) return null;
    const m = tagText.match(/^<([a-zA-Z][a-zA-Z0-9-]*)/);
    if (!m) return null;
    if (/\/\s*$/.test(tagText)) return null;
    const tagName = m[1];
    if (VOID_TAGS.has(tagName.toLowerCase())) return null;
    return tagName;
}

export function indentContext(value, pos) {
    const charBefore = value[pos - 1];
    if (BRACKET_PAIRS[charBefore]) return { close: BRACKET_PAIRS[charBefore] };
    if (charBefore === '>') {
        const before = value.slice(0, pos);
        const m = before.match(/<([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^<>]*)?>$/);
        if (m && !/\/\s*>$/.test(before)) {
            const tagName = m[1];
            if (!VOID_TAGS.has(tagName.toLowerCase())) {
                return { close: `</${tagName}>` };
            }
        }
    }
    return null;
}

export function tryExpandEmmetBang(value, start, end) {
    if (currentFileLang() !== 'html') return null;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineBefore = value.slice(lineStart, start);
    if (!/^\s*!$/.test(lineBefore)) return null;

    const lineEndIdx = value.indexOf('\n', start);
    const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
    if (end !== lineEnd && !/^\s*$/.test(value.slice(end, lineEnd))) return null;

    const indent = (lineBefore.match(/^[ \t]*/) || [''])[0];
    const snippet = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <title>Document</title>',
        '</head>',
        '<body>',
        '  ',
        '</body>',
        '</html>',
    ].join('\n' + indent);
    const replacement = indent + snippet;

    input.value = value.slice(0, lineStart) + replacement + value.slice(lineEnd);

    const bodyLineOffset = replacement.indexOf('<body>');
    const afterBodyLine = replacement.indexOf('\n', bodyLineOffset) + 1;
    const caretPos = lineStart + afterBodyLine + indent.length + 2;
    setCaret(caretPos);

    render();
    return true;
}

/* Keydown handler — attach from main.js */
export function onKeyDown(e) {
    const acState = getAcState();

    /* Ctrl+S */
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        document.getElementById('saveFileBtn').click();
        return;
    }
    /* Ctrl+N */
    if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        const addBtn = document.getElementById('tabAddBtn');
        if (addBtn) addBtn.click();
        return;
    }
    /* Ctrl+Space */
    if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
        e.preventDefault();
        /* openAutocomplete imported lazily to avoid circular */
        import('./autocomplete.js').then(m => m.openAutocomplete(true));
        return;
    }

    if (acState.open) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            acState.activeIdx = (acState.activeIdx + 1) % acState.items.length;
            renderAcBox();
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            acState.activeIdx = (acState.activeIdx - 1 + acState.items.length) % acState.items.length;
            renderAcBox();
            return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            import('./autocomplete.js').then(m => m.acceptAutocomplete());
            return;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            closeAutocomplete();
            return;
        }
    }

    /* Emmet ! + Enter */
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const value = input.value;
        const start = input.selectionStart;
        const end   = input.selectionEnd;
        if (tryExpandEmmetBang(value, start, end)) {
            e.preventDefault();
            return;
        }
    }

    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const value = input.value;
    const start = input.selectionStart;
    const end   = input.selectionEnd;
    const hasSelection = start !== end;

    if (e.key === 'Backspace' && !hasSelection && isBetweenPair(value, start)) {
        e.preventDefault();
        e.stopPropagation();
        input.value = value.slice(0, start - 1) + value.slice(start + 1);
        setCaret(start - 1);
        render();
        return;
    }
    if (e.key === 'Delete' && !hasSelection && isBetweenPair(value, start)) {
        e.preventDefault();
        e.stopPropagation();
        input.value = value.slice(0, start - 1) + value.slice(start + 1);
        setCaret(start - 1);
        render();
        return;
    }
    if (e.key === 'Tab') {
        e.preventDefault();
        input.value = value.slice(0, start) + '  ' + value.slice(end);
        setCaret(start + 2);
        render();
        return;
    }
}

/* Beforeinput handler — attach from main.js */
export function onBeforeInput(e) {
    const value = input.value;
    const start = input.selectionStart;
    const end   = input.selectionEnd;
    const hasSelection = start !== end;

    if (e.inputType === 'insertLineBreak' && !hasSelection) {
        e.preventDefault();
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const indent = (value.slice(lineStart, start).match(/^[ \t]*/) || [''])[0];
        const ctx = indentContext(value, start);
        const isAdjacentPair = ctx && value.slice(start, start + ctx.close.length) === ctx.close;

        let insertion, caretOffset;
        if (isAdjacentPair) {
            const innerIndent = indent + '  ';
            insertion = '\n' + innerIndent + '\n' + indent;
            caretOffset = 1 + innerIndent.length;
        } else if (ctx) {
            insertion = '\n' + indent + '  ';
            caretOffset = insertion.length;
        } else {
            insertion = '\n' + indent;
            caretOffset = insertion.length;
        }
        input.value = value.slice(0, start) + insertion + value.slice(end);
        setCaret(start + caretOffset);
        render();
        return;
    }

    if (e.inputType !== 'insertText' || !e.data || e.data.length !== 1) return;
    const key = e.data;

    if (BRACKET_PAIRS[key]) {
        e.preventDefault();
        const close = BRACKET_PAIRS[key];
        if (hasSelection) {
            const selected = value.slice(start, end);
            input.value = value.slice(0, start) + key + selected + close + value.slice(end);
            input.selectionStart = start + 1;
            input.selectionEnd   = start + 1 + selected.length;
        } else {
            input.value = value.slice(0, start) + key + close + value.slice(end);
            setCaret(start + 1);
        }
        render();
        return;
    }

    if (CLOSERS.has(key) && !hasSelection && value[start] === key) {
        e.preventDefault();
        setCaret(start + 1);
        return;
    }

    if (QUOTE_CHARS.has(key)) {
        e.preventDefault();
        if (hasSelection) {
            const selected = value.slice(start, end);
            input.value = value.slice(0, start) + key + selected + key + value.slice(end);
            input.selectionStart = start + 1;
            input.selectionEnd   = start + 1 + selected.length;
        } else if (value[start] === key) {
            setCaret(start + 1);
            return;
        } else {
            input.value = value.slice(0, start) + key + key + value.slice(end);
            setCaret(start + 1);
        }
        render();
        return;
    }

    if (key === '>' && currentFileLang() === 'html' && !hasSelection) {
        const tagName = openTagAtCursor(value, start);
        if (tagName) {
            e.preventDefault();
            const closing = `</${tagName}>`;
            input.value = value.slice(0, start) + '>' + closing + value.slice(end);
            setCaret(start + 1);
            render();
        }
    }
}

