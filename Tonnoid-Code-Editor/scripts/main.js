/* ============================================================
   Lantern — entry point.
   ============================================================ */
import { input, fileTypeSelect } from './dom.js';
import { DEFAULT_LANG, DEFAULT_HTML, getActiveProjectId, setActiveProjectId, projects } from './state.js';
import { loadSavedFiles, persistAll } from './storage.js';
import { render, syncSize } from './render.js';
import { createTab, uniqueNewName, getActiveTab, renderTabs, switchToTab, reloadForProject } from './tabs.js';
import { closeAutocomplete, openAutocomplete, getWordAtCaret } from './autocomplete.js';
import { onKeyDown, onBeforeInput } from './pairing.js';
import { initFileButtons } from './files.js';
import './find.js';
import { initShortcutBar } from './shortcutBar.js';
import { initCloud, initCloudUI } from './cloud.js';
import { initPreview } from './preview.js';
import { initConsole } from './console-pannel.js';
import { loadAssets } from './assets.js';
import { initOverflowMenu } from './overflow.js';
import { initPWA } from './pwa.js';
import { initProjects, createProject, setProjectSwitchHandler } from './projects.js';
import { attachSW, pushSnapshot } from './sw-fs.js';

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

input.addEventListener('click', render);
input.addEventListener('keyup', (e) => {
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

export async function init() {
    loadSavedFiles();

    /* Ensure there's at least one project. */
    if (projects.length === 0) {
        /* Migrate or create a fresh one. */
        const p = createProject('My project');
        setActiveProjectId(p.id);
    } else if (!getActiveProjectId()) {
        setActiveProjectId(projects[0].id);
    }
    
    /* Purge any stale service workers (from previous folder layouts). */

    /* Register the SW as our virtual filesystem. */
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
            await navigator.serviceWorker.ready;
            attachSW(reg);
            pushSnapshot();
        } catch (e) {
            console.warn('[main] SW registration failed:', e);
        }
    }

    /* When the project changes, refresh the UI. */
    setProjectSwitchHandler((projectId) => {
        reloadForProject();
        pushSnapshot();
    });

    /* Initial tab. */
    reloadForProject();

    initFileButtons();
    initShortcutBar();
    initCloud();
    initCloudUI();
    initPreview();
    initConsole();
    initOverflowMenu();
    initPWA();
    initProjects();
    loadAssets();

    render();
    persistAll();
}

init();