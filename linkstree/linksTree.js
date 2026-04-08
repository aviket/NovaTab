const qs  = (sel, root = document) => root.querySelector(sel);

let suppressNextSelect = false;




// Pretty default title from URL host
function prettyTitleFromUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    return host.split('.').slice(0, -1).join('.') || host; // “github”, “mail.google”
  } catch { return url; }
}


async function addOrMoveRecent(url, title, maxEntries = 10) {
  if (!url) return null;
  // return early if domain contains "facebook" (case-insensitive)
  const urlObj = new URL(url);
  if (urlObj.hostname.includes("facebook")) {
    return null;
  }
  const inst = $('#links-tree').jstree(true);
  if (!inst) {
    console.warn('addOrMoveRecent: jsTree not available');
    return null;
  }

  // 1) Ensure "My Sites" exists (create if missing)
  const mySitesNode = getOrCreateMySites();
  console.log('addOrMoveRecent: My Sites node:', mySitesNode);
  if (!mySitesNode) {
    console.warn('addOrMoveRecent: could not get/create My Sites');
    return null;
  }

  // 2) Ensure "Recent" exists under "My Sites" and use that as the parent for new/updated entries.
  //    ensureRecentExists should return the Recent node (create/move it if needed).
  const recentNode = ensureRecentExists(mySitesNode);
  if (!recentNode) {
    console.warn('addOrMoveRecent: could not get/create Recent under My Sites');
    return null;
  }

  // Snapshot before changes so we persist only on actual change
  const beforeSnapshot = JSON.stringify(getTreeSnapshot($('#links-tree')));

  // 3) Look for an existing child under Recent that matches the URL
  const existing = findChildByUrl(recentNode, url);

  if (existing && existing.node) {
    // Update title if needed
    const node = existing.node;
    const currentText = (node.text || '').trim();
    if (title && title.trim() && currentText !== title.trim()) {
      inst.rename_node(node, title.trim());
    }
    // Move existing node to first position within Recent
    try {
      inst.move_node(existing.id, recentNode.id, 0);
    } catch (err) {
      console.error('addOrMoveRecent: move_node failed', err);
    }
    inst.open_node(recentNode.id);
  } else {
    // Create a new link node at index 0 under Recent
    const newNodeData = { text: title || prettyTitleFromUrl(url) || url, type: 'link', data: { url } };
    try {
      const newId = inst.create_node(recentNode.id, newNodeData, 0);
      if (!newId) {
        console.error('addOrMoveRecent: create_node returned falsy');
        return null;
      }
      inst.open_node(recentNode.id);
    } catch (err) {
      console.error('addOrMoveRecent: create_node failed', err);
      return null;
    }
  }

  // 4) Enforce maxEntries: remove children beyond maxEntries from Recent
  const updatedRecent = inst.get_node(recentNode.id); // refresh
  const children = Array.isArray(updatedRecent.children) ? updatedRecent.children.slice() : [];
  if (children.length > maxEntries) {
    const toRemove = children.slice(maxEntries);
    toRemove.forEach(cid => {
      try { inst.delete_node(cid); } catch (e) { /* ignore errors */ }
    });
  }

  // 5) Persist if tree changed
  const afterSnapshot = JSON.stringify(getTreeSnapshot($('#links-tree')));
  if (beforeSnapshot !== afterSnapshot) {
    await persistTree();
  }

  // Return the (now-first) child node under Recent
  const topChildId = inst.get_node(recentNode.id).children[0];
  return inst.get_node(topChildId);
}






/**
 * Small helper to avoid injecting raw HTML
 */
function escapeHTML(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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

function normalizeRoot(tree) {
  return Array.isArray(tree) ? tree : [];
}

async function loadJsonAsset(pathInExtension) {
  const url = chrome.runtime.getURL(pathInExtension);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${pathInExtension}: ${res.status}`);
  return res.json();
}

function getTreeSnapshot($tree) {
  const inst = $tree.jstree(true);

  // ✅ PURE JSON (safe for stringify + storage)
  return inst.get_json('#', {
    flat: false,
    no_id: false,
    no_data: false
  });
}

async function ensureRecentFolderPlacement() {
  const inst = $('#links-tree').jstree(true);
  if (!inst) {
    console.warn('ensureRecentFolderPlacement: jsTree instance not available');
    return;
  }

  // 1. Get or create parent
  const parentNode = getOrCreateMySites();
  if (!parentNode) {
    console.warn('ensureRecentFolderPlacement: could not get/create My Sites');
    return;
  }

  // 2. Ensure Recent exists under it
  const beforeSnapshot = JSON.stringify(getTreeSnapshot($('#links-tree')));

  const recentNode = ensureRecentExists(parentNode);
  if (!recentNode) {
    console.warn('ensureRecentFolderPlacement: could not ensure Recent exists');
    // still attempt persist if something else changed
  }

  // 3. Ensure first child
  ensureRecentIsFirstChild(parentNode);

  // 4. persist if tree changed
  const afterSnapshot = JSON.stringify(getTreeSnapshot($('#links-tree')));
  if (beforeSnapshot !== afterSnapshot) {
    await persistTree();
  } else {
    console.log('ensureRecentFolderPlacement: no changes needed');
  }
}



/**
 * persistTree()
 * - Persist current jstree snapshot to chrome.storage.local (same key used by the app).
 */
async function persistTree() {
  try {
    const snapshot = getTreeSnapshot($('#links-tree'));
    await chrome.storage.local.set({ linksTree: snapshot });
    console.log('persistTree: saved linksTree');
  } catch (err) {
    console.error('persistTree: failed to save linksTree', err);
  }
}

/**
 * isFolderNode(node)
 * - Small guard: treat anything that's not 'link' as a folder/root.
 */
function isFolderNode(node) {
  if (!node) return false;
  return node.type !== 'link';
}

/**
 * getOrCreateMySites()
 * - Find "My Sites" folder (case-insensitive). If missing, create it under the root.
 * - Returns the jsTree node object for "My Sites".
 */
function getOrCreateMySites() {
  const inst = $('#links-tree').jstree(true);
  if (!inst) return null;

  const found = findNodeByName('My Sites');
  if (found?.node) return found.node;

  // 🔥 ALWAYS create at root "#"
  const createdId = inst.create_node('#', {
    text: 'My Sites',
    type: 'folder'
  }, 'last');

  inst.open_node(createdId);
  return inst.get_node(createdId);
}
/**
 * ensureRecentExists(parentNode)
 * - Ensure a folder named "Recent" exists as a child of parentNode.
 * - If exists (anywhere), will move it under parentNode. If doesn't exist, creates it.
 * - Returns the jsTree node for Recent (or null on failure).
 */
function ensureRecentExists(parentNode) {
  const inst = $('#links-tree').jstree(true);
  if (!inst || !parentNode) return null;

  // Find any existing "Recent" anywhere
  const found = findNodeByName('Recent');

  if (found && found.node) {
    const recentNode = found.node;

    // If already a direct child of parentNode, simply return it
    if (recentNode.parent === parentNode.id) {
      return recentNode;
    }

    // Otherwise move it to be a child of parentNode (append)
    try {
      inst.move_node(recentNode.id, parentNode.id, 'last');
      // ensure parent is open so node is visible
      inst.open_node(parentNode.id);
      return inst.get_node(recentNode.id);
    } catch (err) {
      console.error('ensureRecentExists: failed moving existing Recent', err);
      return null;
    }
  }

  // Not found anywhere: create as folder under parentNode
  try {
    const newId = inst.create_node(parentNode.id, { text: 'Recent', type: 'folder' }, 'last');
    if (!newId) return null;
    inst.open_node(parentNode.id);
    return inst.get_node(newId);
  } catch (err) {
    console.error('ensureRecentExists: failed to create Recent node', err);
    return null;
  }
}

/**
 * ensureRecentIsFirstChild(parentNode)
 * - Moves the 'Recent' node to index 0 among parent's children.
 * - Returns true if a change was made (or already first).
 */
function ensureRecentIsFirstChild(parentNode) {
  const inst = $('#links-tree').jstree(true);
  if (!inst || !parentNode) return false;

  const children = Array.isArray(parentNode.children) ? parentNode.children.slice() : [];
  if (!children.length) return false;

  // find child whose text === 'Recent' (case-insensitive)
  const idx = children.findIndex(cid => {
    const n = inst.get_node(cid);
    return n && typeof n.text === 'string' && n.text.trim().toLowerCase() === 'recent';
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
    console.error('ensureRecentIsFirstChild: move_node failed', err);
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
async function ensureRecentFolderPlacement() {
  const inst = $('#links-tree').jstree(true);
  if (!inst) {
    console.warn('ensureRecentFolderPlacement: jsTree instance not available');
    return;
  }

  // 1. Get or create parent
  const parentNode = getOrCreateMySites();
  if (!parentNode) {
    console.warn('ensureRecentFolderPlacement: could not get/create My Sites');
    return;
  }

  // 2. Ensure Recent exists under it
  const beforeSnapshot = JSON.stringify(getTreeSnapshot($('#links-tree')));

  const recentNode = ensureRecentExists(parentNode);
  if (!recentNode) {
    console.warn('ensureRecentFolderPlacement: could not ensure Recent exists');
    // still attempt persist if something else changed
  }

  // 3. Ensure first child
  ensureRecentIsFirstChild(parentNode);

  // 4. persist if tree changed
  const afterSnapshot = JSON.stringify(getTreeSnapshot($('#links-tree')));
  if (beforeSnapshot !== afterSnapshot) {
    await persistTree();
  } else {
    console.log('ensureRecentFolderPlacement: no changes needed');
  }
}


$('#links-tree').on('contextmenu.jstree', function (e) {
  // console.log(e);

  
  // console.log('Context menu opened');
  suppressNextSelect = true;

  // reset shortly after (covers all browsers)
  setTimeout(() => {
    suppressNextSelect = false;
  }, 0);
});

let mouseX = 0;
let mouseY = 0;

$(document).on('mousemove', function (e) {
  mouseX = e.pageX;
  mouseY = e.pageY;
});

let tooltipEl = null;




$('#links-tree').on('mouseenter', '.jstree-anchor', function () {
  if (this._tippy) return;

  const inst = $('#links-tree').jstree(true);
  const node = inst.get_node(this);
  if (!node) return;

  const { url = '', Notes: notes = '', Todo: todo = '' } = node.data || {};

  // 🔥 favicon (Google service)
  const favicon = url 
    ? `https://www.google.com/s2/favicons?domain=${url}&sz=32`
    : '';

  const html = `
    <div class="tooltip-card">
      
      <div class="tooltip-header">
        ${favicon ? `<img src="${favicon}" class="tooltip-favicon">` : ''}
        <div class="tooltip-title-wrap">
          <div class="tooltip-title">${node.text}</div>
          ${url ? `<div class="tooltip-url">${url}</div>` : ''}
        </div>
      </div>

      ${notes ? `<div class="tooltip-section">📝 ${notes  .replace(/\n/g, '<br>')}</div>` : ''}
      ${todo ? `<div class="tooltip-section">✅ ${todo}</div>` : ''}

    </div>
  `;

  tippy(this, {
    content: html,
    allowHTML: true,
    theme: 'light-border',
    placement: 'right',
    delay: [300, 0],
    maxWidth: 350,
  });
});


async function initLinksTree() {
  // 1) Try storage
  const { linksTree } = await chrome.storage.local.get(['linksTree']);

  let seed;
  if (Array.isArray(linksTree) && linksTree.length) {
    seed = linksTree;
  } else {
    // 2) Fall back to data.json
    try {
      const data = await loadJsonAsset('assets/data.json');
      seed = data.linksTree && data.linksTree.length ? data.linksTree : [];
    } catch (e) {
      console.error('Could not load data.json:', e);
      seed = []; // last-resort empty
    }
  }

  // Normalize and init jsTree
  const treeData = normalizeRoot(seed);
  console.log('Initializing links tree with data:', treeData);
  const $tree = $('#links-tree').jstree({
    core: {
      data: treeData,
      check_callback: true,   // allow create/rename/move/delete
      multiple: true
    },
    plugins: ['dnd', 'contextmenu', 'wholerow', 'types' , "search"],
    types: {
      root: { icon: 'jstree-folder' , valid_children: ['folder', 'link'] },
      link: { icon: 'jstree-file', valid_children: [] },
      folder: { icon: 'jstree-folder', valid_children: ['folder', 'link'] },
      default: { icon: 'jstree-folder' }
    },
    contextmenu: {
      items: function (node) {
        const inst = $('#links-tree').jstree(true);
        const t = inst.get_type(node);           // 'folder', 'link', 'root', etc.
        console.log('Context menu for node type:', t);
        const canAddChild = (t === 'folder' || t === 'root');
        

        const base = {
          rename:   { label: 'Rename', action: () => inst.edit(node) },
          remove:   { label: 'Delete', action: () => inst.delete_node(node) },
          newFolder: {
            label: 'New Folder',
            _disabled: !canAddChild,             // disable if not a folder/root
            action: () =>
              inst.create_node(node, { text: 'New Folder', type: 'folder' }, 'last', (n) => inst.edit(n))
          },
      newLink: {
        label: 'New Link',
        _disabled: !canAddChild,
        action: () => {
          let url = window.prompt('Enter URL (include https://)', 'https://');
          if (!url) return;
          url = url.trim();
          if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

          const inst = $('#links-tree').jstree(true);

          // ensure parent is open, then create + edit
          inst.open_node(node, () => {
            const n = inst.create_node(
              node,
              { text: prettyTitleFromUrl(url), type: 'link', data: { url } },
              'last'
            );

            // give jsTree a tick to paint the node, then start rename
            setTimeout(() => inst.edit(n), 0);
          });
        }
      },


      editUrl: {   // ✅ NEW ITEM
        label: 'Edit URL',
        _disabled: node.type !== 'link',   // only enable for link nodes
        action: () => {
          const currentUrl = node.data?.url || 'https://';
          const newUrl = prompt('Enter new URL:', currentUrl);
          if (newUrl) {
            node.data = node.data || {};
            node.data.url = newUrl;
            inst.redraw_node(node); // refresh to reflect possible changes
          }
        }
      },

      editNotes: {
  label: 'Edit Notes',
action: () => {
  node.data = node.data || {};

  const current = node.data.Notes || '';

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
  `).appendTo('body');

  $('#save-note').on('click', () => {
    node.data.Notes = $('#note-input').val();
    $('#links-tree').jstree(true).redraw_node(node);
    persistTree(); // save changes immediately
    modal.remove();
  });

  $('#cancel-note').on('click', () => modal.remove());
}
},





        };
        return base;
      }
    }

  });
  console.log('jsTree initialized on #links-tree');
  // Prepare a promise that resolves when jsTree signals ready (or after a short fallback timeout)
  const readyPromise = new Promise((resolve) => {
    // Resolve with the instance when ready.jstree fires
    $tree.on('ready.jstree', (_e, data) => {
      resolve(data?.instance || $('#links-tree').jstree(true));
    });
    console.log('Waiting for jsTree to be ready...');
    // Fallback: resolve after 2s to avoid hanging consumers in rare cases
    setTimeout(() => resolve($('#links-tree').jstree(true)), 2000);
  });
  console.log('jsTree initialization continues while waiting for ready...');
  // 3) Persist any change back to storage
  const save = async () => {
    try {
      const snapshot = getTreeSnapshot($('#links-tree'));
      await chrome.storage.local.set({ linksTree: snapshot });
    } catch (e) {
      console.error('Failed to save linksTree:', e);
    }
  };
  console.log('Attached event listeners for jsTree changes');
    // === Export / Import ===
  const btnExport = document.getElementById('btn-export-tree');
  const btnImport = document.getElementById('btn-import-tree');
  const btnCollapse = document.getElementById('btn-collapse');
  const fileInput = document.getElementById('file-import-tree');
  console.log('Export/Import buttons and file input:', { btnExport, btnImport, btnCollapse, fileInput });
  function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  console.log('Defined downloadJson helper function');
  // Export: dump current tree JSON (including the root wrapper)
  btnExport?.addEventListener('click', async () => {
    const snapshot = getTreeSnapshot($('#links-tree'));
    downloadJson('linksTree.json', snapshot);
  });
  console.log('Attached export button listener');
  // Import: choose file, parse, store, and reload UI
  btnImport?.addEventListener('click', () => fileInput?.click());
  console.log('Attached import button listener');
  btnCollapse?.addEventListener('click', () => {
    console.log('Collapsing all nodes in the tree');
    $('#links-tree').jstree('close_all');
  });
  console.log('Attached collapse button listener');
  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // Accept either a full snapshot (array with "root" first) or just children
      let incoming = Array.isArray(parsed) ? parsed : (parsed.linksTree || parsed.children || []);
      const normalized = normalizeRoot(incoming);

      // Save to storage – the app already uses this key
      await chrome.storage.local.set({ linksTree: normalized });

      // Easiest + cleanest: reload the page to rebuild jsTree + listeners
      location.reload();
    } catch (err) {
      alert('Import failed: ' + (err?.message || err));
    } finally {
      // let the same file be chosen again if needed
      e.target.value = '';
    }
  });

  console.log('Attached file input change listener for import');
  $('#links-tree')
    .on('rename_node.jstree', save)
    .on('delete_node.jstree', save)
    .on('create_node.jstree', save)
    .on('move_node.jstree', save)
    .on('changed.jstree', save);

  // 4) On very first run (no storage), store the seeded tree so future opens are fast
  if (!linksTree || !linksTree.length) {
    try {
      await chrome.storage.local.set({ linksTree: treeData });
    } catch (e) {
      console.warn('Could not persist initial seed to storage:', e);
    }
  }
  console.log('Attached jsTree event listeners for changes to persist to storage'); 
  // Inside initLinksTree (newtab.js)
  $('#tree-search').on('input', function () {
    const v = $(this).val();
    $('#links-tree').jstree('close_all');
    $('#links-tree').jstree(true).search(v);
  });
  console.log('Attached search input listener for tree search');
  // Once the tree is built, collapse everything
  $tree.on('ready.jstree', (e, data) => {
    const inst = data.instance;
    console.log(data);
    // Collapse everything first
    inst.close_all();
    inst.deselect_all(true);

    // Open ancestors of every LINK node whose text starts with "**"
    inst.get_json('#', { flat: true }).forEach(n => {
      const node = inst.get_node(n.id);
      if (node && node.type === 'link' && typeof node.text === 'string' && node.text.trim().startsWith('**')) {
        node.parents.forEach(pid => { if (pid !== '#') inst.open_node(pid); });
      }
    });
  });


  // 5) Optional: handle link activation (open in current tab)
  //   $('#links-tree').on('activate_node.jstree', function (_e, data) {
  //     const node = data.node;
  //     const url = node?.data?.url;
  //     if (url && typeof url === 'string') {
  //       // open in same tab
  //       window.location.href = url;
  //     }
  //   });


  $('#links-tree')
    .on('select_node.jstree', async function (e, data) {
      const node = data.node;
      
      console.log("***data logged above*** ");
      if (data.event && data.event.button !== undefined && data.event.button !== 0) {
        console.log('Non-left click ignored');
        return;
      }
      // console.log('Selected node:', node.data);
      
      // If node has a URL stored in its "a_attr.href" or custom data
      let url = null;

      if (node.data && node.data.url) {
        url = node.data.url;
      } else if (node.original && node.original.url) {
        url = node.original.url;
      }

        // 🚫 Also ignore non-left mouse buttons (safety)
  // if (data.event && data.event.button !== undefined && data.event.button !== 0) {
  //   console.log('Non-left click ignored');
  //   return;
  // }

      if (url) {
          // Update recent BEFORE opening (so duplicate/move logic runs)
        try {
          await addOrMoveRecent(url, node.text || prettyTitleFromUrl(url));
            } catch (err) {
          console.error('Failed to update Recent from tree select', err);
          }
        // open in new tab
        window.open(url, '_blank');
      }
    });

  // wait till jsTree reports ready (or fallback timeout) before returning
  await readyPromise;

    // --- ensure Recent folder placement as required ---
  try {
    await ensureRecentFolderPlacement();
  } catch (err) {
    console.error('ensureRecentFolderPlacement failed', err);
  }

  // return the jstree instance for convenience to callers
  return $('#links-tree').jstree(true);
}

// -------------------- Recent list management --------------------

/**
 * normalizeUrlForComparison(url)
 * - Return a canonical string for comparing URLs (drops trailing slash,
 *   lowercases hostname, keeps pathname+search+hash).
 * - If input is not a full URL, attempts to add https:// and normalize.
 */
function normalizeUrlForComparison(raw) {
  try {
    let u;
    if (/^https?:\/\//i.test(raw)) {
      u = new URL(raw);
    } else {
      // assume https for normalization
      u = new URL('https://' + raw);
    }
    // Remove default port if present
    if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) {
      u.port = '';
    }
    // Normalize: lowercase host, remove trailing slash on pathname (unless root)
    const host = u.hostname.toLowerCase();
    let pathname = u.pathname || '/';
    if (pathname !== '/' && pathname.endsWith('/')) pathname = pathname.replace(/\/+$/, '');
    // Keep search and hash as-is
    return `${u.protocol}//${host}${u.port ? ':' + u.port : ''}${pathname}${u.search}${u.hash}`;
  } catch (err) {
    // If URL parsing fails, fallback to raw trimmed
    return String(raw).trim();
  }
}

/**
 * findChildByUrl(parentNode, url)
 * - returns { node, id, idx } for a direct child of parentNode whose .data.url
 *   matches the normalized url, or null if none.
 */
function findChildByUrl(parentNode, url) {
  const inst = $('#links-tree').jstree(true);
  if (!inst || !parentNode || !Array.isArray(parentNode.children)) return null;
  const norm = normalizeUrlForComparison(url);
  for (let i = 0; i < parentNode.children.length; ++i) {
    const cid = parentNode.children[i];
    const n = inst.get_node(cid);
    if (!n) continue;
    const candidateUrl = (n.data && n.data.url) || (n.original && n.original.url) || '';
    if (candidateUrl && normalizeUrlForComparison(candidateUrl) === norm) {
      return { node: n, id: cid, idx: i };
    }
  }
  return null;
}

function findNodeByName(name) {
  if (!name) return null;
  const inst = $('#links-tree').jstree(true);
  if (!inst) return null;
  console.log(`Searching for node by name: "${name}"`);
  const needle = String(name).trim().toLowerCase();
  const flat = inst.get_json('#', { flat: true }) || [];
  console.log(`Total nodes to scan: ${flat.length}`);
  const match = flat.find(n => (String(n.text || '').trim().toLowerCase() === needle));
  if (!match) return null;
  console.log(`Found matching node ID: ${match.id} (type: ${match.type})`);
  const full = inst.get_node(match.id);
  console.log('Full node object:', full);
  return {
    node: full,
    type: (match.type === 'link') ? 'link' : 'node'
  };
}
