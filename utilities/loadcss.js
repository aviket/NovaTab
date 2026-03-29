// utilities/loadcss.js
/**
 * Dynamically load a CSS file into the document
 * Prevents duplicate loading using unique ID
 * 
 * @param {string} id - Unique ID for the <link> tag
 * @param {string} path - Relative path inside extension
 */
export function loadCSS(id, path) {
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL(path); // 🔥 CRITICAL

    document.head.appendChild(link);
}