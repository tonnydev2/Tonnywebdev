/* ============================================================
   Cloud sync via Supabase — project-aware.
   ============================================================ */
import { SUPABASE_URL, SUPABASE_ANON_KEY, CLOUD_SYNC_ENABLED } from './config.js';
import {
    projects, projectFiles, getActiveProjectId,
} from './state.js';
import { persistAll } from './storage.js';

let supabase = null;
let currentUser = null;
let syncState = 'offline';       /* 'offline' | 'online' | 'syncing' | 'error' */
let lastSyncError = null;
const listeners = new Set();

export function getSyncState() { return syncState; }
export function getCurrentUser() { return currentUser; }
export function getLastSyncError() { return lastSyncError; }
export function onSyncChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function setSyncState(state, error) {
    lastSyncError = error
        ? (error.message || String(error))
        : (state === 'error' ? lastSyncError : null);
    if (state === syncState) return;
    syncState = state;
    listeners.forEach(fn => { try { fn(state); } catch (e) {} });
}

/* ---------- Initialization ---------- */
export async function initCloud() {
    if (!CLOUD_SYNC_ENABLED) { setSyncState('offline'); return null; }
    if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR-PROJECT')) {
        console.warn('[cloud] Supabase credentials not set — offline.');
        setSyncState('offline');
        return null;
    }
    if (typeof window.__createSupabaseClient !== 'function') {
        console.warn('[cloud] Supabase SDK not loaded yet.');
        setSyncState('offline');
        return null;
    }

    supabase = window.__createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true }
    });

    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data && data.session) {
            currentUser = data.session.user;
            setSyncState('online');
        } else {
            setSyncState('offline');
        }
    } catch (e) {
        console.warn('[cloud] getSession failed:', e);
        setSyncState('offline', e);
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        currentUser = session ? session.user : null;
        setSyncState(currentUser ? 'online' : 'offline');
        if (currentUser) pullFromCloud().catch(() => {});
    });

    window.addEventListener('online',  () => { if (currentUser) setSyncState('online'); });
    window.addEventListener('offline', () => setSyncState('offline'));

    return supabase;
}

/* ---------- Auth ---------- */
export async function signIn(email, password) {
    if (!supabase) throw new Error('Cloud not initialized');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = data.user;
    setSyncState('online');
    await pullFromCloud();
    return data.user;
}

export async function signUp(email, password) {
    if (!supabase) throw new Error('Cloud not initialized');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.session) {
        currentUser = data.user;
        setSyncState('online');
    }
    return data;
}

export async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    currentUser = null;
    setSyncState('offline');
}

/* ---------- Push one file ---------- */
export async function pushFile({ projectId, name, lang, content }) {
    if (!supabase || !currentUser) return { skipped: true };
    if (!projectId) projectId = getActiveProjectId() || 'default';

    setSyncState('syncing');
    try {
        const { error } = await supabase
            .from('files')
            .upsert({
                user_id: currentUser.id,
                project_id: projectId,
                name,
                lang,
                content,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id,project_id,name' });
        if (error) throw error;
        setSyncState('online');
        return { ok: true };
    } catch (e) {
        console.warn('[cloud] pushFile failed:', e);
        setSyncState('error', e);
        return { error: e };
    }
}

/* ---------- Push every file in every project ---------- */
export async function pushAllFiles() {
    if (!supabase || !currentUser) return { skipped: true };

    const rows = [];
    for (const p of projects) {
        const files = projectFiles[p.id] || {};
        for (const name of Object.keys(files)) {
            rows.push({
                user_id: currentUser.id,
                project_id: p.id,
                name,
                lang: files[name].lang,
                content: files[name].content,
                updated_at: new Date().toISOString(),
            });
        }
    }
    if (rows.length === 0) return { ok: true, count: 0 };

    setSyncState('syncing');
    try {
        const { error } = await supabase
            .from('files')
            .upsert(rows, { onConflict: 'user_id,project_id,name' });
        if (error) throw error;
        setSyncState('online');
        return { ok: true, count: rows.length };
    } catch (e) {
        console.warn('[cloud] pushAllFiles failed:', e);
        setSyncState('error', e);
        return { error: e };
    }
}

/* ---------- Pull everything ---------- */
export async function pullFromCloud() {
    if (!supabase || !currentUser) return { skipped: true };

    setSyncState('syncing');
    try {
        const { data, error } = await supabase
            .from('files')
            .select('project_id, name, lang, content, updated_at');
        if (error) throw error;

        let changed = false;

        /* Build a lookup of projectIds we know about. Cloud files may
           belong to projects the device doesn't have — create them. */
        const knownProjectIds = new Set(projects.map(p => p.id));
        const cloudProjectIds = new Set();
        for (const row of data || []) cloudProjectIds.add(row.project_id);

        for (const pid of cloudProjectIds) {
            if (!knownProjectIds.has(pid)) {
                /* Create a placeholder project for this id. */
                projects.push({
                    id: pid,
                    name: pid === 'default' ? 'Default (cloud)' : `Project ${pid.slice(0, 6)}`,
                    createdAt: Date.now(),
                    fromCloud: true,
                });
                projectFiles[pid] = {};
                knownProjectIds.add(pid);
                changed = true;
            }
            if (!projectFiles[pid]) projectFiles[pid] = {};
        }

        /* Merge files. Cloud wins unless the local file has unsaved edits. */
        for (const row of data || []) {
            const pid = row.project_id;
            const local = projectFiles[pid][row.name];
            if (!local) {
                projectFiles[pid][row.name] = {
                    lang: row.lang,
                    content: row.content,
                    savedContent: row.content,
                };
                changed = true;
            } else if (local.content === local.savedContent) {
                /* No local edits → cloud wins. */
                projectFiles[pid][row.name] = {
                    lang: row.lang,
                    content: row.content,
                    savedContent: row.content,
                };
                changed = true;
            }
            /* else: local has unsaved changes — leave it alone. */
        }

        if (changed) {
            persistAll();
            /* Trigger a re-render if the current project changed. */
            import('./tabs.js').then(m => m.reloadForProject()).catch(() => {});
        }

        setSyncState('online');
        return { ok: true, count: (data || []).length };
    } catch (e) {
        console.warn('[cloud] pullFromCloud failed:', e);
        setSyncState('error', e);
        return { error: e };
    }
}

/* ---------- Delete a single file ---------- */
export async function deleteCloudFile(projectId, name) {
    if (!supabase || !currentUser) return { skipped: true };
    if (!projectId) projectId = getActiveProjectId() || 'default';
    try {
        const { error } = await supabase
            .from('files')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('project_id', projectId)
            .eq('name', name);
        if (error) throw error;
        return { ok: true };
    } catch (e) {
        console.warn('[cloud] deleteCloudFile failed:', e);
        return { error: e };
    }
}

/* ---------- Rename (delete old, insert new) ---------- */
export async function renameFile(oldName, newName) {
    if (!supabase || !currentUser) return { skipped: true };
    const pid = getActiveProjectId() || 'default';
    const files = projectFiles[pid] || {};
    const f = files[newName];
    if (!f) return { error: 'new file not found' };

    try {
        await deleteCloudFile(pid, oldName);
        return await pushFile({
            projectId: pid,
            name: newName,
            lang: f.lang,
            content: f.content,
        });
    } catch (e) {
        console.warn('[cloud] renameFile failed:', e);
        return { error: e };
    }
}