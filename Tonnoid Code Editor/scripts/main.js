/* ============================================================
   Lantern — entry point.
   Wire everything together after all modules are loaded.
   ============================================================ */

import { input, fileTypeSelect } from './dom.js';
import { DEFAULT_LANG, DEFAULT_HTML, tabs } from './state.js';
import { loadSavedFiles } from './storage.js';
import { render, syncSize } from './render.js';
import { createTab, uniqueNewName, getActiveTab, renderTabs, switchToTab } from './tabs.js';
import { closeAutocomplete, openAutocomplete, getWordAtCaret } from './autocomplete.js';
import { onKeyDown, onBeforeInput } from './pairing.js';
import { initFileButtons } from './files.js';
import './find.js';   /* attaches find-bar listeners on import */
import { initShortcutBar } from './shortcutBar.js';
import { initCloudUI } from './cloud-ui.js';

/* ---- Input events ---- */
input.addEventListener('input', () => {
    const tab = getActiveTab();
    if (tab) tab.content = input.value;

    render();

    const { prefix } = getWordAtCaret();
    if (prefix.length >= 2) openAutocomplete(false);
    else closeAutocomplete();
});

 input.addEventListener('scroll', () => {
    const hp = document.getElementById('highlight');
    const g  = document.getElementById('gutter');
    if (hp) { hp.scrollTop = input.scrollTop; hp.scrollLeft = input.scrollLeft; }
    if (g)  { g.scrollTop  = input.scrollTop; }
    /* reposition autocomplete if open */
    import('./autocomplete.js').then(m => m.repositionAutocomplete?.());
});

/* ---- Key events routed to pairing.js ---- */
input.addEventListener('keydown', onKeyDown);
input.addEventListener('beforeinput', onBeforeInput);

/* ---- File-type dropdown ---- */
fileTypeSelect.addEventListener('change', () => {
    const lang = fileTypeSelect.value;
    const tab = getActiveTab();
    if (!tab) return;
    tab.lang = lang;
    tab.name = tab.name.replace(/\.[^.]+$/, '.' + lang);
    closeAutocomplete();
    renderTabs();
    render();
});

/* ---- Resize ---- */
window.addEventListener('resize', () => {
    syncSize();
    import('./autocomplete.js').then(m => m.repositionAutocomplete?.());
});

/* ---- Boot ---- */
export function init() {
    loadSavedFiles();

    createTab({
        name: uniqueNewName('html'),
        lang: 'html',
        content: DEFAULT_HTML,
    });

    initFileButtons();
    initShortcutBar();
    initCloudUI();

    render();
}

init();
