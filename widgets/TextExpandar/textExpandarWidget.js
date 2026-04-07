// widgets/Shortcuts/shortcutsWidget.js
// shortcuts-widget.js

import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { loadCSS } from "../../utilities/loadcss.js";

export class TextExpandarWidget extends BaseWidget {
  constructor(id) {
    super(id);

    console.log("TextExpandarWidget constructor called");
    this.STORAGE_KEY = "textexpander_widget_data";
    this.MAX_RECORDS = 10;

    this.data = [];
  }

  // 🔹 Create DOM (required by BaseWidget)
 render() {
  const content = document.createElement("div");
  content.className = "shortcuts-card";

  content.innerHTML = `
    <table class="shortcuts-table">
      <thead>
        <tr>
          <th>Keys</th>
          <th>Text</th>
          <th></th>
        </tr>
      </thead>
      <tbody></tbody>   <!-- ✅ EMPTY -->
    </table>
  `;

  this.element = createWidgetShell({
    id: this.id,
    title: "Text Expander",
    content,
  });

  return this.element;
}

  async init() {
    console.log("Initializing ShortcutsWidget...");
    loadCSS("shortcuts-css", "widgets/TextExpandar/textExpandarWidget.css");

    this.data = await this.loadData(); // ✅ async moved here
    this.renderTable();
    console.log("TextExpandarWidget initialized with data:", this.data);
    this.bindEvents();
    // this.attachShortcutListener();
  }

  bindEvents() {
    // const addBtn = this.element.querySelector(".add-shortcut-btn");

    // // ➕ Add
    // addBtn.addEventListener("click", async () => {
    //   if (this.data.length >= this.MAX_RECORDS) {
    //     alert(`Max ${this.MAX_RECORDS} shortcuts allowed`);
    //     return;
    //   }

    //   this.data.push({ keys: "", text: "" });
    //   await this.saveData(this.data);
    //   this.renderTable();
    // });

    // ✏️ Auto-save
    this.element.addEventListener("input", async () => {
      await this.syncFromUI();
    });

    // ❌ Delete
    this.element.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const i = Number(e.target.dataset.index);
        this.data.splice(i, 1);
        await this.saveData(this.data);
        this.renderTable();
      }
    });

    // const importBtn = this.element.querySelector(".import-btn");
    // const fileInput = this.element.querySelector(".file-input");

    // importBtn.addEventListener("click", () => {
    //   fileInput.click(); // open file picker
    // });

    // fileInput.addEventListener("change", async (e) => {
    //   const file = e.target.files[0];
    //   if (!file) return;

    //   try {
    //     const text = await file.text();
    //     const json = JSON.parse(text);

    //     // 🔍 validate format
    //     if (!Array.isArray(json)) {
    //       throw new Error("Invalid format: must be array");
    //     }

    //     const valid = json.every(
    //       (item) =>
    //         typeof item.keys === "string" &&
    //         typeof item.url === "string" &&
    //         (item.target === "tab" || item.target === "window"),
    //     );

    //     if (!valid) {
    //       throw new Error("Invalid shortcut structure");
    //     }

    //     // 🔥 apply data
    //     this.data = json.slice(0, this.MAX_RECORDS);

    //     await this.saveData(this.data);
    //     this.renderTable();

    //     alert("Shortcuts imported successfully 🚀");
    //   } catch (err) {
    //     console.error(err);
    //     alert("Invalid JSON file");
    //   }

    //   // reset input so same file can be re-selected
    //   fileInput.value = "";
    // });
  }

  async syncFromUI() {
    const rows = this.element.querySelectorAll(".shortcuts-table tbody tr");

this.data = [...rows].map((row) => ({
  keys: row.children[0].querySelector("input").value.trim(),
  text: row.children[1].querySelector("input").value.trim()
}));

    await this.saveData(this.data);
    // this.attachShortcutListener();
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEY]);
      const stored = result[this.STORAGE_KEY];

      if (!stored) {
        const defaults = await this.loadDefaultShortcuts();

        await chrome.storage.local.set({
          [this.STORAGE_KEY]: defaults,
        });

        return [...defaults];
      }

      return Array.isArray(stored) ? stored : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async saveData(data) {
    await chrome.storage.local.set({
      [this.STORAGE_KEY]: data,
    });
  }

 renderTable() {
  const tbody = this.element.querySelector(".shortcuts-table tbody");
  tbody.innerHTML = "";

  this.data.forEach((item, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><input value="${item.keys || ""}" /></td>
      <td><input value="${item.text || ""}" /></td>
      <td>
        <button class="delete-btn" data-index="${index}">✕</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

  async loadDefaultShortcuts() {
    try {
      const url = chrome.runtime.getURL(
        "widgets/TextExpandar/default-shortcuts.json",
      );

      const response = await fetch(url);
      const data = await response.json();

      return data;
    } catch (err) {
      console.error("Failed to load default shortcuts:", err);
      return [];
    }
  }

  normalizeShortcut(str) {
    return str.toLowerCase().replace(/\s+/g, "").split("+").sort().join("+");
  }

  getEventShortcut(e) {
    const keys = [];

    if (e.ctrlKey) keys.push("ctrl");
    if (e.altKey) keys.push("alt");
    if (e.shiftKey) keys.push("shift");
    if (e.metaKey) keys.push("meta");

    // Avoid modifier duplication
    const key = e.key.toLowerCase();
    if (!["control", "alt", "shift", "meta"].includes(key)) {
      keys.push(key);
    }

    return keys.sort().join("+");
  }

//   attachShortcutListener() {
//     // Prevent duplicate listeners if widget re-inits
//     if (this._shortcutHandler) {
//       window.removeEventListener("keydown", this._shortcutHandler);
//     }

//     this._shortcutHandler = (e) => {
//       const pressed = this.getEventShortcut(e);

//       for (const item of this.data) {
//         const defined = this.normalizeShortcut(item.keys);

//         if (!defined) continue;

//         if (pressed === defined) {
//           e.preventDefault(); // stop default browser behavior

//           this.executeShortcut(item);
//           break;
//         }
//       }
//     };

//     window.addEventListener("keydown", this._shortcutHandler);
//   }

// executeShortcut(item) {
//   console.log(`Executing shortcut: "${item.keys}"`);
//   if (!item.text) return;

//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const tab = tabs[0];
//     if (!tab?.id || !tab.url) return;

//     if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
//       console.warn("Cannot inject into this page");
//       return;
//     }

//     chrome.tabs.sendMessage(tab.id, {
//       type: "INSERT_TEXT",
//       text: item.text
//     }, () => {
//       if (chrome.runtime.lastError) {
//         console.warn("Retrying via script injection...");

//         chrome.scripting.executeScript({
//           target: { tabId: tab.id },
//           files: ["content-script.js"]
//         }, () => {
//           chrome.tabs.sendMessage(tab.id, {
//             type: "INSERT_TEXT",
//             text: item.text
//           });
//         });
//       }
//     });
//   });
// }

  destroy() {
    if (this._shortcutHandler) {
      window.removeEventListener("keydown", this._shortcutHandler);
    }
    super.destroy();
  }
}
