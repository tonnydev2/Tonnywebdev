/* ============================================================
   PWA: service worker registration, install prompt, offline ready
   ============================================================ */

let deferredInstall = null;
const installBtn = document.getElementById('installAppBtn');

export function initPWA() {
    /* ---- Service worker ---- */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js', { scope: './' })
                .then(reg => {
                    console.log('[pwa] service worker registered:', reg.scope);
                })
                .catch(err => {
                    console.warn('[pwa] service worker registration failed:', err);
                });
        });
    }

    /* ---- Install prompt ---- */
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstall = e;
        if (installBtn) {
            installBtn.hidden = false;
            installBtn.addEventListener('click', promptInstall);
        }
    });

    window.addEventListener('appinstalled', () => {
        deferredInstall = null;
        if (installBtn) installBtn.hidden = true;
        console.log('[pwa] installed');
    });

    /* Hide the button if already installed (standalone mode). */
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
    if (isStandalone && installBtn) installBtn.hidden = true;
}

async function promptInstall() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    const choice = await deferredInstall.userChoice;
    console.log('[pwa] install choice:', choice.outcome);
    deferredInstall = null;
    if (installBtn) installBtn.hidden = true;
}

