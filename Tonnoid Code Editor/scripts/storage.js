import { savedFiles } from './state.js';
import { storageInfo } from './dom.js';

export function loadSavedFiles() {
    try {
        const stored = localStorage.getItem('lantern_saved_files');
        if (stored) {
            const parsed = JSON.parse(stored);
            for (const k of Object.keys(parsed)) savedFiles[k] = parsed[k];
        }
    } catch (e) { /* ignore */ }
    updateStorageInfo();
}

export function persistSavedFiles() {
    try {
        localStorage.setItem('lantern_saved_files', JSON.stringify(savedFiles));
    } catch (e) { /* ignore */ }
    updateStorageInfo();
}

export function updateStorageInfo() {
    const count = Object.keys(savedFiles).length;
    storageInfo.textContent = `📁 ${count} saved`;
}

