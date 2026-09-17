/* ============================================================
   Cloud sync via Supabase — project-aware, with auth UI.
   ============================================================ */
import { SUPABASE_URL, SUPABASE_ANON_KEY, CLOUD_SYNC_ENABLED } from './config.js';
import { projects, projectFiles, getActiveProjectId } from './state.js';
import { persistAll } from './storage.js';

/* ---------- Engine state ---------- */
let supabase = null;
let currentUser = null;
let syncState = 'offline';
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

/* ---------- Init ---------- */
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

/* ---------- Sync ---------- */
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
                name, lang, content,
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

export async function pullFromCloud() {
    if (!supabase || !currentUser) return { skipped: true };
    setSyncState('syncing');
    try {
        const { data, error } = await supabase
            .from('files')
            .select('project_id, name, lang, content, updated_at');
        if (error) throw error;

        let changed = false;
        const knownProjectIds = new Set(projects.map(p => p.id));
        const cloudProjectIds = new Set();
        for (const row of data || []) cloudProjectIds.add(row.project_id);

        for (const pid of cloudProjectIds) {
            if (!knownProjectIds.has(pid)) {
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

        for (const row of data || []) {
            const pid = row.project_id;
            const local = projectFiles[pid][row.name];
            if (!local || local.content === local.savedContent) {
                projectFiles[pid][row.name] = {
                    lang: row.lang,
                    content: row.content,
                    savedContent: row.content,
                };
                changed = true;
            }
        }

        if (changed) {
            persistAll();
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

export async function renameFile(oldName, newName) {
    if (!supabase || !currentUser) return { skipped: true };
    const pid = getActiveProjectId() || 'default';
    const f = (projectFiles[pid] || {})[newName];
    if (!f) return { error: 'new file not found' };
    await deleteCloudFile(pid, oldName);
    return await pushFile({ projectId: pid, name: newName, lang: f.lang, content: f.content });
}

/* ============================================================
   Auth UI (dialog, sync button)
   ============================================================ */
export function initCloudUI() {
    const syncBtn     = document.getElementById('syncBtn');
    const syncDot     = document.getElementById('syncDot');
    const syncLabel   = document.getElementById('syncLabel');
    const backdrop    = document.getElementById('syncDialogBackdrop');
    const emailInput  = document.getElementById('syncEmail');
    const passInput   = document.getElementById('syncPassword');
    const hint        = document.getElementById('syncHint');
    const cancelBtn   = document.getElementById('syncCancel');
    const signInBtn   = document.getElementById('syncSignIn');
    const signUpBtn   = document.getElementById('syncSignUp');

    function paintSync() {
        const state = getSyncState();
        const user  = getCurrentUser();
        syncDot.classList.remove('online','syncing','error','offline');
        syncDot.classList.add(state);

        if (!user) { syncLabel.textContent = 'Sign in'; return; }
        if (state === 'syncing')  syncLabel.textContent = 'Syncing…';
        else if (state === 'error') syncLabel.textContent = 'Retry sync';
        else syncLabel.textContent = user.email.split('@')[0];
    }

    onSyncChange(paintSync);
    paintSync();

    function openDialog() {
        backdrop.hidden = false;
        hint.textContent = 'Sign in or create an account. Files stay on your device too.';
        hint.classList.remove('error');
        setTimeout(() => emailInput.focus(), 0);
    }
    function closeDialog() {
        backdrop.hidden = true;
        passInput.value = '';
        hint.classList.remove('error');
    }

    async function doSignIn() {
        const email = emailInput.value.trim();
        const password = passInput.value;
        if (!email || !password) {
            hint.textContent = 'Enter email and password.';
            hint.classList.add('error');
            return;
        }
        try {
            hint.textContent = 'Signing in…';
            hint.classList.remove('error');
            await signIn(email, password);
            closeDialog();
        } catch (e) {
            hint.textContent = e.message || 'Sign-in failed.';
            hint.classList.add('error');
        }
    }

    async function doSignUp() {
        const email = emailInput.value.trim();
        const password = passInput.value;
        if (!email || !password) {
            hint.textContent = 'Enter email and password.';
            hint.classList.add('error');
            return;
        }
        if (password.length < 6) {
            hint.textContent = 'Password must be at least 6 characters.';
            hint.classList.add('error');
            return;
        }
        try {
            hint.textContent = 'Creating account…';
            hint.classList.remove('error');
            const res = await signUp(email, password);
            if (res && res.session) closeDialog();
            else {
                hint.textContent = 'Account created. Check your email to confirm, then sign in.';
                hint.classList.remove('error');
            }
        } catch (e) {
            hint.textContent = e.message || 'Sign-up failed.';
            hint.classList.add('error');
        }
    }

    syncBtn.addEventListener('click', async () => {
        const user = getCurrentUser();
        if (!user) { openDialog(); return; }
        if (getSyncState() === 'error') {
            const detail = getLastSyncError();
            const retry = confirm(
                'Last sync attempt failed' + (detail ? ':\n\n' + detail : '.') +
                '\n\nTap OK to retry now, or Cancel to sign out instead.'
            );
            if (retry) { await pushAllFiles(); paintSync(); return; }
        }
        const ok = confirm('Sign out of Lantern Cloud?');
        if (ok) await signOut();
        paintSync();
    });

    cancelBtn.addEventListener('click', closeDialog);
    backdrop.addEventListener('mousedown', (e) => {
        if (e.target === backdrop) closeDialog();
    });
    signInBtn.addEventListener('click', doSignIn);
    signUpBtn.addEventListener('click', doSignUp);
    [emailInput, passInput].forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); doSignIn(); }
            if (e.key === 'Escape') { e.preventDefault(); closeDialog(); }
        });
    });
}