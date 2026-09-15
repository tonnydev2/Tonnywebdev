function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------- JavaScript ---------- */
const JS_KEYWORDS = new Set([
    "const","let","var","function","return","if","else","for","while","do",
    "switch","case","break","continue","default","class","extends","super",
    "new","this","typeof","instanceof","in","of","try","catch","finally",
    "throw","async","await","yield","import","export","from","as","static",
    "get","set","delete","void","null","undefined","true","false","constructor"
]);

export function highlightJS(code) {
    const out = [];
    let i = 0;
    const n = code.length;
    const isIdentStart = c => /[A-Za-z_$]/.test(c);
    const isIdentChar  = c => /[A-Za-z0-9_$]/.test(c);

    while (i < n) {
        const c = code[i];

        if (c === '/' && code[i + 1] === '/') {
            let j = i;
            while (j < n && code[j] !== '\n') j++;
            out.push(`<span class="com">${escapeHtml(code.slice(i, j))}</span>`);
            i = j;
            continue;
        }
        if (c === '/' && code[i + 1] === '*') {
            let j = i + 2;
            while (j < n && !(code[j] === '*' && code[j + 1] === '/')) j++;
            j = Math.min(j + 2, n);
            out.push(`<span class="com">${escapeHtml(code.slice(i, j))}</span>`);
            i = j;
            continue;
        }
        if (c === '"' || c === "'" || c === '`') {
            const quote = c;
            let j = i + 1;
            while (j < n && code[j] !== quote) {
                if (code[j] === '\\') j++;
                j++;
            }
            j = Math.min(j + 1, n);
            out.push(`<span class="str">${escapeHtml(code.slice(i, j))}</span>`);
            i = j;
            continue;
        }
        if (/[0-9]/.test(c)) {
            let j = i;
            while (j < n && /[0-9a-fA-Fx._]/.test(code[j])) j++;
            out.push(`<span class="num">${escapeHtml(code.slice(i, j))}</span>`);
            i = j;
            continue;
        }
        if (isIdentStart(c)) {
            let j = i;
            while (j < n && isIdentChar(code[j])) j++;
            const word = code.slice(i, j);
            let k = i - 1;
            while (k >= 0 && /\s/.test(code[k])) k--;
            const prevNonSpace = k >= 0 ? code[k] : '';
            let nextNonSpace = j;
            while (nextNonSpace < n && /\s/.test(code[nextNonSpace])) nextNonSpace++;
            const nextCh = code[nextNonSpace];

            if (JS_KEYWORDS.has(word)) {
                out.push(`<span class="kw">${escapeHtml(word)}</span>`);
            } else if (prevNonSpace === '.') {
                out.push(`<span class="prop">${escapeHtml(word)}</span>`);
            } else if (nextCh === '(') {
                out.push(`<span class="fn">${escapeHtml(word)}</span>`);
            } else {
                out.push(escapeHtml(word));
            }
            i = j;
            continue;
        }
        if (/[{}()\[\];,.:?]/.test(c)) {
            out.push(`<span class="punc">${escapeHtml(c)}</span>`);
            i++;
            continue;
        }
        if (/[+\-*/%=<>!&|^~]/.test(c)) {
            let j = i;
            while (j < n && /[+\-*/%=<>!&|^~]/.test(code[j])) j++;
            out.push(`<span class="op">${escapeHtml(code.slice(i, j))}</span>`);
            i = j;
            continue;
        }
        out.push(escapeHtml(c));
        i++;
    }
    return out.join('');
}

/* ---------- CSS (declared before HTML so HTML can call it) ---------- */
export function highlightCSS(code) {
    const out = [];
    let i = 0;
    const n = code.length;

    while (i < n) {
        const c = code[i];
        if (c === '/' && code[i + 1] === '*') {
            let j = i + 2;
            while (j < n && !(code[j] === '*' && code[j + 1] === '/')) j++;
            j = Math.min(j + 2, n);
            out.push(`<span class="com">${escapeHtml(code.slice(i, j))}</span>`);
            i = j;
            continue;
        }
        if (c === '"' || c === "'") {
            const q = c;
            let j = i + 1;
            while (j < n && code[j] !== q) {
                if (code[j] === '\\') j++;
                j++;
            }
            j = Math.min(j + 1, n);
            out.push(`<span class="str">${escapeHtml(code.slice(i, j))}</span>`);
            i = j;
            continue;
        }
        if (/[.#a-zA-Z@]/.test(c) || c === ':') {
            let j = i;
            while (j < n && /[a-zA-Z0-9_\-.#@:%]/.test(code[j])) j++;
            const token = code.slice(i, j);
            let peek = j;
            while (peek < n && /\s/.test(code[peek])) peek++;
            if (peek < n && code[peek] === '{') {
                out.push(`<span class="selector">${escapeHtml(token)}</span>`);
            } else if (peek < n && code[peek] === ':') {
                out.push(`<span class="property">${escapeHtml(token)}</span>`);
            } else {
                out.push(escapeHtml(token));
            }
            i = j;
            continue;
        }
        if (/[0-9]/.test(c)) {
            let j = i;
            while (j < n && /[0-9a-fA-F.#%a-z]/.test(code[j])) j++;
            out.push(`<span class="num">${escapeHtml(code.slice(i, j))}</span>`);
            i = j;
            continue;
        }
        if (/[{}();:,]/.test(c)) {
            out.push(`<span class="punc">${escapeHtml(c)}</span>`);
            i++;
            continue;
        }
        if (/[+\-*/=<>!&|^~]/.test(c)) {
            let j = i;
            while (j < n && /[+\-*/=<>!&|^~]/.test(code[j])) j++;
            out.push(`<span class="op">${escapeHtml(code.slice(i, j))}</span>`);
            i = j;
            continue;
        }
        out.push(escapeHtml(c));
        i++;
    }
    return out.join('');
}

/* ---------- HTML ---------- */
export function highlightHTML(code) {
    const out = [];
    let i = 0;
    const n = code.length;

    while (i < n) {
        const c = code[i];

        /* HTML comment */
        if (c === '<' && code[i + 1] === '!' && code[i + 2] === '-' && code[i + 3] === '-') {
            let j = i + 4;
            while (j < n && !(code[j] === '-' && code[j + 1] === '-' && code[j + 2] === '>')) j++;
            j = Math.min(j + 3, n);
            out.push(`<span class="com">${escapeHtml(code.slice(i, j))}</span>`);
            i = j;
            continue;
        }

        if (c === '<') {
            let j = i + 1;

            /* Closing tag */
            if (code[j] === '/') {
                j++;
                const tagStart = j;
                while (j < n && /[A-Za-z0-9-]/.test(code[j])) j++;
                out.push(`<span class="punc">&lt;/</span><span class="tag">${escapeHtml(code.slice(tagStart, j))}</span>`);
                while (j < n && code[j] !== '>') {
                    if (code[j] === '"' || code[j] === "'") {
                        const q = code[j];
                        let k = j + 1;
                        while (k < n && code[k] !== q) k++;
                        out.push(`<span class="str">${escapeHtml(code.slice(j, k + 1))}</span>`);
                        j = k + 1;
                    } else {
                        out.push(escapeHtml(code[j]));
                        j++;
                    }
                }
                if (j < n && code[j] === '>') {
                    out.push(`<span class="punc">&gt;</span>`);
                    j++;
                }
                i = j;
                continue;
            }

            /* Opening tag */
            const tagStart = j;
            while (j < n && /[A-Za-z0-9-]/.test(code[j])) j++;

            if (j > tagStart) {
                const tagName = code.slice(tagStart, j).toLowerCase();
                out.push(`<span class="punc">&lt;</span><span class="tag">${escapeHtml(code.slice(tagStart, j))}</span>`);

                let pendingAttr = null;
                while (j < n && code[j] !== '>') {
                    if (code[j] === '"' || code[j] === "'") {
                        const q = code[j];
                        let k = j + 1;
                        while (k < n && code[k] !== q) k++;
                        k = Math.min(k, n);
                        const inner = code.slice(j + 1, k);
                        if (pendingAttr === 'style') {
                            out.push(`<span class="str">${q}</span>${highlightCSS(inner)}<span class="str">${q}</span>`);
                        } else {
                            out.push(`<span class="str">${escapeHtml(code.slice(j, Math.min(k + 1, n)))}</span>`);
                        }
                        j = Math.min(k + 1, n);
                        pendingAttr = null;
                    } else if (/[A-Za-z-]/.test(code[j])) {
                        const attrStart = j;
                        while (j < n && /[A-Za-z0-9-]/.test(code[j])) j++;
                        const attrName = code.slice(attrStart, j);
                        let peek = j;
                        while (peek < n && /\s/.test(code[peek])) peek++;
                        if (peek < n && code[peek] === '=') {
                            out.push(`<span class="attr">${escapeHtml(attrName)}</span>`);
                            pendingAttr = attrName.toLowerCase();
                        } else {
                            out.push(escapeHtml(attrName));
                            pendingAttr = null;
                        }
                    } else {
                        out.push(escapeHtml(code[j]));
                        j++;
                    }
                }
                if (j < n && code[j] === '>') {
                    out.push(`<span class="punc">&gt;</span>`);
                    j++;
                }
                i = j;

                /* <style> / <script> bodies — with string/comment-aware close search */
                if (tagName === 'style' || tagName === 'script') {
                    const bodyStart = i;
                    const bodyEnd = findInlineBlockClose(code, bodyStart, tagName);
                    const body = code.slice(bodyStart, bodyEnd);
                    if (body.length) {
                        out.push(tagName === 'style' ? highlightCSS(body) : highlightJS(body));
                    }
                    i = bodyEnd;
                }
                continue;
            }
        }

        out.push(escapeHtml(c));
        i++;
    }
    return out.join('');
}

/* Find the index of the `</tag>` closing a <style> or <script> block,
   skipping over string literals (for script) and CSS comments (for style).
   Returns text.length if no closer is found. */
function findInlineBlockClose(code, from, tagName) {
    const closer = `</${tagName}`;
    const lower  = code.toLowerCase();

    if (tagName === 'style') {
        /* In CSS, `</style>` inside a comment doesn't count. Walk
           through, tracking /* *\/ state. */
        let i = from;
        const n = code.length;
        while (i < n) {
            if (code[i] === '/' && code[i + 1] === '*') {
                /* Skip to end of comment */
                const end = code.indexOf('*/', i + 2);
                i = end === -1 ? n : end + 2;
                continue;
            }
            if (lower.startsWith(closer, i)) return i;
            i++;
        }
        return n;
    }

    /* For script: skip over strings (' ", `). Does not handle regex
       literals — a `</script>` inside a regex will still fool this.
       In practice, that pattern is rare enough to accept. */
    let i = from;
    const n = code.length;
    while (i < n) {
        const c = code[i];
        if (c === '"' || c === "'" || c === '`') {
            const q = c;
            i++;
            while (i < n && code[i] !== q) {
                if (code[i] === '\\') i++;
                i++;
            }
            i++;    /* step past the closing quote */
            continue;
        }
        if (c === '/' && code[i + 1] === '/') {
            /* line comment */
            while (i < n && code[i] !== '\n') i++;
            continue;
        }
        if (c === '/' && code[i + 1] === '*') {
            const end = code.indexOf('*/', i + 2);
            i = end === -1 ? n : end + 2;
            continue;
        }
        if (lower.startsWith(closer, i)) return i;
        i++;
    }
    return n;
}
/* ---------- Dispatcher ---------- */
export function highlight(code, lang) {
    if (lang === 'html') return highlightHTML(code);
    if (lang === 'css')  return highlightCSS(code);
    return highlightJS(code);
}

