/* ============================================================
   Virtual filesystem mirror.
   The page owns the source of truth; it broadcasts snapshots to
   the Service Worker via postMessage. The SW keeps its own copy
   in memory so it can serve requests.
   ============================================================ */
import { projects, projectFiles, getActiveProjectId } from './state.js';

let swRegistration = null;
let pendingSnapshot = null;

export function attachSW(reg) {
    swRegistration = reg;
    /* Push the current snapshot on attach, and any pending one. */
    if (pendingSnapshot) {
        pushSnapshotNow(pendingSnapshot);
        pendingSnapshot = null;
    } else {
        pushSnapshotNow(makeSnapshot());
    }
}

export function makeSnapshot() {
    const snap = { projects: {}, activeProjectId: getActiveProjectId() };
    for (const p of projects) {
        snap.projects[p.id] = {};
        const files = projectFiles[p.id] || {};
        for (const name of Object.keys(files)) {
            snap.projects[p.id][name] = {
                lang: files[name].lang,
                content: files[name].content,
            };
        }
    }
    return snap;
}

export function pushSnapshotNow(snap) {
    const target = swRegistration?.active || navigator.serviceWorker?.controller;
    if (!target) {
        pendingSnapshot = snap;
        return;
    }
    target.postMessage({ __lantern: 'snapshot', snap });
}

export function pushSnapshot() {
    const snap = makeSnapshot();
    pushSnapshotNow(snap);
}

/* Debounced push — call this from save/tab switches/etc. */
let pushTimer = null;
export function scheduleSnapshot() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushSnapshot, 100);
}

