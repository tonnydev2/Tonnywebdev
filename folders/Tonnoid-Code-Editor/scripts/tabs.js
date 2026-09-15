import {
    projectFiles, tabsByProject, activeTabIdByProject,
    getActiveProjectId, nextTabId, DEFAULT_LANG,
} from './state.js';
import { input, fileTypeSelect, tabsBar } from './dom.js';
import { render } from './render.js';
import { closeAutocomplete } from './autocomplete.js';
import { askFileName } from './filename-dialog.js';
import { persistAll } from './storage.js';
import { scheduleSnapshot } from './sw-fs.js';

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* -------- Helpers scoped to the active project -------- */

function currentTabs() {
    const pid = getActiveProjectId();
    if (!pid) return [];
    if (!tabsByProject[pid]) tabsByProject[pid] = [];
    return tabsByProject[pid];
}

function currentActiveTabId() {
    const pid = getActiveProjectId();
    return pid ? activeTabIdByProject[pid] : null;
}

function setCurrentActiveTabId(id) {
    const pid = getActiveProjectId();
    if (pid) activeTabIdByProject[pid] = id;
}

export function getActiveTab() {
    const id = currentActiveTabId();
    return currentTabs().find(t => t.id === id) || null;
}

export function currentFileLang() {
    const t = getActiveTab();
    return t ? t.lang : DEFAULT_LANG;
}

export function isDirty(tab) {
    if (!tab) return false;
    const pid = getActiveProjectId();
    const stored = projectFiles[pid]?.[tab.name];
    if (!stored) return tab.content !== '';
    return tab.content !== stored.savedContent;
}

/* Filenames in use in this project (for uniqueness). */
function usedNames(pid) {
    return new Set(Object.keys(projectFiles[pid] || {}));
}

export function uniqueNewName(lang) {
    const pid = getActiveProjectId();
    const used = usedNames(pid);
    let n = 1;
    let name = `untitled.${lang}`;
    while (used.has(name)) {
        name = `untitled_${n}.${lang}`;
        n += 1;
    }
    return name;
}

/* ---------- Create / switch / close ---------- */

export function createTab({ name, lang, content, savedContent }) {
    const pid = getActiveProjectId();
    if (!pid) return null;

    const finalLang = lang || DEFAULT_LANG;
    const finalName = name || uniqueNewName(finalLang);

    /* If the project already has this file, open it as a tab. */
    const projectFile = projectFiles[pid][finalName];
    if (projectFile) {
        const tabs = currentTabs();
        const existing = tabs.find(t => t.name === finalName);
        if (existing) { switchToTab(existing.id); return existing; }
        const tab = {
            id: nextTabId(),
            name: finalName,
            lang: projectFile.lang,
            content: projectFile.content,
            savedContent: projectFile.savedContent,
        };
        tabs.push(tab);
        switchToTab(tab.id);
        return tab;
    }

    /* Otherwise create it. */
    const initialContent = content !== undefined ? content : '';
    projectFiles[pid][finalName] = {
        lang: finalLang,
        content: initialContent,
        savedContent: savedContent !== undefined ? savedContent : initialContent,
    };
    const tab = {
        id: nextTabId(),
        name: finalName,
        lang: finalLang,
        content: projectFiles[pid][finalName].content,
        savedContent: projectFiles[pid][finalName].savedContent,
    };
    currentTabs().push(tab);
    switchToTab(tab.id);
    persistAll();
    scheduleSnapshot();
    return tab;
}

export function switchToTab(id) {
    const outgoing = getActiveTab();
    if (outgoing && outgoing.id !== id) {
        outgoing.content = input.value;
        /* Save into projectFiles so tab switches persist. */
        const pid = getActiveProjectId();
        if (pid && projectFiles[pid][outgoing.name]) {
            projectFiles[pid][outgoing.name].content = input.value;
        }
    }

    setCurrentActiveTabId(id);
    const tab = getActiveTab();
    if (!tab) return;

    input.value = tab.content;
    fileTypeSelect.value = tab.lang;
    closeAutocomplete();
    renderTabs();
    render();
    scrollTabsToActive();
    persistAll();
    scheduleSnapshot();
}

/* Called when the project changes. Re-renders everything. */
export function reloadForProject() {
    const tabs = currentTabs();
    if (tabs.length === 0) {
        /* Create a starter tab if the project is empty. */
        const pid = getActiveProjectId();
        const firstName = Object.keys(projectFiles[pid] || {})[0];
        if (firstName) {
            createTab({ name: firstName });
            return;
        }
        createTab({ name: 'index.html', lang: 'html', content: '' });
        return;
    }
    let activeId = currentActiveTabId();
    if (!activeId || !tabs.find(t => t.id === activeId)) {
        activeId = tabs[0].id;
        setCurrentActiveTabId(activeId);
    }
    switchToTab(activeId);
    renderTabs();
}

export function closeTab(id) {
    const tabs = currentTabs();
    const idx = tabs.findIndex(t => t.id === id);
    if (idx === -1) return;
    const tab = tabs[idx];

    if (isDirty(tab)) {
        const ok = confirm(`"${tab.name}" has unsaved changes. Close anyway?`);
        if (!ok) return;
    }

    tabs.splice(idx, 1);

    if (tabs.length === 0) {
        createTab({ name: uniqueNewName(DEFAULT_LANG), lang: DEFAULT_LANG, content: '' });
        return;
    }

    if (currentActiveTabId() === id) {
        const nextIdx = Math.max(0, idx - 1);
        switchToTab(tabs[nextIdx].id);
    } else {
        renderTabs();
    }
}

/* ---------- Rename ---------- */

function promptRenameTab(tab) {
    askFileName({
        title: 'Rename file',
        lang: tab.lang,
        initial: tab.name,
        mode: 'rename',
        onConfirm: (newName) => {
            const pid = getActiveProjectId();
            const tabs = currentTabs();
            const clash = tabs.find(t => t.name === newName && t.id !== tab.id);
            if (clash) { alert(`"${newName}" is already open.`); return; }

            const oldName = tab.name;
            tab.name = newName;

            /* Move the project file entry. */
            const pf = projectFiles[pid];
            if (pf[oldName]) {
                pf[newName] = pf[oldName];
                delete pf[oldName];
            }
            persistAll();
            scheduleSnapshot();
            renderTabs();
            render();

            /* Best-effort cloud rename. */
            import('./cloud.js').then(m => m.renameFile(oldName, newName)).catch(() => {});
        },
    });
}

/* ---------- Render the strip ---------- */

export function renderTabs() {
    const activeId = currentActiveTabId();
    const tabs = currentTabs();
    const parts = tabs.map(tab => {
        const activeClass = tab.id === activeId ? 'active' : '';
        const dirtyClass  = isDirty(tab) ? 'dirty' : '';
        const base = tab.name.replace(/\.[^.]+$/, '');
        const ext  = tab.lang;
        return `
            <div class="tab ${activeClass} ${dirtyClass}" data-tab-id="${tab.id}" role="tab" title="${escapeHtml(tab.name)}">
                <span class="tab-dirty"></span>
                <span class="tab-name">${escapeHtml(base)}.<b>${escapeHtml(ext)}</b></span>
                <span class="tab-close" data-close-id="${tab.id}" title="Close">×</span>
            </div>
        `;
    });
    parts.push(`<button class="tab-add" id="tabAddBtn" title="New file (Ctrl+N)">＋</button>`);
    tabsBar.innerHTML = parts.join('');

    tabsBar.querySelectorAll('.tab').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.tab-close')) return;
            switchToTab(el.dataset.tabId);
        });
        el.addEventListener('dblclick', (e) => {
            if (e.target.closest('.tab-close')) return;
            const tab = currentTabs().find(t => t.id === el.dataset.tabId);
            if (tab) promptRenameTab(tab);
        });
    });
    tabsBar.querySelectorAll('.tab-close').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(el.dataset.closeId);
        });
    });
    const addBtn = document.getElementById('tabAddBtn');
    if (addBtn) addBtn.addEventListener('click', () => {
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
                createTab({ name, lang, content: emptyContent });
            },
        });
    });
}

export function scrollTabsToActive() {
    const el = tabsBar.querySelector('.tab.active');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}