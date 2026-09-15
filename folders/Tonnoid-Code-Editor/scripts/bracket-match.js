/* ============================================================
   Bracket / tag matching
   Returns { open, close } character ranges to highlight, or null.
   ============================================================ */

const OPENERS = new Set(['(', '[', '{']);
const CLOSERS = new Set([')', ']', '}']);
const PAIRS   = { '(': ')', '[': ']', '{': '}' };
const REVERSE = { ')': '(', ']': '[', '}': '{' };

/* Given the source and the caret position, find a bracket
   immediately before or after the caret, and its match.
   Returns { open: idx, close: idx } or null.

   `isInStringOrComment(pos)` is provided by the caller so we can
   skip positions inside strings/comments when scanning. */
export function findBracketMatch(text, caret, isInStringOrComment) {
    /* Check character before caret first (what you just typed),
       then character at caret (what's ahead). */
    const candidates = [];
    if (caret > 0) candidates.push(caret - 1);
    if (caret < text.length) candidates.push(caret);

    for (const pos of candidates) {
        const ch = text[pos];
        if (!OPENERS.has(ch) && !CLOSERS.has(ch)) continue;
        if (isInStringOrComment && isInStringOrComment(pos)) continue;

        const match = OPENERS.has(ch)
            ? matchForward(text, pos, ch, isInStringOrComment)
            : matchBackward(text, pos, ch, isInStringOrComment);
        if (match != null) {
            return { open: Math.min(pos, match), close: Math.max(pos, match) };
        }
        /* If the char right at the caret has no match, don't try
           the other candidate — prefer nothing over a wrong pair. */
        return null;
    }
    return null;
}

function matchForward(text, start, opener, skip) {
    const closer = PAIRS[opener];
    let depth = 0;
    for (let i = start; i < text.length; i++) {
        if (skip && skip(i)) continue;
        const ch = text[i];
        if (ch === opener) depth++;
        else if (ch === closer) {
            depth--;
            if (depth === 0) return i;
        }
    }
    return null;
}

function matchBackward(text, start, closer, skip) {
    const opener = REVERSE[closer];
    let depth = 0;
    for (let i = start; i >= 0; i--) {
        if (skip && skip(i)) continue;
        const ch = text[i];
        if (ch === closer) depth++;
        else if (ch === opener) {
            depth--;
            if (depth === 0) return i;
        }
    }
    return null;
}

/* ------------------------------------------------------------
   HTML tag matching.
   Finds the tag under the caret (opening or closing) and its
   counterpart. Very simple — doesn't handle every edge case,
   but good enough for highlighting in an editor.
   ------------------------------------------------------------ */
export function findTagMatch(text, caret) {
    /* Find the tag that encloses the caret position. */
    const before = text.lastIndexOf('<', caret);
    if (before === -1) return null;

    /* Find the next '>' after `before` */
    const gt = text.indexOf('>', before);
    if (gt === -1) return null;

    /* If caret is past this tag's '>', it's not in a tag. */
    if (caret > gt && text.lastIndexOf('>', caret) === gt) return null;

    /* Extract the tag text up to the caret (or up to '>'). */
    const tagText = text.slice(before, gt + 1);
    const m = tagText.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/);
    if (!m) return null;
    const closing = m[1] === '/';
    const name = m[2].toLowerCase();

    /* Void tags have no match. */
    const VOID = new Set([
        'area','base','br','col','embed','hr','img','input',
        'link','meta','param','source','track','wbr',
    ]);
    if (VOID.has(name)) return null;

    /* If it's a self-closing tag (`<foo />`), no match either. */
    if (/\/\s*>$/.test(tagText)) return null;

    if (!closing) {
        /* Find the matching close tag, accounting for nesting. */
        const openTagRe  = new RegExp(`<${name}\\b`, 'gi');
        const closeTagRe = new RegExp(`</${name}\\s*>`, 'gi');
        const pos = { open: before, close: -1 };
        let depth = 1;
        let i = gt + 1;
        while (i < text.length) {
            openTagRe.lastIndex = i;
            closeTagRe.lastIndex = i;
            const nextOpen  = openTagRe.exec(text);
            const nextClose = closeTagRe.exec(text);
            if (!nextClose) break;
            if (nextOpen && nextOpen.index < nextClose.index) {
                depth++;
                i = nextOpen.index + nextOpen[0].length;
            } else {
                depth--;
                if (depth === 0) {
                    pos.close = nextClose.index;
                    return pos;
                }
                i = nextClose.index + nextClose[0].length;
            }
        }
        return null;
    } else {
        /* Find the matching open tag by scanning backward with a counter. */
        const openTagRe  = new RegExp(`<${name}\\b`, 'gi');
        const closeTagRe = new RegExp(`</${name}\\s*>`, 'gi');
        let depth = 1;
        /* Collect all open positions before the caret and all close
           positions before the caret, then walk backward. */
        const opens = [];
        const closes = [];
        let m2;
        openTagRe.lastIndex = 0;
        while ((m2 = openTagRe.exec(text)) !== null && m2.index < before) opens.push(m2.index);
        closeTagRe.lastIndex = 0;
        while ((m2 = closeTagRe.exec(text)) !== null && m2.index < before) closes.push(m2.index);
        /* Walk backward from `before`, matching opens/closes. */
        let oi = opens.length - 1;
        let ci = closes.length - 1;
        while (oi >= 0) {
            const o = opens[oi];
            const c = ci >= 0 ? closes[ci] : -1;
            if (c > o) {
                depth++;
                ci--;
            } else {
                depth--;
                if (depth === 0) return { open: o, close: before };
                oi--;
            }
        }
        return null;
    }
}

