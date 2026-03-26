// utilities/loadscript_1.js
export function loadScript(id, src) {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.id = id;
        script.src = chrome.runtime.getURL(src);
        script.onload = resolve;
        script.onerror = reject;

        document.head.appendChild(script);
    });
}