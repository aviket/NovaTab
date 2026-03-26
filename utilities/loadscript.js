// utilities/loadscript.js
export function loadScript(id, path) {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
            return resolve(); // Already loaded
        }
        const script = document.createElement("script");
        script.id = id;
        script.src = chrome.runtime.getURL(path);
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}