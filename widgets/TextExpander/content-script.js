// content-script.js

let shortcuts = [];

// Load shortcuts from storage
chrome.storage.local.get("textExpander", (res) => {
  shortcuts = res.textExpander || [];
});

function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, "").split("+").sort().join("+");
}

function getEventShortcut(e) {
  const keys = [];

  if (e.ctrlKey) keys.push("ctrl");
  if (e.altKey) keys.push("alt");
  if (e.shiftKey) keys.push("shift");
  if (e.metaKey) keys.push("meta");

  const key = e.key.toLowerCase();
  if (!["control", "alt", "shift", "meta"].includes(key)) {
    keys.push(key);
  }

  return keys.sort().join("+");
}

// 🔥 MAIN LISTENER
window.addEventListener("keydown", (e) => {
  const pressed = getEventShortcut(e);
  console.log("Pressed shortcut:", pressed);
  console.log("Defined shortcuts:", shortcuts.map(s => s.keys));
  for (const item of shortcuts) {
    if (normalize(item.keys) === pressed) {
      e.preventDefault();
      insertText(item.text);
      break;
    }
  }
});

function insertText(text) {
  const active = document.activeElement;
  console.log("Active element:", active);
  if (!active) return;

  if (
    active.tagName === "TEXTAREA" ||
    (active.tagName === "INPUT" && active.type === "text")
  ) {
    const start = active.selectionStart;
    const end = active.selectionEnd;

    const value = active.value;

    active.value =
      value.substring(0, start) +
      text +
      value.substring(end);

    const pos = start + text.length;
    active.selectionStart = active.selectionEnd = pos;
  } else if (active.isContentEditable) {
    document.execCommand("insertText", false, text);
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.textexpander_widget_data) {
    shortcuts = changes.textexpander_widget_data.newValue || [];
  }
});