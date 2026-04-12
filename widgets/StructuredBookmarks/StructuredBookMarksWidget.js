// widgets/Notes/NotesWidget.js
//widgets\Notes\NotesWidget.js
import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { JsTreeAdapter } from "./JsTreeAdapter.js";

import { loadCSS } from "../../utilities/loadcss.js";
import { LinksTreeStorage } from "./linksTreeStorage.js";
import { ModLinksTree } from "./ModLinksTree.js";


export class StructuredBookMarksWidget extends BaseWidget {
async render() {
  const content = await this.createContent(); // ✅ FIX

  this.element = createWidgetShell({
    id: this.id,
    title: "🔖 Bookmarks",
    content,
  });

  return this.element;
}

  // 🔥 Make init async so we can wait for storage
  async init() {
    // Initialize the accordion and CSS
   
    loadCSS("bookmarks-widget-css", "widgets/StructuredBookMarks/StructuredBookMarksWidget.css");

  // ✅ NOW DOM exists
  const tree = new ModLinksTree("#links-tree");
  await tree.initLinksTree();
    }

createContent() {
  const container = document.createElement("div");

  container.innerHTML = `
    <section class="panel">
         <div
                    style="display:flex; align-items:center; gap:8px; justify-content:space-between;">
                    <div class="tree-actions"
                        style="display:flex; gap:8px; align-items:center;">
                       filter<input id="tree-search" type="search"
                            placeholder="Filter…" style="max-width:100px;" />
                        <button id="btn-export-tree"
                            title="Export tree to JSON"> 📤</button>
                        <button id="btn-import-tree"
                            title="Import tree from JSON"> 📥</button>
                        <button id="btn-collapse" title="Collapse All">
                            ▾▾</button>
                        <input id="file-import-tree" type="file"
                            accept="application/json,.json"
                            style="display:none" />
                    </div>
                </div>
      <div id="links-tree"
        style="margin-top:10px;height:300px; overflow-y:auto;"></div>
    </section>
  `;

  return container;
}


  
  




}
