/* ============================================================
   Lantern — entry point.
   ============================================================ */

import { input, fileTypeSelect } from './dom.js';
import { DEFAULT_LANG, DEFAULT_HTML, tabs } from './state.js';
import { loadSavedFiles } from './storage.js';
import { render, syncSize } from './render.js';
import { createTab, uniqueNewName, getActiveTab, renderTabs, switchToTab } from './tabs.js';
import { closeAutocomplete, openAutocomplete, getWordAtCaret } from './autocomplete.js';
import { onKeyDown, onBeforeInput } from './pairing.js';
import { initFileButtons } from './files.js';
import './find.js';
import { initShortcutBar } from './shortcutBar.js';
import { initCloudUI } from './cloud-ui.js';
import { initPreview } from './preview.js';
import { initConsole } from './console-pannel.js';
import { loadAssets } from './assets.js';
import { initOverflowMenu } from './overflow.js';
import { initPWA } from './pwa.js';

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
    import('./autocomplete.js').then(m => m.repositionAutocomplete?.());
});

/* Re-render on selection change so bracket-match updates. */
input.addEventListener('click', render);
input.addEventListener('keyup', (e) => {
    /* Only re-render for pure navigation keys that move the caret. */
    const navKeys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'];
    if (navKeys.includes(e.key)) render();
});
input.addEventListener('select', render);

input.addEventListener('keydown', onKeyDown);
input.addEventListener('beforeinput', onBeforeInput);

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

window.addEventListener('resize', () => {
    syncSize();
    import('./autocomplete.js').then(m => m.repositionAutocomplete?.());
});

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
    initPreview();
    initConsole();
    initOverflowMenu();
    initPWA();
    loadAssets();

    render();
}

init();