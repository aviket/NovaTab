// storage.js

const STORAGE_KEY = "novatab_settings";

export async function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get([STORAGE_KEY], (result) => {
            resolve(result[STORAGE_KEY] || {});
        });
    });
}

export async function saveSettings(settings) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ [STORAGE_KEY]: settings }, resolve);
    });
}
