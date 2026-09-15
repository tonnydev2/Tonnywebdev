/* ============================================================
   File operation buttons: New, Save, Download, Open, Import, Attach
   ============================================================ */
import { DEFAULT_LANG, tabs, savedFiles } from './state.js';
import { input, fileTypeSelect } from './dom.js';
import { askFileName } from './filename-dialog.js';
import { createTab, switchToTab, getActiveTab, uniqueNewName, renderTabs } from './tabs.js';
import { render } from './render.js';
import { persistSavedFiles } from './storage.js';

export function initFileButtons() {
    /* ---------- New ---------- */
    document.getElementById('newFileBtn').addEventListener('click', () => {
        const lang = fileTypeSelect.value || DEFAULT_LANG;
        askFileName({
            title: 'New file',
            lang,
            onConfirm: (baseName) => {
                const name = `${baseName}.${lang}`;
                const emptyContent =
                    lang === 'js'   ? '// New JavaScript file\n' :
                    lang === 'html' ? '' :
                                      '/* New CSS file */\n';
                const existing = tabs.find(t => t.name === name);
                if (existing) { switchToTab(existing.id); return; }
                createTab({ name, lang, content: emptyContent });
            },
        });
    });

    /* ---------- Save (local + cloud) ---------- */
    document.getElementById('saveFileBtn').addEventListener('click', async () => {
        const tab = getActiveTab();
        if (!tab) return;
        tab.content = input.value;
        tab.savedContent = input.value;
        savedFiles[tab.name] = { name: tab.name, lang: tab.lang, content: tab.content };
        persistSavedFiles();

        import('./cloud.js')
            .then(m => m.pushFile({ name: tab.name, lang: tab.lang, content: tab.content }))
            .catch(() => {});

        const btn = document.getElementById('saveFileBtn');
        const orig = btn.textContent;
        btn.textContent = '✅ Saved!';
        setTimeout(() => { btn.textContent = orig; }, 1000);

        renderTabs();
        render();
    });

    /* ---------- Download ---------- */
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const tab = getActiveTab();
        if (!tab) return;
        const content = input.value;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = tab.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    /* ---------- Open (from localStorage) ---------- */
    document.getElementById('openFileBtn').addEventListener('click', () => {
        const names = Object.keys(savedFiles);
        if (names.length === 0) {
            alert('No saved files yet. Use "Save" to store a file locally.');
            return;
        }
        const list = names.map((n, i) => `${i + 1}. ${n}`).join('\n');
        const choice = prompt(`Choose a file to open:\n${list}\n\nEnter the number:`);
        if (choice === null) return;
        const idx = parseInt(choice, 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= names.length) {
            alert('Invalid choice.');
            return;
        }
        const file = savedFiles[names[idx]];
        if (!file) return;
        const existing = tabs.find(t => t.name === file.name);
        if (existing) { switchToTab(existing.id); return; }
        createTab({
            name: file.name,
            lang: file.lang,
            content: file.content,
            savedContent: file.content,
        });
    });

    /* ---------- Import (from disk) ---------- */
    document.getElementById('importBtn').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.js,.html,.css,.txt,.json,.md,.xml,.svg';
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const content = ev.target.result;
                const ext = file.name.split('.').pop().toLowerCase();
                const lang = ext === 'html' ? 'html' : ext === 'css' ? 'css' : 'js';
                const existing = tabs.find(t => t.name === file.name);
                if (existing) { switchToTab(existing.id); return; }
                createTab({ name: file.name, lang, content, savedContent: content });
            };
            reader.readAsText(file);
        });
        fileInput.click();
    });

    /* ---------- Attach (assets for preview) ---------- */
    const attachBtn = document.getElementById('attachBtn');
    if (attachBtn) {
        attachBtn.addEventListener('click', () => {
            const fi = document.createElement('input');
            fi.type = 'file';
            fi.multiple = true;
            fi.accept = 'image/*,audio/*,video/*,font/*,.svg,.woff,.woff2,.ttf';
            fi.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;

                const orig = attachBtn.textContent;

                const { importAssetFiles } = await import('./assets.js');
                const stored = await importAssetFiles(files);

                /* Refresh the preview so new assets appear immediately —
                   without needing a manual ↻. */
                const previewMod = await import('./preview.js');
                if (previewMod.isPreviewOpen()) previewMod.renderPreview();

                /* Report status on the button itself. */
                if (stored.allOk) {
                    attachBtn.textContent = `✅ ${files.length} added`;
                } else {
                    attachBtn.textContent = `⚠️ ${stored.ok}/${files.length} stored`;
                }
                setTimeout(() => { attachBtn.textContent = orig; }, 1200);
            });
            fi.click();
        });
    }
}