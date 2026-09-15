/* ============================================================
   Effective-language detection for HTML files.

   Given text and a caret position, decide which language
   "owns" the caret:
     - 'html'  (regular markup or inside an unfinished tag)
     - 'css'   (inside a <style>...</style> body)
     - 'js'    (inside a <script>...</script> body)

   Rules:
     - We look for the most recent <style> or <script> tag that
       appears BEFORE the caret and whose closing tag has NOT
       already appeared before the caret.
     - If found, the caret is inside that block (unless we're still
       inside the opening tag itself — before its '>').
     - If not found, the caret is HTML.
   ============================================================ */

/* Find the LAST opening <script ...> or <style ...> tag that
   starts before `caret` and whose body we haven't already exited. */
function findActiveBlock(text, caret) {
    /* We scan forward, tracking which block (if any) we're inside.
       A block starts when we see <script...> or <style...> with a
       matching '>', and ends when we see </script> or </style>. */
    const lower = text.toLowerCase();
    let i = 0;
    let inside = null;    /* { tagName, bodyStart, openTagStart } */

    while (i < caret) {
        if (inside) {
            /* Looking for the closer */
            const closeTag = `</${inside.tagName}`;
            const closeIdx = lower.indexOf(closeTag, i);
            if (closeIdx === -1 || closeIdx >= caret) {
                /* Still inside this block at the caret. */
                /* But check: are we actually past bodyStart? */
                if (caret >= inside.bodyStart) {
                    return inside;
                }
                return null;   /* inside the opening tag itself */
            }
            /* Past the close tag — leave the block. */
            i = closeIdx + closeTag.length;
            inside = null;
            continue;
        }

        /* Look for the next opener */
        const styleIdx  = lower.indexOf('<style',  i);
        const scriptIdx = lower.indexOf('<script', i);
        let openIdx = -1;
        let whichTag = null;
        if (styleIdx !== -1 && (scriptIdx === -1 || styleIdx < scriptIdx)) {
            openIdx = styleIdx; whichTag = 'style';
        } else if (scriptIdx !== -1) {
            openIdx = scriptIdx; whichTag = 'script';
        }

        if (openIdx === -1 || openIdx >= caret) {
            /* No opener before the caret. */
            return null;
        }

        /* Find the '>' that ends the opening tag. */
        const gt = text.indexOf('>', openIdx);
        if (gt === -1 || gt >= caret) {
            /* Opening tag isn't complete yet — caret is inside it. */
            /* Return null so callers treat it as HTML (attributes
               etc.). This is the "typing <script " case. */
            return null;
        }

        inside = {
            tagName: whichTag,
            bodyStart: gt + 1,
            openTagStart: openIdx,
        };
        i = gt + 1;
    }

    return null;
}

export function detectInlineLang(text, caret) {
    const lower = text.toLowerCase();
    /* Cheap early-exit: no <style or <script at all. */
    if (!lower.includes('<style') && !lower.includes('<script')) {
        return { lang: 'html', block: null };
    }

    const block = findActiveBlock(text, caret);
    if (!block) return { lang: 'html', block: null };

    return {
        lang: block.tagName === 'style' ? 'css' : 'js',
        block: {
            start: block.bodyStart,
            end: text.indexOf(`</${block.tagName}`, block.bodyStart),
            tagName: block.tagName,
        },
    };
}

export function effectiveLang(text, caret, fallback = 'html') {
    if (!text) return fallback;
    const r = detectInlineLang(text, caret);
    return r.lang || fallback;
}