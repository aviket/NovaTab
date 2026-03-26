// utilities/storage.js
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

// storage.js (Add this to the bottom)

const NOTES_KEY = "novatab_notes";

export async function getNotes() {
    return new Promise((resolve) => {
        // 🔥 Using .local instead of .sync for large HTML data
        chrome.storage.local.get([NOTES_KEY], (result) => {
            resolve(result[NOTES_KEY] || {}); 
        });
    });
}

export async function saveNotes(notesData) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [NOTES_KEY]: notesData }, resolve);
    });
}
