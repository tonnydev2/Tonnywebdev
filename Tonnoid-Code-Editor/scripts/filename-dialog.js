import { DEFAULT_LANG } from './state.js';
import { tabsByProject, getActiveProjectId } from './state.js';

const nameBackdrop = document.getElementById('nameDialogBackdrop');
const nameTitleEl  = document.getElementById('nameDialogTitle');
const nameInput    = document.getElementById('nameDialogInput');
const nameHint     = document.getElementById('nameDialogHint');
const nameConfirm  = document.getElementById('nameDialogConfirm');
const nameCancel   = document.getElementById('nameDialogCancel');

/* ---------- Local mutable state, declared first ---------- */
let dialogCallback = null;
let dialogLang     = DEFAULT_LANG;
let dialogMode     = 'create';
let dialogOriginal = null;

/* ---------- Public API ---------- */
export function askFileName({ title, lang, initial, mode, onConfirm }) {
    dialogMode     = mode || 'create';
    dialogLang     = lang || DEFAULT_LANG;
    dialogCallback = onConfirm;
    dialogOriginal = initial || null;

    nameTitleEl.textContent = title || 'New file';
    nameInput.value = initial || '';
    nameHint.textContent = dialogMode === 'rename'
        ? 'The extension will be preserved.'
        : `Extension .${dialogLang} will be added automatically.`;
    nameHint.classList.remove('error');
    nameConfirm.textContent = dialogMode === 'rename' ? 'Rename' : 'Create';

    nameBackdrop.hidden = false;
    setTimeout(() => {
        nameInput.focus();
        if (dialogMode === 'rename' && initial) {
            const dot = initial.lastIndexOf('.');
            if (dot > 0) nameInput.setSelectionRange(0, dot);
            else nameInput.select();
        } else {
            nameInput.select();
        }
    }, 0);
}

export function closeNameDialog() {
    nameBackdrop.hidden = true;
    dialogCallback = null;
    dialogLang = DEFAULT_LANG;
    dialogMode = 'create';
    dialogOriginal = null;
}

/* ---------- Internals ---------- */
function sanitizeBaseName(s) {
    return s.trim()
        .replace(/[\/\\?%*:|"<>]/g, '')
        .replace(/\s+/g, '_')
        .replace(/\.+$/, '');
}

function submitNameDialog() {
    const raw = nameInput.value;
    const clean = sanitizeBaseName(raw);
    if (!clean) {
        nameHint.textContent = 'Name cannot be empty.';
        nameHint.classList.add('error');
        nameInput.focus();
        return;
    }

    if (dialogMode === 'rename') {
        const ext = (dialogOriginal && dialogOriginal.match(/\.[^.]+$/)) || [`.${dialogLang}`];
        const newName = clean + ext;

        /* Check against the CURRENT PROJECT's tabs, not the global map. */
        const pid = getActiveProjectId();
        const projectTabs = tabsByProject[pid] || [];
        const clash = projectTabs.find(t => t.name === newName && t.name !== dialogOriginal);

        if (clash) {
            nameHint.textContent = `"${newName}" is already open.`;
            nameHint.classList.add('error');
            return;
        }
        if (dialogCallback) dialogCallback(newName);
    } else {
        /* Create mode: pass the bare name (no extension appended here). */
        if (dialogCallback) dialogCallback(clean);
    }
    closeNameDialog();
}

/* ---------- Wire up (side-effect code at the bottom) ---------- */
nameConfirm.addEventListener('click', submitNameDialog);
nameCancel.addEventListener('click', closeNameDialog);
nameBackdrop.addEventListener('mousedown', (e) => {
    if (e.target === nameBackdrop) closeNameDialog();
});
nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submitNameDialog(); }
    if (e.key === 'Escape') { e.preventDefault(); closeNameDialog(); }
    const clean = sanitizeBaseName(nameInput.value);
    if (clean && clean !== nameInput.value.trim()) {
        nameHint.textContent = `Will be saved as: ${clean}.${dialogLang}`;
        nameHint.classList.remove('error');
    } else {
        nameHint.textContent = dialogMode === 'rename'
            ? 'The extension will be preserved.'
            : `Extension .${dialogLang} will be added automatically.`;
        nameHint.classList.remove('error');
    }
});

