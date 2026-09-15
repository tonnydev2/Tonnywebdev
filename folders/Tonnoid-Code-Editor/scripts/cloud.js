/* ============================================================
   Cloud sync via Supabase
   ============================================================ */
import { SUPABASE_URL, SUPABASE_ANON_KEY, CLOUD_SYNC_ENABLED } from './config.js';
import { savedFiles, tabsByProject } from './state.js';
import { persistSavedFiles } from './storage.js';
import { renderTabs } from './tabs.js';

/* ---------- State ---------- */
let supabase = null;
let currentUser = null;
let syncState = 'offline';   /* 'offline' | 'online' | 'syncing' | 'error' */
let lastSyncError = null;
const listeners = new Set();

export function getSyncState() { return syncState; }
export function getCurrentUser() { return currentUser; }
export function getLastSyncError() { return lastSyncError; }
export function onSyncChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function setSyncState(state, error) {
    lastSyncError = error ? (error.message || String(error)) : (state === 'error' ? lastSyncError : null);
    if (state === syncState) return;
    syncState = state;
    listeners.forEach(fn => { try { fn(state); } catch (e) {} });
}

/* ---------- Initialization ---------- */
export async function initCloud() {
    if (!CLOUD_SYNC_ENABLED) { setSyncState('offline'); return null; }
    if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR-PROJECT')) {
        console.warn('[cloud] Supabase credentials not set — running offline.');
        setSyncState('offline');
        return null;
    }
    if (typeof window.__createSupabaseClient !== 'function') {
        console.warn('[cloud] Supabase SDK not yet loaded.');
        setSyncState('offline');
        return null;
    }

    supabase = window.__createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true }
    });

    /* Restore an existing session if any. */
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

    /* React to sign-in / sign-out from anywhere. */
    supabase.auth.onAuthStateChange((_event, session) => {
        currentUser = session ? session.user : null;
        setSyncState(currentUser ? 'online' : 'offline');
        listeners.forEach(fn => { try { fn(syncState); } catch (e) {} });

        if (currentUser) {
            /* Merge cloud files into local state on sign-in. */
            pullFromCloud().catch(() => {});
        }
    });

    /* Online / offline detection. */
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
    /* Depending on project settings, signUp may or may not create a session. */
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

/* ---------- Sync operations ---------- */

/* Push a single file to the cloud (upsert by user_id + name). */
export async function pushFile(file) {
    if (!supabase || !currentUser) return { skipped: true };
    setSyncState('syncing');
    try {
        const { error } = await supabase
            .from('files')
            .upsert(
                {
                    user_id: currentUser.id,
                    name: file.name,
                    lang: file.lang,
                    content: file.content,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id,name' }
            );
        if (error) throw error;
        setSyncState('online');
        return { ok: true };
    } catch (e) {
        console.warn('[cloud] pushFile failed:', e);
        setSyncState('error', e);
        return { error: e };
    }
}

/* Push every saved file — useful after a "Save all" action. */
export async function pushAllFiles() {
    if (!supabase || !currentUser) return { skipped: true };
    const list = Object.values(savedFiles);
    if (list.length === 0) return { ok: true };

    setSyncState('syncing');
    try {
        const rows = list.map(f => ({
            user_id: currentUser.id,
            name: f.name,
            lang: f.lang,
            content: f.content,
            updated_at: new Date().toISOString()
        }));
        const { error } = await supabase
            .from('files')
            .upsert(rows, { onConflict: 'user_id,name' });
        if (error) throw error;
        setSyncState('online');
        return { ok: true, count: rows.length };
    } catch (e) {
        console.warn('[cloud] pushAllFiles failed:', e);
        setSyncState('error', e);
        return { error: e };
    }
}

/* Pull all cloud files and merge into savedFiles.
   Newest updated_at wins when a name collides. */
export async function pullFromCloud() {
    if (!supabase || !currentUser) return { skipped: true };
    setSyncState('syncing');
    try {
        const { data, error } = await supabase
            .from('files')
            .select('name, lang, content, updated_at');
        if (error) throw error;

        let changed = false;
        for (const row of data || []) {
            const local = savedFiles[row.name];
            /* We don't have per-file updated_at locally, so we treat the
               cloud as authoritative on sign-in (unless the local file is
               open in a tab with unsaved edits — we skip those). */
            const openTab = tabsByProject.find(t => t.name === row.name);
            const hasLocalEdits = openTab && openTab.content !== openTab.savedContent;

            if (!local) {
                savedFiles[row.name] = {
                    name: row.name,
                    lang: row.lang,
                    content: row.content
                };
                changed = true;
            } else if (!hasLocalEdits) {
                /* Cloud wins if we have no local edits. */
                savedFiles[row.name] = {
                    name: row.name,
                    lang: row.lang,
                    content: row.content
                };
                changed = true;
            }
        }

        if (changed) {
            persistSavedFiles();
            renderTabs();
        }
        setSyncState('online');
        return { ok: true, count: (data || []).length };
    } catch (e) {
        console.warn('[cloud] pullFromCloud failed:', e);
        setSyncState('error', e);
        return { error: e };
    }
}

/* Delete a file from the cloud. */
export async function deleteCloudFile(name) {
    if (!supabase || !currentUser) return { skipped: true };
    try {
        const { error } = await supabase
            .from('files')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('name', name);
        if (error) throw error;
        return { ok: true };
    } catch (e) {
        console.warn('[cloud] deleteCloudFile failed:', e);
        return { error: e };
    }
}

