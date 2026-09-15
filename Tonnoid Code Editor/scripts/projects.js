/* ============================================================
   Projects: create / rename / delete / switch.
   ============================================================ */
import {
    projects, projectFiles, tabsByProject, activeTabIdByProject,
    getActiveProjectId, setActiveProjectId, getActiveProject,
    nextProjectId, DEFAULT_LANG, DEFAULT_HTML,
} from './state.js';
import { askFileName } from './filename-dialog.js';
import { persistAll } from './storage.js';

const panel        = document.getElementById('projectsPanel');
const listEl       = document.getElementById('projectsList');
const newBtn       = document.getElementById('projectsNewBtn');
const closeBtn     = document.getElementById('projectsCloseBtn');
const headerBtn    = document.getElementById('projectsBtn');
const nameDisplay  = document.getElementById('projectNameDisplay');

let onSwitch = null;    /* callback registered by tabs.js / main.js */

export function setProjectSwitchHandler(fn) { onSwitch = fn; }

/* ---------- Create / switch / delete ---------- */

export function createProject(name) {
    const id = nextProjectId();
    const clean = (name || 'My project').trim().slice(0, 60);
    const project = { id, name: clean, createdAt: Date.now() };
    projects.push(project);

    projectFiles[id] = {};
    tabsByProject[id] = [];
    activeTabIdByProject[id] = null;

    /* Seed with a starter HTML file so the user has somewhere to type. */
    const startName = 'index.html';
    projectFiles[id][startName] = {
        lang: 'html',
        content: DEFAULT_HTML,
        savedContent: DEFAULT_HTML,
    };

    persistAll();
    return project;
}

export function switchProject(id) {
    if (id === getActiveProjectId()) return;
    setActiveProjectId(id);
    persistAll();
    renderProjectsList();
    renderProjectName();
    if (onSwitch) onSwitch(id);
}

export function renameProject(id, newName) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    p.name = (newName || '').trim().slice(0, 60) || p.name;
    persistAll();
    renderProjectsList();
    renderProjectName();
}

export function deleteProject(id) {
    if (projects.length <= 1) {
        alert('Cannot delete the only project.');
        return;
    }
    const p = projects.find(x => x.id === id);
    if (!p) return;
    if (!confirm(`Delete project "${p.name}" and all its files? This cannot be undone.`)) return;

    const idx = projects.findIndex(x => x.id === id);
    projects.splice(idx, 1);
    delete projectFiles[id];
    delete tabsByProject[id];
    delete activeTabIdByProject[id];

    if (getActiveProjectId() === id) {
        const next = projects[Math.max(0, idx - 1)];
        setActiveProjectId(next.id);
        if (onSwitch) onSwitch(next.id);
    }
    persistAll();
    renderProjectsList();
    renderProjectName();
}

/* ---------- Panel UI ---------- */

export function openProjectsPanel() {
    renderProjectsList();
    panel.hidden = false;
}
export function closeProjectsPanel() { panel.hidden = true; }
export function toggleProjectsPanel() {
    if (panel.hidden) openProjectsPanel();
    else closeProjectsPanel();
}

function renderProjectsList() {
    const active = getActiveProjectId();
    listEl.innerHTML = projects.map(p => {
        const count = Object.keys(projectFiles[p.id] || {}).length;
        return `
            <div class="project-item ${p.id === active ? 'active' : ''}" data-project-id="${p.id}">
                <div class="project-item-main">
                    <div class="project-item-name">${escapeHtml(p.name)}</div>
                    <div class="project-item-meta">${count} file${count === 1 ? '' : 's'}</div>
                </div>
                <div class="project-item-actions">
                    <button type="button" class="project-act" data-act="rename" data-id="${p.id}" title="Rename">✎</button>
                    <button type="button" class="project-act" data-act="delete" data-id="${p.id}" title="Delete">🗑</button>
                </div>
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.project-item').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.project-act')) return;
            switchProject(el.dataset.projectId);
            closeProjectsPanel();
        });
    });
    listEl.querySelectorAll('.project-act').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const act = btn.dataset.act;
            const p = projects.find(x => x.id === id);
            if (!p) return;
            if (act === 'rename') {
                askFileName({
                    title: 'Rename project',
                    lang: '',
                    initial: p.name,
                    mode: 'rename',           /* reuse the dialog */
                    onConfirm: (newName) => {
                        /* The rename dialog appends an extension; strip it. */
                        const stripped = newName.replace(/\.[^.]+$/, '');
                        renameProject(id, stripped);
                    },
                });
            } else if (act === 'delete') {
                deleteProject(id);
            }
        });
    });
}

function renderProjectName() {
    const p = getActiveProject();
    if (nameDisplay) nameDisplay.textContent = p ? p.name : 'Project';
}

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------- Wire up ---------- */
export function initProjects() {
    if (headerBtn) headerBtn.addEventListener('click', toggleProjectsPanel);
    if (closeBtn)  closeBtn.addEventListener('click', closeProjectsPanel);
    if (newBtn)    newBtn.addEventListener('click', () => {
        askFileName({
            title: 'New project',
            lang: '',
            onConfirm: (name) => {
                const p = createProject(name);
                setActiveProjectId(p.id);
                if (onSwitch) onSwitch(p.id);
                renderProjectsList();
                renderProjectName();
                closeProjectsPanel();
            },
        });
    });
    /* Outside-click closes the panel. */
    document.addEventListener('click', (e) => {
        if (panel.hidden) return;
        if (headerBtn && headerBtn.contains(e.target)) return;
        if (panel.contains(e.target)) return;
        closeProjectsPanel();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !panel.hidden) closeProjectsPanel();
    });

    renderProjectName();
}

