/* ============================================================
   Effective-language detection for HTML files.
   Given the full text and a caret position, decide whether the
   caret is really in:
     - 'html'  (regular markup)
     - 'css'   (inside <style>...</style>)
     - 'js'    (inside <script>...</script>)

   Also exposes helpers to find the boundaries of the current
   <style> or <script> body, which the renderer needs.
   ============================================================ */

const OPEN_STYLE  = /<style\b[^>]*>/gi;
const OPEN_SCRIPT = /<script\b[^>]*>/gi;
const CLOSE_STYLE  = /<\/style\s*>/gi;
const CLOSE_SCRIPT = /<\/script\s*>/gi;

/* Returns the language and, if applicable, the [start, end) of the
   inline block body (so callers can highlight just that slice). */
export function detectInlineLang(text, caret) {
    /* Quick reject: no <style or <script at all. */
    const lower = text.toLowerCase();
    if (!lower.includes('<style') && !lower.includes('<script')) {
        return { lang: 'html', block: null };
    }

    /* Find the nearest open tag before the caret. We check both
       <style> and <script>, take whichever is closest. */
    const lastStyle  = lastMatchBefore(text, OPEN_STYLE,  caret);
    const lastScript = lastMatchBefore(text, OPEN_SCRIPT, caret);

    const styleStart  = lastStyle  ? lastStyle.index + lastStyle[0].length  : -1;
    const scriptStart = lastScript ? lastScript.index + lastScript[0].length : -1;

    /* Neither open tag precedes the caret → plain HTML. */
    if (styleStart === -1 && scriptStart === -1) {
        return { lang: 'html', block: null };
    }

    /* Pick whichever open tag is *later* (closest to the caret). */
    const useStyle = styleStart > scriptStart;
    const bodyStart = useStyle ? styleStart : scriptStart;
    const tagName   = useStyle ? 'style' : 'script';

    /* Find the corresponding close tag AFTER bodyStart. */
    const closeRe = useStyle ? CLOSE_STYLE : CLOSE_SCRIPT;
    closeRe.lastIndex = bodyStart;
    const closeMatch = closeRe.exec(text);

    const bodyEnd = closeMatch ? closeMatch.index : text.length;

    /* If the caret is past the close tag, we're back in HTML. */
    if (caret > bodyEnd) {
        /* Could be another block further down — recurse. */
        return detectInlineLang(text.slice(bodyEnd), caret - bodyEnd);
    }

    return {
        lang: useStyle ? 'css' : 'js',
        block: { start: bodyStart, end: bodyEnd, tagName },
    };
}

/* Find the last regex match whose start index is strictly before `pos`.
   Returns { index, 0: matchedText, ... } or null. */
function lastMatchBefore(text, regex, pos) {
    regex.lastIndex = 0;
    let best = null;
    let m;
    while ((m = regex.exec(text)) !== null) {
        if (m.index >= pos) break;
        best = m;
        /* Advance past this match to avoid infinite loops on
           zero-width matches (shouldn't happen with our regexes,
           but safety). */
        if (m[0].length === 0) regex.lastIndex++;
    }
    return best;
}

/* Cheap convenience for callers who just want the language. */
export function effectiveLang(text, caret, fallback = 'html') {
    if (!text) return fallback;
    /* If the file isn't HTML, the file language wins. */
    const r = detectInlineLang(text, caret);
    return r.lang || fallback;
}

