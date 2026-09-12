import {
    tabs, savedFiles,
    DEFAULT_LANG,
    nextTabId, getActiveTabId, setActiveTabId,
} from './state.js';
import { input, fileTypeSelect, tabsBar } from './dom.js';
import { render } from './render.js';
import { closeAutocomplete } from './autocomplete.js';
import { askFileName } from './filename-dialog.js';

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function getActiveTab() {
    const id = getActiveTabId();
    return tabs.find(t => t.id === id) || null;
}

export function currentFileLang() {
    const t = getActiveTab();
    return t ? t.lang : DEFAULT_LANG;
}

export function isDirty(tab) {
    return tab && tab.content !== tab.savedContent;
}

export function uniqueNewName(lang) {
    const used = new Set([
        ...tabs.map(t => t.name),
        ...Object.keys(savedFiles),
    ]);
    let n = 1;
    let name = `untitled.${lang}`;
    while (used.has(name)) {
        name = `untitled_${n}.${lang}`;
        n += 1;
    }
    return name;
}

export function createTab({ name, lang, content, savedContent }) {
    const finalLang = lang || DEFAULT_LANG;
    const finalName = name || uniqueNewName(finalLang);

    const existing = tabs.find(t => t.name === finalName);
    if (existing) { switchToTab(existing.id); return existing; }

    const tab = {
        id: nextTabId(),
        name: finalName,
        lang: finalLang,
        content:      content      !== undefined ? content      : '',
        savedContent: savedContent !== undefined ? savedContent : (content !== undefined ? content : ''),
    };
    tabs.push(tab);
    switchToTab(tab.id);
    return tab;
}

export function switchToTab(id) {
    const outgoing = getActiveTab();
    if (outgoing && outgoing.id !== id) outgoing.content = input.value;

    setActiveTabId(id);
    const tab = getActiveTab();
    if (!tab) return;

    input.value = tab.content;
    fileTypeSelect.value = tab.lang;
    closeAutocomplete();
    renderTabs();
    render();
    scrollTabsToActive();
}

export function closeTab(id) {
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

    if (getActiveTabId() === id) {
        const nextIdx = Math.max(0, idx - 1);
        switchToTab(tabs[nextIdx].id);
    } else {
        renderTabs();
    }
}

export function renderTabs() {
    const activeId = getActiveTabId();
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
                const existing = tabs.find(t => t.name === name);
                if (existing) { switchToTab(existing.id); return; }
                createTab({ name, lang, content: emptyContent });
            },
        });
    });
}

export function scrollTabsToActive() {
    const el = tabsBar.querySelector('.tab.active');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

