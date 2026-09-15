import { highlight } from './highlighters.js';

export function highlightWithMarks(text, lang, matches, activeIdx) {
    if (matches.length === 0) return highlight(text, lang);

    const sorted = matches.slice().sort((a, b) => a.start - b.start);
    const parts = [];
    let cursor = 0;

    for (let i = 0; i < sorted.length; i++) {
        const m = sorted[i];
        if (m.start > cursor) parts.push(highlight(text.slice(cursor, m.start), lang));
        const slice = text.slice(m.start, m.end);
        const innerHtml = highlight(slice, lang);
        const cls = i === activeIdx ? 'find-hit current' : 'find-hit';
        parts.push(`<mark class="${cls}">${innerHtml}</mark>`);
        cursor = m.end;
    }
    if (cursor < text.length) parts.push(highlight(text.slice(cursor), lang));
    return parts.join('');
}

