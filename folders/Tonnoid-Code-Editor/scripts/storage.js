/* ============================================================
   Persistence: projects + files, with migration from the old
   flat savedFiles shape.
   ============================================================ */
import {
    projects, projectFiles, tabsByProject, activeTabIdByProject,
    getActiveProjectId, setActiveProjectId,
    savedFiles,
} from './state.js';
import { storageInfo } from './dom.js';

const KEY = 'lantern_projects_v1';
const LEGACY_KEY = 'lantern_saved_files';

/* ---- Load everything ---- */
export function loadSavedFiles() {
    /* First try the new schema. */
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const data = JSON.parse(raw);
            if (Array.isArray(data.projects)) {
                for (const p of data.projects) projects.push(p);
            }
            if (data.files) {
                for (const pid of Object.keys(data.files)) {
                    projectFiles[pid] = data.files[pid];
                }
            }
            if (data.activeProjectId) {
                setActiveProjectId(data.activeProjectId);
            }
            updateStorageInfo();
            return;
        }
    } catch (e) {
        console.warn('[storage] projects load failed:', e);
    }

    /* Fallback: migrate legacy flat files. */
    try {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) {
            const parsed = JSON.parse(legacy);
            for (const k of Object.keys(parsed)) savedFiles[k] = parsed[k];
        }
    } catch (e) { /* ignore */ }

    updateStorageInfo();
}

/* ---- Persist everything ---- */
export function persistAll() {
    const data = {
        projects,
        activeProjectId: getActiveProjectId(),
        files: projectFiles,
    };
    try {
        localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('[storage] persist failed:', e);
    }
    updateStorageInfo();
}

/* ---- Legacy alias (some modules still call this) ---- */
export const persistSavedFiles = persistAll;

export function updateStorageInfo() {
    const fileCount = Object.values(projectFiles)
        .reduce((n, files) => n + Object.keys(files).length, 0);
    if (storageInfo) storageInfo.textContent = `📁 ${fileCount} files`;
}