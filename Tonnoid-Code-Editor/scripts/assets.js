/* ============================================================
   Attached assets (images / audio / video / fonts) for preview.
   Stored as data URLs, persisted to localStorage.
   ============================================================ */
import { assets } from './state.js';

const KEY = 'lantern_assets';

/* Read a File as a data URL. */
function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload  = () => resolve(r.result);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
    });
}

/* Import one or more files into `assets`.
   Returns { ok, allOk } — how many were persisted successfully. */
export async function importAssetFiles(fileList) {
    let ok = 0;

    for (const file of fileList) {
        try {
            const dataUrl = await readAsDataURL(file);
            assets[file.name] = { type: file.type || 'application/octet-stream', dataUrl };
            ok += 1;
        } catch (e) {
            console.warn('[assets] read failed:', file.name, e);
        }
    }

    const persisted = persistAssets();
    return {
        ok: persisted ? ok : 0,
        allOk: persisted && ok === fileList.length,
    };
}

/* Persist to localStorage. Returns true on success. */
export function persistAssets() {
    try {
        localStorage.setItem(KEY, JSON.stringify(assets));
        return true;
    } catch (e) {
        console.warn('[assets] localStorage write failed (likely full):', e);
        return false;
    }
}

/* Load persisted assets into the shared `assets` map. */
export function loadAssets() {
    try {
        const s = localStorage.getItem(KEY);
        if (!s) return;
        const parsed = JSON.parse(s);
        for (const k of Object.keys(parsed)) assets[k] = parsed[k];
    } catch (e) {
        console.warn('[assets] load failed:', e);
    }
}

/* Optional: remove an asset (used by future UI). */
export function removeAsset(name) {
    delete assets[name];
    persistAssets();
}