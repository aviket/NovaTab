// widgets/Shortcuts/shortcutsWidget.js
// shortcuts-widget.js

import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { loadCSS } from "../../utilities/loadcss.js";
import { TextExpanderStorage } from "./TextExpanderStorage.js";

export class TextexpanderWidget extends BaseWidget {
  constructor(id) {
    super(id);

    console.log("TextexpanderWidget constructor called");
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
        <div style="display:flex; gap:8px;">
        <button class="add-shortcut-btn">＋ Add</button>
        <button class="import-btn-t">📂 Import</button>
        <button class="export-btn-t">📂 Export</button>
    </div>
    <input type="file" class="file-input" accept=".json" style="display:none;" />
  `;

  this.element = createWidgetShell({
    id: this.id,
    title: "Text Expander",
    content,
  });

  return this.element;
}

  async init() {
    console.log("Initializing TextExpanderWidget...");
    loadCSS("shortcuts-css", "widgets/TextExpander/textExpanderWidget.css");

    this.data = await this.loadData(); // ✅ async moved here
    this.renderTable();
    console.log("TextExpanderWidget initialized with data:", this.data);
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

    const addBtn = this.element.querySelector(".add-shortcut-btn");

    // ➕ Add
    addBtn.addEventListener("click", async () => {
      if (this.data.length >= this.MAX_RECORDS) {
        alert(`Max ${this.MAX_RECORDS} shortcuts allowed`);
        return;
      }

      this.data.push({ keys: "", text: ""  });
      await this.saveData(this.data);
      this.renderTable();
    });

    const importBtn = this.element.querySelector(".import-btn-t");
    console.log("Import button element:", importBtn);
    const fileInput = this.element.querySelector(".file-input");
    importBtn.addEventListener("click", () => {
      fileInput.click();
      



    });

        fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const json = JSON.parse(text);

        // 🔍 validate format
        if (!Array.isArray(json)) {
          throw new Error("Invalid format: must be array");
        }
        console.log("Parsed JSON from file:", json);  
        const valid = json.every(
          (item) =>
            typeof item.keys === "string" &&
            typeof item.text === "string" 

           
        );

        if (!valid) {
          throw new Error("Invalid shortcut structure");
        }

        // 🔥 apply data
        this.data = json.slice(0, this.MAX_RECORDS);

        await this.saveData(this.data);
        this.renderTable();

        alert("Shortcuts imported successfully 🚀");
      } catch (err) {
        console.error(err);
        alert("Invalid JSON file");
      }

      // reset input so same file can be re-selected
      fileInput.value = "";
    });

    const exportBtn = this.element.querySelector(".export-btn-t");
    console.log("Export button element:", exportBtn);
    exportBtn.addEventListener("click", () => {
      const dataStr = JSON.stringify(this.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shortcuts.json";
      a.click();
      URL.revokeObjectURL(url);
    });


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
      const result = await TextExpanderStorage.getTextExpander();
      console.log("Loaded data from storage:", result);
      // check if result is empty or not an array
      if (!result || !Array.isArray(result)) {


      //if (!result) {
        console.log("No existing data found, loading defaults...");
        const defaults = await this.loadDefaultShortcuts();

        await TextExpanderStorage.saveTextExpander(defaults);

        return [...defaults];
      }

      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async saveData(data) {
    await TextExpanderStorage.saveTextExpander(data);
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
        "widgets/Textexpander/default-shortcuts.json",
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
