/* Shared mutable state. Import and mutate — don't rebind. */
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

/* Tab list. Each entry: { id, name, lang, content, savedContent } */
export const tabs = [];
let activeTabId = null;
let tabCounter = 0;

export function nextTabId() {
    tabCounter += 1;
    return 't' + tabCounter;
}

export function getActiveTabId() { return activeTabId; }
export function setActiveTabId(id) { activeTabId = id; }

/* localStorage-backed saved files: name -> { name, lang, content } */
export const savedFiles = {};

