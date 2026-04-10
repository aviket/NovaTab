import { JsTreeAdapter } from "./JsTreeAdapter.js";
import { tooltipManager } from "../utilities/ToolTipManager/ToolTipManager.js";
import {loadCSS } from "../utilities/loadcss.js";
import { LinksTreeStorage } from "./linksTreeStorage.js";
export class ModLinksTree {
  constructor(selector) {
    this.tree = new JsTreeAdapter(selector, $);
    // this.tooltipManager = new TooltipManager();
  }

  init() {
    console.log("Initializing Links Tree with empty data...");
    this.tree.init({
      
      core: { data: [] },
    });

    // this.bindEvents(); // 👈 important
  }

  getInstance() {
    console.log("Getting jsTree instance from ModLinksTree");
    return this.tree.getInstance();
  }

//   bindEvents() {
//     const inst = this.getInstance();

//     $("#links-tree").on("contextmenu.jstree", function (e) {
//       // console.log(e);

//       // console.log('Context menu opened');
//       suppressNextSelect = true;

//       // reset shortly after (covers all browsers)
//       setTimeout(() => {
//         suppressNextSelect = false;
//       }, 0);
//     });

//     let mouseX = 0;
//     let mouseY = 0;

//     $(document).on("mousemove", function (e) {
//       mouseX = e.pageX;
//       mouseY = e.pageY;
//     });

//     let tooltipEl = null;

//     $("#links-tree").on("mouseenter", ".jstree-anchor", function () {
//       console.log("Mouse entered node:", this);
//       //if (tippy) return;

//       const inst = $("#links-tree").jstree(true);
//       const node = inst.get_node(this);
//       if (!node) return;

//       const { url = "", Notes: notes = "", Todo: todo = "" } = node.data || {};

//       // 🔥 favicon (Google service)
//       const favicon = url
//         ? `https://www.google.com/s2/favicons?domain=${url}&sz=32`
//         : "";

//       const html = `
//     <div class="tooltip-card">
      
//       <div class="tooltip-header">
//         ${favicon ? `<img src="${favicon}" class="tooltip-favicon">` : ""}
//         <div class="tooltip-title-wrap">
//           <div class="tooltip-title">${node.text}</div>
//           ${url ? `<div class="tooltip-url">${url}</div>` : ""}
//         </div>
//       </div>

//       ${notes ? `<div class="tooltip-section">📝 ${notes.replace(/\n/g, "<br>")}</div>` : ""}
//       ${todo ? `<div class="tooltip-section">✅ ${todo}</div>` : ""}

//     </div>
//   `;

//       tippy(this, {
//         content: html,
//         allowHTML: true,
//         theme: "light-border",
//         placement: "right",
//         delay: [300, 0],
//         maxWidth: 350,
//       });
//     });
//   }

  async initLinksTree() {
    // 1) Try storage
    console.log("Initializing links tree: loading from storage...");
    const linksTree = await LinksTreeStorage.getTree();
    loadCSS( "tooltip" , "utilities/TooltipManager/TooltipManager.css");
    loadCSS( "tree" , "linkstree/linksTree.css");
    // await loadScript( "popper", "assets/lib/popper.min.js");
    // await loadScript("tippy", "assets/lib/tippy-bundle.umd.min.js");
    // await loadScript("tippylife", "assets/lib/tippy-bundle.iife.min.js");
    //const tippy = window.tippy;
    let seed;
    if (Array.isArray(linksTree) && linksTree.length) {
      seed = linksTree;
    } else {
      // 2) Fall back to data.json
      try {
        const data = await this.loadJsonAsset("assets/data.json");
        seed = data.linksTree && data.linksTree.length ? data.linksTree : [];
      } catch (e) {
        console.error("Could not load data.json:", e);
        seed = []; // last-resort empty
      }
    }
    this.bindCoreEvents(); // core events (selection, rename, delete, etc.)
    this.bindUIEvents(); // ensure UI buttons are wired up before we init the tree
    // Normalize and init jsTree
    const treeData = this.normalizeRoot(seed);
    // console.log("Initializing links tree with data:", treeData);
    const $tree = $("#links-tree").jstree({
      core: {
        data: treeData,
        check_callback: true, // allow create/rename/move/delete
        multiple: true,
      },
      plugins: ["dnd", "contextmenu", "wholerow", "types", "search"],
      types: {
        root: { icon: "jstree-folder", valid_children: ["folder", "link"] },
        link: { icon: "jstree-file", valid_children: [] },
        folder: { icon: "jstree-folder", valid_children: ["folder", "link"] },
        default: { icon: "jstree-folder" },
      },
      contextmenu: {
        items: function (node) {
          const inst = $("#links-tree").jstree(true);
          const t = inst.get_type(node); // 'folder', 'link', 'root', etc.
          // console.log("Context menu for node type:", t);
          const canAddChild = t === "folder" || t === "root";

          const base = {
            rename: { label: "Rename", action: () => inst.edit(node) },
            remove: { label: "Delete", action: () => inst.delete_node(node) },
            newFolder: {
              label: "New Folder",
              _disabled: !canAddChild, // disable if not a folder/root
              action: () =>
                inst.create_node(
                  node,
                  { text: "New Folder", type: "folder" },
                  "last",
                  (n) => inst.edit(n),
                ),
            },
            newLink: {
              label: "New Link",
              _disabled: !canAddChild,
              action: () => {
                let url = window.prompt(
                  "Enter URL (include https://)",
                  "https://",
                );
                if (!url) return;
                url = url.trim();
                if (!/^https?:\/\//i.test(url)) url = "https://" + url;

                const inst = $("#links-tree").jstree(true);

                // ensure parent is open, then create + edit
                inst.open_node(node, () => {
                  const n = inst.create_node(
                    node,
                    {
                      text: this.prettyTitleFromUrl(url),
                      type: "link",
                      data: { url },
                    },
                    "last",
                  );

                  // give jsTree a tick to paint the node, then start rename
                  setTimeout(() => inst.edit(n), 0);
                });
              },
            },

            editUrl: {
              // ✅ NEW ITEM
              label: "Edit URL",
              _disabled: node.type !== "link", // only enable for link nodes
              action: () => {
                const currentUrl = node.data?.url || "https://";
                const newUrl = prompt("Enter new URL:", currentUrl);
                if (newUrl) {
                  node.data = node.data || {};
                  node.data.url = newUrl;
                  inst.redraw_node(node); // refresh to reflect possible changes
                }
              },
            },

            editNotes: {
              label: "Edit Notes",
              action: () => {
                node.data = node.data || {};

                const current = node.data.Notes || "";

                const modal = $(`
    <div class="note-modal">
      <div class="note-box">
        <h3>Edit Notes</h3>
        <textarea id="note-input">${current}</textarea>
        <div class="actions">
          <button id="save-note">Save</button>
          <button id="cancel-note">Cancel</button>
        </div>
      </div>
    </div>
  `).appendTo("body");

                $("#save-note").on("click", () => {
                  node.data.Notes = $("#note-input").val();
                  $("#links-tree").jstree(true).redraw_node(node);
                  this.persistTree(); // save changes immediately
                  modal.remove();
                });

                $("#cancel-note").on("click", () => modal.remove());
              },
            },
          };
          return base;
        },
      },
    });
    // console.log("jsTree initialized on #links-tree");
    // Prepare a promise that resolves when jsTree signals ready (or after a short fallback timeout)
    const readyPromise = new Promise((resolve) => {
      // Resolve with the instance when ready.jstree fires

      // console.log("Waiting for jsTree to be ready...");
      // Fallback: resolve after 2s to avoid hanging consumers in rare cases
      setTimeout(() => resolve($("#links-tree").jstree(true)), 2000);
    });
    // console.log("jsTree initialization continues while waiting for ready...");
    // 3) Persist any change back to storage
    const save = async () => {
      try {
        const snapshot = this.getTreeSnapshot($("#links-tree"));
        await LinksTreeStorage.saveTree(snapshot);
      } catch (e) {
        console.error("Failed to save linksTree:", e);
      }
    };
    //console.log("Attached event listeners for jsTree changes");
    // === Export / Import ===

    //console.log("Defined downloadJson helper function");
    // Export: dump current tree JSON (including the root wrapper)

    //console.log("Attached export button listener");
    // Import: choose file, parse, store, and reload UI

    //console.log("Attached import button listener");

    //console.log("Attached collapse button listener");

    //console.log("Attached file input change listener for import");
    $("#links-tree")
      .on("rename_node.jstree", save)
      .on("delete_node.jstree", save)
      .on("create_node.jstree", save)
      .on("move_node.jstree", save)
      .on("changed.jstree", save);

    // 4) On very first run (no storage), store the seeded tree so future opens are fast
    if (!linksTree || !linksTree.length) {
      try {
        await LinksTreeStorage.saveTree(treeData);
      } catch (e) {
        console.warn("Could not persist initial seed to storage:", e);
      }
    }
    // console.log(
    //   "Attached jsTree event listeners for changes to persist to storage",
    // );
    // Inside initLinksTree (newtab.js)
    $("#tree-search").on("input", function () {
      const v = $(this).val();
      $("#links-tree").jstree("close_all");
      $("#links-tree").jstree(true).search(v);
    });
    //console.log("Attached search input listener for tree search");
    // Once the tree is built, collapse everything

    // 5) Optional: handle link activation (open in current tab)
    //   $('#links-tree').on('activate_node.jstree', function (_e, data) {
    //     const node = data.node;
    //     const url = node?.data?.url;
    //     if (url && typeof url === 'string') {
    //       // open in same tab
    //       window.location.href = url;
    //     }
    //   });

    // $("#links-tree").on("select_node.jstree", async function (e, data) {
    //   const node = data.node;

    //   console.log("***data logged above*** ");
    //   if (
    //     data.event &&
    //     data.event.button !== undefined &&
    //     data.event.button !== 0
    //   ) {
    //     console.log("Non-left click ignored");
    //     return;
    //   }
    //   // console.log('Selected node:', node.data);

    //   // If node has a URL stored in its "a_attr.href" or custom data
    //   let url = null;

    //   if (node.data && node.data.url) {
    //     url = node.data.url;
    //   } else if (node.original && node.original.url) {
    //     url = node.original.url;
    //   }

    //   // 🚫 Also ignore non-left mouse buttons (safety)
    //   // if (data.event && data.event.button !== undefined && data.event.button !== 0) {
    //   //   console.log('Non-left click ignored');
    //   //   return;
    //   // }

    //   if (url) {
    //     // Update recent BEFORE opening (so duplicate/move logic runs)
    //     try {
    //       await addOrMoveRecent(url, node.text || this.prettyTitleFromUrl(url));
    //     } catch (err) {
    //       console.error("Failed to update Recent from tree select", err);
    //     }
    //     // open in new tab
    //     window.open(url, "_blank");
    //   }
    // });

    // wait till jsTree reports ready (or fallback timeout) before returning
    await readyPromise;

    // --- ensure Recent folder placement as required ---
    try {
      await this.ensureRecentFolderPlacement();
    } catch (err) {
      console.error("ensureRecentFolderPlacement failed", err);
    }

    // return the jstree instance for convenience to callers
    return $("#links-tree").jstree(true);
  }

  // -------------------- Recent list management --------------------

  /**
   * normalizeUrlForComparison(url)
   * - Return a canonical string for comparing URLs (drops trailing slash,
   *   lowercases hostname, keeps pathname+search+hash).
   * - If input is not a full URL, attempts to add https:// and normalize.
   */
  normalizeUrlForComparison(raw) {
    try {
      let u;
      if (/^https?:\/\//i.test(raw)) {
        u = new URL(raw);
      } else {
        // assume https for normalization
        u = new URL("https://" + raw);
      }
      // Remove default port if present
      if (
        (u.protocol === "https:" && u.port === "443") ||
        (u.protocol === "http:" && u.port === "80")
      ) {
        u.port = "";
      }
      // Normalize: lowercase host, remove trailing slash on pathname (unless root)
      const host = u.hostname.toLowerCase();
      let pathname = u.pathname || "/";
      if (pathname !== "/" && pathname.endsWith("/"))
        pathname = pathname.replace(/\/+$/, "");
      // Keep search and hash as-is
      return `${u.protocol}//${host}${u.port ? ":" + u.port : ""}${pathname}${u.search}${u.hash}`;
    } catch (err) {
      // If URL parsing fails, fallback to raw trimmed
      return String(raw).trim();
    }
  }

  async addOrMoveRecent(url, title, maxEntries = 10) {
    if (!url) return null;
    // return early if domain contains "facebook" (case-insensitive)
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("facebook")) {
      return null;
    }
    const inst = $("#links-tree").jstree(true);
    if (!inst) {
      console.warn("addOrMoveRecent: jsTree not available");
      return null;
    }

    // 1) Ensure "My Sites" exists (create if missing)
    const mySitesNode = this.getOrCreateMySites();
    //console.log("addOrMoveRecent: My Sites node:", mySitesNode);
    if (!mySitesNode) {
      console.warn("addOrMoveRecent: could not get/create My Sites");
      return null;
    }

    // 2) Ensure "Recent" exists under "My Sites" and use that as the parent for new/updated entries.
    //    ensureRecentExists should return the Recent node (create/move it if needed).
    const recentNode = this.ensureRecentExists(mySitesNode);
    if (!recentNode) {
      console.warn(
        "addOrMoveRecent: could not get/create Recent under My Sites",
      );
      return null;
    }

    // Snapshot before changes so we persist only on actual change
    const beforeSnapshot = JSON.stringify(
      this.getTreeSnapshot($("#links-tree")),
    );

    // 3) Look for an existing child under Recent that matches the URL
    const existing = this.findChildByUrl(recentNode, url);

    if (existing && existing.node) {
      // Update title if needed
      const node = existing.node;
      const currentText = (node.text || "").trim();
      if (title && title.trim() && currentText !== title.trim()) {
        inst.rename_node(node, title.trim());
      }
      // Move existing node to first position within Recent
      try {
        inst.move_node(existing.id, recentNode.id, 0);
      } catch (err) {
        console.error("addOrMoveRecent: move_node failed", err);
      }
      inst.open_node(recentNode.id);
    } else {
      // Create a new link node at index 0 under Recent
      const newNodeData = {
        text: title || this.prettyTitleFromUrl(url) || url,
        type: "link",
        data: { url },
      };
      try {
        const newId = inst.create_node(recentNode.id, newNodeData, 0);
        if (!newId) {
          console.error("addOrMoveRecent: create_node returned falsy");
          return null;
        }
        inst.open_node(recentNode.id);
      } catch (err) {
        console.error("addOrMoveRecent: create_node failed", err);
        return null;
      }
    }

    // 4) Enforce maxEntries: remove children beyond maxEntries from Recent
    const updatedRecent = inst.get_node(recentNode.id); // refresh
    const children = Array.isArray(updatedRecent.children)
      ? updatedRecent.children.slice()
      : [];
    if (children.length > maxEntries) {
      const toRemove = children.slice(maxEntries);
      toRemove.forEach((cid) => {
        try {
          inst.delete_node(cid);
        } catch (e) {
          /* ignore errors */
        }
      });
    }

    // 5) Persist if tree changed
    const afterSnapshot = JSON.stringify(
      this.getTreeSnapshot($("#links-tree")),
    );
    if (beforeSnapshot !== afterSnapshot) {
      await this.persistTree();
    }

    // Return the (now-first) child node under Recent
    const topChildId = inst.get_node(recentNode.id).children[0];
    return inst.get_node(topChildId);
  }

  /**
   * findChildByUrl(parentNode, url)
   * - returns { node, id, idx } for a direct child of parentNode whose .data.url
   *   matches the normalized url, or null if none.
   */
  findChildByUrl(parentNode, url) {
    const inst = $("#links-tree").jstree(true);
    if (!inst || !parentNode || !Array.isArray(parentNode.children))
      return null;
    const norm = this.normalizeUrlForComparison(url);
    for (let i = 0; i < parentNode.children.length; ++i) {
      const cid = parentNode.children[i];
      const n = inst.get_node(cid);
      if (!n) continue;
      const candidateUrl =
        (n.data && n.data.url) || (n.original && n.original.url) || "";
      if (
        candidateUrl &&
        this.normalizeUrlForComparison(candidateUrl) === norm
      ) {
        return { node: n, id: cid, idx: i };
      }
    }
    return null;
  }

  findNodeByName(name) {
    if (!name) return null;
    const inst = $("#links-tree").jstree(true);
    if (!inst) return null;
    // console.log(`Searching for node by name: "${name}"`);
    const needle = String(name).trim().toLowerCase();
    const flat = inst.get_json("#", { flat: true }) || [];
    //console.log(`Total nodes to scan: ${flat.length}`);
    const match = flat.find(
      (n) =>
        String(n.text || "")
          .trim()
          .toLowerCase() === needle,
    );
    if (!match) return null;
    //console.log(`Found matching node ID: ${match.id} (type: ${match.type})`);
    const full = inst.get_node(match.id);
    // console.log("Full node object:", full);
    return {
      node: full,
      type: match.type === "link" ? "link" : "node",
    };
  }

  // Pretty default title from URL host
  prettyTitleFromUrl(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      return host.split(".").slice(0, -1).join(".") || host; // “github”, “mail.google”
    } catch {
      return url;
    }
  }

  // Ensure the root wrapper exists for jsTree (“#” must have exactly one child)
  // function normalizeRoot(tree) {
  //   // Ensure a single top-level root node for jsTree
  //   if (Array.isArray(tree) && tree.length === 1 && tree[0].id === 'root') return tree;
  //   return [{
  //     id: 'root',
  //     text: 'My Links',
  //     state: { opened: true },
  //     children: Array.isArray(tree) ? tree : []
  //   }];
  // }

  normalizeRoot(tree) {
    return Array.isArray(tree) ? tree : [];
  }

  async loadJsonAsset(pathInExtension) {
    const url = chrome.runtime.getURL(pathInExtension);
    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`Failed to load ${pathInExtension}: ${res.status}`);
    return res.json();
  }

  getTreeSnapshot($tree) {
    const inst = $tree.jstree(true);

    // ✅ PURE JSON (safe for stringify + storage)
    return inst.get_json("#", {
      flat: false,
      no_id: false,
      no_data: false,
    });
  }

  async ensureRecentFolderPlacement() {
    const inst = $("#links-tree").jstree(true);
    if (!inst) {
      console.warn(
        "ensureRecentFolderPlacement: jsTree instance not available",
      );
      return;
    }

    // 1. Get or create parent
    const parentNode = this.getOrCreateMySites();
    if (!parentNode) {
      console.warn(
        "ensureRecentFolderPlacement: could not get/create My Sites",
      );
      return;
    }

    // 2. Ensure Recent exists under it
    const beforeSnapshot = JSON.stringify(
      this.getTreeSnapshot($("#links-tree")),
    );

    const recentNode = this.ensureRecentExists(parentNode);
    if (!recentNode) {
      console.warn(
        "ensureRecentFolderPlacement: could not ensure Recent exists",
      );
      // still attempt persist if something else changed
    }

    // 3. Ensure first child
    this.ensureRecentIsFirstChild(parentNode);

    // 4. persist if tree changed
    const afterSnapshot = JSON.stringify(
      this.getTreeSnapshot($("#links-tree")),
    );
    if (beforeSnapshot !== afterSnapshot) {
      await persistTree();
    } else {
      //console.log("ensureRecentFolderPlacement: no changes needed");
    }
  }

  /**
   * persistTree()
   * - Persist current jstree snapshot to storage.
   */
  async persistTree() {
    try {
      const snapshot = this.getTreeSnapshot($("#links-tree"));
      await LinksTreeStorage.saveTree(snapshot);
      // console.log("persistTree: saved linksTree");
    } catch (err) {
      console.error("persistTree: failed to save linksTree", err);
    }
  }

  /**
   * isFolderNode(node)
   * - Small guard: treat anything that's not 'link' as a folder/root.
   */
  // isFolderNode(node) {
  //   if (!node) return false;
  //   return node.type !== 'link';
  // }

  /**
   * getOrCreateMySites()
   * - Find "My Sites" folder (case-insensitive). If missing, create it under the root.
   * - Returns the jsTree node object for "My Sites".
   */
  getOrCreateMySites() {
    const inst = $("#links-tree").jstree(true);
    if (!inst) return null;

    const found = this.findNodeByName("My Sites");
    if (found?.node) return found.node;

    // 🔥 ALWAYS create at root "#"
    const createdId = inst.create_node(
      "#",
      {
        text: "My Sites",
        type: "folder",
      },
      "last",
    );

    inst.open_node(createdId);
    return inst.get_node(createdId);
  }
  /**
   * ensureRecentExists(parentNode)
   * - Ensure a folder named "Recent" exists as a child of parentNode.
   * - If exists (anywhere), will move it under parentNode. If doesn't exist, creates it.
   * - Returns the jsTree node for Recent (or null on failure).
   */
  ensureRecentExists(parentNode) {
    const inst = $("#links-tree").jstree(true);
    if (!inst || !parentNode) return null;

    // Find any existing "Recent" anywhere
    const found = this.findNodeByName("Recent");

    if (found && found.node) {
      const recentNode = found.node;

      // If already a direct child of parentNode, simply return it
      if (recentNode.parent === parentNode.id) {
        return recentNode;
      }

      // Otherwise move it to be a child of parentNode (append)
      try {
        inst.move_node(recentNode.id, parentNode.id, "last");
        // ensure parent is open so node is visible
        inst.open_node(parentNode.id);
        return inst.get_node(recentNode.id);
      } catch (err) {
        console.error("ensureRecentExists: failed moving existing Recent", err);
        return null;
      }
    }

    // Not found anywhere: create as folder under parentNode
    try {
      const newId = inst.create_node(
        parentNode.id,
        { text: "Recent", type: "folder" },
        "last",
      );
      if (!newId) return null;
      inst.open_node(parentNode.id);
      return inst.get_node(newId);
    } catch (err) {
      console.error("ensureRecentExists: failed to create Recent node", err);
      return null;
    }
  }

  /**
   * ensureRecentIsFirstChild(parentNode)
   * - Moves the 'Recent' node to index 0 among parent's children.
   * - Returns true if a change was made (or already first).
   */
  ensureRecentIsFirstChild(parentNode) {
    const inst = $("#links-tree").jstree(true);
    if (!inst || !parentNode) return false;

    const children = Array.isArray(parentNode.children)
      ? parentNode.children.slice()
      : [];
    if (!children.length) return false;

    // find child whose text === 'Recent' (case-insensitive)
    const idx = children.findIndex((cid) => {
      const n = inst.get_node(cid);
      return (
        n &&
        typeof n.text === "string" &&
        n.text.trim().toLowerCase() === "recent"
      );
    });

    if (idx === -1) {
      // Recent not a direct child
      return false;
    }

    if (idx === 0) {
      // already first
      return true;
    }

    // move to first position
    const recentId = children[idx];
    try {
      inst.move_node(recentId, parentNode.id, 0);
      inst.open_node(parentNode.id);
      return true;
    } catch (err) {
      console.error("ensureRecentIsFirstChild: move_node failed", err);
      return false;
    }
  }

  /**
   * ensureRecentFolderPlacement()
   * - High-level async function to:
   *    1) ensure "My Sites" exists (create if needed)
   *    2) ensure "Recent" exists under "My Sites" (create/move if needed)
   *    3) ensure "Recent" is the first child of "My Sites"
   *    4) persist tree if we made changes
   *
   * This is idempotent and safe to call after the tree is ready.
   */
  async ensureRecentFolderPlacement() {
    const inst = $("#links-tree").jstree(true);
    if (!inst) {
      console.warn(
        "ensureRecentFolderPlacement: jsTree instance not available",
      );
      return;
    }

    // 1. Get or create parent
    const parentNode = this.getOrCreateMySites();
    if (!parentNode) {
      console.warn(
        "ensureRecentFolderPlacement: could not get/create My Sites",
      );
      return;
    }

    // 2. Ensure Recent exists under it
    const beforeSnapshot = JSON.stringify(
      this.getTreeSnapshot($("#links-tree")),
    );

    const recentNode = this.ensureRecentExists(parentNode);
    if (!recentNode) {
      console.warn(
        "ensureRecentFolderPlacement: could not ensure Recent exists",
      );
      // still attempt persist if something else changed
    }

    // 3. Ensure first child
    this.ensureRecentIsFirstChild(parentNode);

    // 4. persist if tree changed
    const afterSnapshot = JSON.stringify(
      this.getTreeSnapshot($("#links-tree")),
    );
    if (beforeSnapshot !== afterSnapshot) {
      await this.persistTree();
    } else {
      // console.log("ensureRecentFolderPlacement: no changes needed");
    }
  }

  bindUIEvents() {
    // console.log("**********Binding UI events for export/import/collapse");
    const btnExport = document.getElementById("btn-export-tree");
    const btnImport = document.getElementById("btn-import-tree");
    const btnCollapse = document.getElementById("btn-collapse");
    const fileInput = document.getElementById("file-import-tree");

    if (!this._uiBound) {
      if (!btnExport?.dataset.bound) {
        btnExport.addEventListener("click", async () => {
          const snapshot = this.getTreeSnapshot($("#links-tree"));
          this.downloadJson("linksTree.json", snapshot);
        });
        btnExport.dataset.bound = "true";
      }

      if (!btnImport.dataset.bound) {
        btnImport.addEventListener("click", () => fileInput?.click());
        btnImport.dataset.bound = "true";
      }

      if (!btnCollapse?.dataset.bound) {
        btnCollapse.addEventListener("click", () => {
          $("#links-tree").jstree("close_all");
        });
        btnCollapse.dataset.bound = "true";
      }

      if (!fileInput?.dataset.bound) {
        fileInput.addEventListener("change", this.handleImport.bind(this));
        fileInput.dataset.bound = "true";
      }

      this._uiBound = true;
    }
  }

  async handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      let incoming = Array.isArray(parsed)
        ? parsed
        : parsed.linksTree || parsed.children || [];

      const normalized = this.normalizeRoot(incoming);

      await LinksTreeStorage.saveTree(normalized);

      location.reload();
    } catch (err) {
      alert("Import failed: " + (err?.message || err));
    } finally {
      e.target.value = "";
    }
  }

  downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

 bindCoreEvents() {
  if (this._coreEventsBound) return;

  console.log("Binding core jsTree events");

  const $tree = $("#links-tree");

  // ✅ remove ONLY our handlers
  $tree.off(".modLinksTree");

  const save = async () => {
    try {
      const snapshot = this.getTreeSnapshot($tree);
       await LinksTreeStorage.saveTree(snapshot);
    } catch (e) {
      console.error("Failed to save linksTree:", e);
    }
  };

  // ✅ namespace all events
  $tree
    .on("rename_node.jstree.modLinksTree", save)
    .on("delete_node.jstree.modLinksTree", save)
    .on("create_node.jstree.modLinksTree", save)
    .on("move_node.jstree.modLinksTree", save)
    .on("changed.jstree.modLinksTree", save);

  $tree.on(
    "select_node.jstree.modLinksTree",
    this.handleNodeSelect.bind(this)
  );

  $tree.on(
    "contextmenu.jstree.modLinksTree",
    this.handleContextMenu.bind(this)
  );

  $tree
    .on("mouseenter.modLinksTree", ".jstree-anchor", this.handleNodeHover.bind(this))
    .on("mousemove.modLinksTree", ".jstree-anchor", this.handleNodeMove.bind(this))
    .on("mouseleave.modLinksTree", ".jstree-anchor", this.handleNodeLeave.bind(this));

  this._coreEventsBound = true;
}

  async handleNodeSelect(e, data) {
    const node = data.node;
    console.count("Node click handler fired");
    // Ignore non-left click
    if (data.event && data.event.button !== 0) return;

    let url = node?.data?.url || node?.original?.url;

    if (!url) return;

    try {
      await this.addOrMoveRecent(url, node.text);
    } catch (err) {
      console.error("Recent update failed", err);
    }

    window.open(url, "_blank");
  }

  handleContextMenu(e) {
    console.log("Context menu triggered, suppressing next select");
    this.suppressNextSelect = true;

    setTimeout(() => {
      this.suppressNextSelect = false;
    }, 0);
  }

  handleNodeHover(e) {
    console.log("Node hover for tooltip:", e.currentTarget);
    const el = e.currentTarget;

    const inst = $("#links-tree").jstree(true);
    const node = inst.get_node(el);
    if (!node) return;

    // const { url = "", Notes: notes = "", Todo: todo = "" } = node.data || {};

    // const favicon = url
    //   ? `https://www.google.com/s2/favicons?domain=${url}&sz=32`
    //   : "";

//     const html = `
//     <div class="tooltip-card">
//       <div class="tooltip-header">
//         ${favicon ? `<img src="${favicon}" class="tooltip-favicon">` : ""}
//         <div>
//           <div>${node.text}</div>
//           ${url ? `<div>${url}</div>` : ""}
//         </div>
//       </div>
//       ${notes ? `<div>📝 ${notes}</div>` : ""}
//       ${todo ? `<div>✅ ${todo}</div>` : ""}
//     </div>
//   `;
    // console.log("Showing tooltip for node:", node);
    // console.log("Tooltip element:", tooltipManager.el);
//     if (!this._tippy && window.tippy) {
//     console.log("Initializing tippy tooltip");    
//     console.log("Tooltip content:", html);
//     window.tippy(el, {
//       content: html,
//       allowHTML: true,
//       placement: "right",
//     });
    
//   }

const tooltipContent = this.buildTooltipHTML(node);

tooltipManager.show(tooltipContent, e.clientX, e.clientY);

}

handleNodeMove(e) {
  console.log("Node mouse move, updating tooltip position");
  tooltipManager.move(e.clientX, e.clientY);
}

handleNodeLeave() {
  tooltipManager.hide();
}
buildTooltipHTML(node) {
  const { url = '', Notes: notes = '', Todo: todo = '' } = node.data || {};

  const favicon = url
    ? `https://www.google.com/s2/favicons?domain=${url}&sz=32`
    : '';

  return `
    <div class="tooltip-card">
      <div class="tooltip-header">
        ${favicon ? `<img src="${favicon}" width="16">` : ''}
        <strong>${node.text}</strong>
      </div>
      ${url ? `<div>${url}</div>` : ''}
      ${notes ? `<div>📝 ${notes}</div>` : ''}
      ${todo ? `<div>✅ ${todo}</div>` : ''}
    </div>
  `;
}
}
