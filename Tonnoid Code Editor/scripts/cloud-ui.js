/* ============================================================
   Cloud UI: sync button in header + auth dialog
   ============================================================ */
import {
    initCloud, signIn, signUp, signOut, pushAllFiles,
    getSyncState, getCurrentUser, getLastSyncError, onSyncChange
} from './cloud.js';

const syncBtn     = document.getElementById('syncBtn');
const syncDot     = document.getElementById('syncDot');
const syncLabel   = document.getElementById('syncLabel');

const backdrop    = document.getElementById('syncDialogBackdrop');
const dialogTitle = document.getElementById('syncDialogTitle');
const emailInput  = document.getElementById('syncEmail');
const passInput   = document.getElementById('syncPassword');
const hint        = document.getElementById('syncHint');
const cancelBtn   = document.getElementById('syncCancel');
const signInBtn   = document.getElementById('syncSignIn');
const signUpBtn   = document.getElementById('syncSignUp');

/* ---- Visual state ---- */
function paintSync() {
    const state = getSyncState();
    const user  = getCurrentUser();

    syncDot.classList.remove('online', 'syncing', 'error', 'offline');
    syncDot.classList.add(state);

    if (!user) {
        syncLabel.textContent = 'Sign in';
        syncBtn.title = '';
        return;
    }

    if (state === 'syncing') {
        syncLabel.textContent = 'Syncing…';
        syncBtn.title = '';
    } else if (state === 'error') {
        syncLabel.textContent = 'Retry sync';
        syncBtn.title = getLastSyncError() || 'Sync failed — tap to retry';
    } else {
        syncLabel.textContent = user.email.split('@')[0];
        syncBtn.title = '';
    }
}

onSyncChange(paintSync);

/* ---- Dialog open / close ---- */
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

/* ---- Actions ---- */
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
        if (res && res.session) {
            closeDialog();
        } else {
            hint.textContent = 'Account created. Check your email to confirm, then sign in.';
            hint.classList.remove('error');
        }
    } catch (e) {
        hint.textContent = e.message || 'Sign-up failed.';
        hint.classList.add('error');
    }
}

/* ---- Wire up ---- */
export async function initCloudUI() {
    await initCloud();
    paintSync();

    syncBtn.addEventListener('click', async () => {
        const user = getCurrentUser();
        if (!user) { openDialog(); return; }

        if (getSyncState() === 'error') {
            const detail = getLastSyncError();
            const retry = confirm(
                'Last sync attempt failed' + (detail ? ':\n\n' + detail : '.') +
                '\n\nTap OK to retry now, or Cancel to sign out instead.'
            );
            if (retry) {
                await pushAllFiles();
                paintSync();
                return;
            }
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

