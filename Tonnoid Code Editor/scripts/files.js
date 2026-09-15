/* ============================================================
   File buttons: New, Save, Download, Open, Import, Attach.
   All operate on the current project.
   ============================================================ */
import {
    projectFiles, getActiveProjectId, DEFAULT_LANG,
    tabsByProject, activeTabIdByProject,
} from './state.js';
import { input, fileTypeSelect } from './dom.js';
import { askFileName } from './filename-dialog.js';
import {
    createTab, switchToTab, getActiveTab, uniqueNewName, renderTabs,
} from './tabs.js';
import { render } from './render.js';
import { persistAll } from './storage.js';
import { scheduleSnapshot } from './sw-fs.js';

function filesForActiveProject() {
    const pid = getActiveProjectId();
    return pid ? (projectFiles[pid] || {}) : {};
}

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
                createTab({ name, lang, content: emptyContent });
            },
        });
    });

    /* ---------- Save ---------- */
    document.getElementById('saveFileBtn').addEventListener('click', async () => {
        const tab = getActiveTab();
        const pid = getActiveProjectId();
        if (!tab || !pid) return;

        const pf = projectFiles[pid][tab.name];
        if (!pf) return;
        pf.content = input.value;
        pf.savedContent = input.value;
        tab.content = input.value;
        tab.savedContent = input.value;
        persistAll();
        scheduleSnapshot();

        /* Cloud push (best-effort). */
        import('./cloud.js')
            .then(m => m.pushFile({
                projectId: pid,
                name: tab.name,
                lang: tab.lang,
                content: tab.content,
            }))
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
        const blob = new Blob([input.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = tab.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    /* ---------- Open (from current project) ---------- */
    document.getElementById('openFileBtn').addEventListener('click', () => {
        const files = filesForActiveProject();
        const names = Object.keys(files);
        if (names.length === 0) {
            alert('No files in this project yet.');
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
        const name = names[idx];
        /* If a tab exists, focus it; else open. */
        const pid = getActiveProjectId();
        const tabs = tabsByProject[pid] || [];
        const existing = tabs.find(t => t.name === name);
        if (existing) { switchToTab(existing.id); return; }
        createTab({ name });
    });

    /* ---------- Import (from disk) ---------- */
    document.getElementById('importBtn').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.js,.mjs,.html,.css,.txt,.json,.md,.xml,.svg,.ts,.jsx,.tsx';
        fileInput.multiple = true;
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;

            const pid = getActiveProjectId();
            let pending = files.length;

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const content = ev.target.result;
                    const ext = file.name.split('.').pop().toLowerCase();
                    const lang =
                        ext === 'html' || ext === 'htm' ? 'html' :
                        ext === 'css'  ? 'css'  :
                        ext === 'json' ? 'js'  :
                        'js';
                    if (projectFiles[pid][file.name]) {
                        const overwrite = confirm(
                            `"${file.name}" already exists in this project. Overwrite?`
                        );
                        if (!overwrite) {
                            pending--; if (pending === 0) finishImport(); return;
                        }
                    }
                    projectFiles[pid][file.name] = {
                        lang,
                        content,
                        savedContent: content,
                    };
                    pending--;
                    if (pending === 0) finishImport();
                };
                reader.readAsText(file);
            });

            function finishImport() {
                persistAll();
                scheduleSnapshot();
                renderTabs();
                alert(`Imported ${files.length} file${files.length === 1 ? '' : 's'}.`);
            }
        });
        fileInput.click();
    });

    /* ---------- Attach (assets — unchanged behaviour) ---------- */
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
                const previewMod = await import('./preview.js');
                if (previewMod.isPreviewOpen()) previewMod.renderPreview();
                if (stored.allOk) attachBtn.textContent = `✅ ${files.length} added`;
                else              attachBtn.textContent = `⚠️ ${stored.ok}/${files.length} stored`;
                setTimeout(() => { attachBtn.textContent = orig; }, 1200);
            });
            fi.click();
        });
    }
}