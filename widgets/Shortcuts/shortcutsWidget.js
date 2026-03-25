// shortcuts-widget.js

import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";

export class ShortcutsWidget extends BaseWidget {
  constructor(id) {
    super(id);


    console.log("ShortcutsWidget constructor called");
    this.STORAGE_KEY = 'shortcuts_widget_data';
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
            <th>URL</th>
            <th>Open</th>
            <th></th>
        </tr>
        </thead>
        <tbody></tbody>
    </table>

    <div style="display:flex; gap:8px;">
        <button class="add-shortcut-btn">＋ Add</button>
        <button class="import-btn">📂 Import</button>
    </div>

    <input type="file" class="file-input" accept=".json" style="display:none;" />
    `;

  this.element = createWidgetShell({
    id: this.id,
    title: "Shortcuts",
    content
  });

  return this.element;
}

async init() {
  console.log("Initializing ShortcutsWidget...");  
  this.loadCSS();

  this.data =  await this.loadData();   // ✅ async moved here
  this.renderTable();
  console.log("ShortcutsWidget initialized with data:", this.data);
  this.bindEvents();
}

 

  bindEvents() {
    const addBtn = this.element.querySelector('.add-shortcut-btn');

    // ➕ Add
    addBtn.addEventListener('click', async () => {
      if (this.data.length >= this.MAX_RECORDS) {
        alert(`Max ${this.MAX_RECORDS} shortcuts allowed`);
        return;
      }

      this.data.push({ keys: '', url: '', target: 'tab' });
      await this.saveData(this.data);
      this.renderTable();
    });

    // ✏️ Auto-save
    this.element.addEventListener('input', async () => {
      await this.syncFromUI();
    });

    // ❌ Delete
    this.element.addEventListener('click', async (e) => {
      if (e.target.classList.contains('delete-btn')) {
        const i = Number(e.target.dataset.index);
        this.data.splice(i, 1);
        await this.saveData(this.data);
        this.renderTable();
      }
    });

    const importBtn = this.element.querySelector('.import-btn');
const fileInput = this.element.querySelector('.file-input');

importBtn.addEventListener('click', () => {
  fileInput.click();  // open file picker
});

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const json = JSON.parse(text);

    // 🔍 validate format
    if (!Array.isArray(json)) {
      throw new Error("Invalid format: must be array");
    }

    const valid = json.every(item =>
      typeof item.keys === 'string' &&
      typeof item.url === 'string' &&
      (item.target === 'tab' || item.target === 'window')
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
  fileInput.value = '';
});
  }

  async syncFromUI() {
    const rows = this.element.querySelectorAll('.shortcuts-table tbody tr');

    this.data = [...rows].map(row => ({
      keys: row.children[0].querySelector('input').value.trim(),
      url: row.children[1].querySelector('input').value.trim(),
      target: row.children[2].querySelector('select').value
    }));

    await this.saveData(this.data);
  }

  async loadData() {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEY]);
      const stored = result[this.STORAGE_KEY];

    if (!stored) {
    const defaults = await this.loadDefaultShortcuts();

    await chrome.storage.local.set({
        [this.STORAGE_KEY]: defaults
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
      [this.STORAGE_KEY]: data
    });
  }

  renderTable() {
    const tbody = this.element.querySelector('.shortcuts-table tbody');
    tbody.innerHTML = '';

    this.data.forEach((item, index) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td><input value="${item.keys}" /></td>
        <td><input value="${item.url}" /></td>
        <td>
          <select>
            <option value="tab" ${item.target === 'tab' ? 'selected' : ''}>Tab</option>
            <option value="window" ${item.target === 'window' ? 'selected' : ''}>Window</option>
          </select>
        </td>
        <td>
          <button class="delete-btn" data-index="${index}">✕</button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  loadCSS() {
    const id = "shortcuts-css";

    if (document.getElementById(id)) return; // prevent duplicate

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("widgets/Shortcuts/shortcutsWidget.css");

    document.head.appendChild(link);
  }

    async loadDefaultShortcuts() {
    try {
        const url = chrome.runtime.getURL("widgets/Shortcuts/default-shortcuts.json");

        const response = await fetch(url);
        const data = await response.json();

        return data;
    } catch (err) {
        console.error("Failed to load default shortcuts:", err);
        return [];
    }
    }
}