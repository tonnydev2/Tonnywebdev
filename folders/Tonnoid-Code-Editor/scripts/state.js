/* ============================================================
   Shared mutable state.
   ============================================================ */

export const DEFAULT_LANG = 'html';

export const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>

</body>
</html>
`;

/* ---------- Projects ---------- */

/* Each project: { id, name, createdAt } */
export const projects = [];

let activeProjectId = null;
export function getActiveProjectId() { return activeProjectId; }
export function setActiveProjectId(id) { activeProjectId = id; }

export function getActiveProject() {
    return projects.find(p => p.id === activeProjectId) || null;
}

/* projectId -> { [filename]: { lang, content, savedContent } } */
export const projectFiles = {};

/* projectId -> tabs array (for the tab strip) */
export const tabsByProject = {};

/* projectId -> activeTabId */
export const activeTabIdByProject = {};

/* ---------- Legacy flat storage (migrated on load) ---------- */
export const savedFiles = {};

/* name -> { type, dataUrl } — attached preview assets (global) */
export const assets = {};

/* ---------- Tab ID generation ---------- */
let tabCounter = 0;
export function nextTabId() {
    tabCounter += 1;
    return 't' + tabCounter;
}

/* ---------- Simple ID for projects ---------- */
let projectCounter = 0;
export function nextProjectId() {
    projectCounter += 1;
    return 'p' + Date.now().toString(36) + '_' + projectCounter;
}