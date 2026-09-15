/* ============================================================
   Header overflow menu ("☰"). Houses the less-frequently-used
   header actions (New, Run, Download, Import, Sync) so Save /
   Open / Find stay one tap away on a crowded mobile header.
   ============================================================ */

const menuBtn = document.getElementById('moreMenuBtn');
const menu    = document.getElementById('moreMenu');

function closeMenu() {
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
}

function openMenu() {
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
}

export function initOverflowMenu() {
    if (!menuBtn || !menu) return;

    menuBtn.addEventListener('click', () => {
        if (menu.hidden) openMenu();
        else closeMenu();
    });

    /* Close once an actual action inside the menu is tapped — e.g. a
       button's dot/label spans (like #syncBtn's) count too, via closest(). */
    menu.addEventListener('click', (e) => {
        if (e.target.closest('button')) closeMenu();
    });

    /* Close on outside tap/click. */
    document.addEventListener('click', (e) => {
        if (menu.hidden) return;
        if (menuBtn.contains(e.target) || menu.contains(e.target)) return;
        closeMenu();
    });

    /* Close on Escape (useful with an external keyboard). */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.hidden) closeMenu();
    });
}


