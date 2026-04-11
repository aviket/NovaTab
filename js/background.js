// js/background.js
// background.js — prefer tab.url, fallback to changeInfo; match by substring
// console.log('background.js loaded', { ts: Date.now() });

// const NEWTAB_MARKER = 'avinash_new_tab'; // substring matcher

// marker used earlier
// const NEWTAB_MARKER = 'avinash_new_tab';

function getAlltabTitles(tabs) {
  // Return array of tab titles (non-empty)

  return (tabs || []).map((t) => [t.title, t.id]);
}

function handlePossibleNewTabDuplicate(tabId, changeInfo = {}, tab = {}) {
  try {
    // Prefer tab.url in logs to see the actual string reported by Chrome
    // console.log('handlePossibleNewTabDuplicate', { tabId, tabUrl: tab?.url, changeInfo });

    if (!looksLikeNewTab(tab, changeInfo)) {
      // console.log('not our newtab (no marker yet)', tabId, { tabUrl: tab?.url });
      return;
    }

    // Query all tabs and match by substring for robustness
    chrome.tabs.query({}, (tabs) => {
      const matches = (tabs || []).filter((t) => {
        const u = t.url || "";
        return typeof u === "string" && u.includes(NEWTAB_MARKER);
      });

      // console.log('matches for newtab', matches.map(m => ({ id: m.id, url: m.url, windowId: m.windowId })));

      if (matches.length <= 1) return;

      // Keep one (smallest id), remove others
      matches.sort((a, b) => a.id - b.id);
      const keeper = matches[0];
      const duplicates = matches.slice(1);

      // console.log('keeper', { id: keeper.id, url: keeper.url });
      // console.log('duplicates', duplicates.map(d => ({ id: d.id, url: d.url })));

      chrome.windows.update(keeper.windowId, { focused: true }, () => {
        chrome.tabs.update(keeper.id, { active: true }, () => {
          duplicates.forEach((d) => {
            if (d.id === keeper.id) return;
            // If you want activation-only during testing, comment out the next line
            chrome.tabs.remove(d.id, () => {
              if (chrome.runtime.lastError) {
                console.warn(
                  "tabs.remove error",
                  chrome.runtime.lastError.message,
                );
              } else {
                // console.log('removed duplicate', d.id);
              }
            });
          });
        });
      });
    });
  } catch (err) {
    console.error("error in handler", err);
  }
}

async function listAllTabs() {
  const tabs = await chrome.tabs.query({});
  return tabs;
}

// Listeners
// chrome.tabs.onCreated.addListener((tab) => {
//   console.log('onCreated', { id: tab.id, url: tab.url });
//   // handlePossibleNewTabDuplicate(tab.id, {}, tab);
//   listAllTabs.then(tabs => {
//     tabTitles = getAlltabTitles(tabs);

//     console.log('all tab titles:', tabTitles);
//   });
// });

// keep your marker and expected title
const NEWTAB_MARKER = "newtab.html"; // substring to identify our newtab URL, used in onUpdated checks
const EXPECTED_TITLE_SUBSTR = "NovaTab"; // used for title-based checks

/**
 * Decide if this onUpdated event is about a new-tab page we control.
 * Conservative — returns true only when it's very likely the "My Local New Tab" page.
 */
function looksLikeNewTab(tab = {}, changeInfo = {}) {
  // defensive guards
  const tabUrl = typeof tab.url === "string" ? tab.url : "";
  const tabTitle = typeof tab.title === "string" ? tab.title : "";
  const changeTitle =
    typeof changeInfo.title === "string" ? changeInfo.title : "";
  const changeUrl = typeof changeInfo.url === "string" ? changeInfo.url : "";

  // 1) If URL explicitly contains our marker (robust)
  if (changeUrl.includes(NEWTAB_MARKER) || tabUrl.includes(NEWTAB_MARKER)) {
    return true;
  }

  // 2) chrome://newtab sometimes shows instead of extension URL — require title match too
  if (
    tabUrl.startsWith("chrome://newtab") ||
    changeUrl.startsWith("chrome://newtab")
  ) {
    if (
      tabTitle.includes(EXPECTED_TITLE_SUBSTR) ||
      changeTitle.includes(EXPECTED_TITLE_SUBSTR)
    ) {
      return true;
    }
    return false;
  }

  // 3) If the title changed to something that matches our page title exactly / mostly,
  //    that's a strong signal (but don't act on other title-only changes unless they match).
  if (changeTitle && changeTitle.includes(EXPECTED_TITLE_SUBSTR)) {
    return true;
  }

  // 4) If the tab's title already matches our expected title and the tab is loading/complete
  //    but there was no url/title change in changeInfo, treat conservatively: only allow
  //    when changeInfo.url or changeInfo.title exists — otherwise it's a random update.
  if (
    tabTitle &&
    tabTitle.includes(EXPECTED_TITLE_SUBSTR) &&
    (changeInfo.url || changeInfo.title)
  ) {
    return true;
  }

  // otherwise: not a new-tab opening
  return false;
}

/**
 * onUpdated — only act when a new new-tab page is opening.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  try {
    // console.log('onUpdated', { tabId, changeInfo, tabUrl: tab?.url, tabTitle: tab?.title });

    // Only proceed when the update looks like our new-tab is being opened/changed
    if (!looksLikeNewTab(tab, changeInfo)) {
      // ignoring regular navigations / title updates from other sites
      // console.log('onUpdated ignored — not a new-tab event');
      return;
    }

    // At this point it's likely a new-tab page opened — find all new-tab pages and dedupe/pin/activate.
    getTabsByTitle(/NovaTab/i)
      .then((newtabs) => {
        // console.log('candidate new-tab pages:', newtabs.map(t => ({ id: t.id, title: t.title, windowId: t.windowId, pinned: t.pinned })));
        // keep-first + pin + activate (your existing function handles pin+activate+remove)
        closeDuplicateTabs(newtabs)
          .then((res) => {
            // console.log('closeDuplicateTabs result:', res);
          })
          .catch((err) => {
            // console.error('closeDuplicateTabs failed:', err);
          });
      })
      .catch((err) => {
        // console.error('getTabsByTitle failed:', err);
      });
  } catch (err) {
    // console.error('onUpdated handler error', err);
  }
});

/**
 * Helper: get a tab by id
 * @param {number} tabId
 * @returns {Promise<chrome.tabs.Tab>}
 */
function getTabById(tabId) {
  return new Promise((resolve, reject) => {
    if (typeof tabId !== "number") {
      return reject(new Error("getTabById: tabId must be a number"));
    }
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        return reject(
          new Error(
            "chrome.tabs.get error: " + chrome.runtime.lastError.message,
          ),
        );
      }
      resolve(tab);
    });
  });
}

/**
 * Helper: get all tabs whose title matches a RegExp pattern
 * If you pass a string, it's converted to a RegExp (plain substring match).
 * @param {RegExp|string} pattern
 * @param {Object} [queryOpts] optional chrome.tabs.query options (e.g. {windowId})
 * @returns {Promise<chrome.tabs.Tab[]>}
 */
function getTabsByTitle(pattern, queryOpts = {}) {
  const rx =
    pattern instanceof RegExp ? pattern : new RegExp(String(pattern), "i"); // case-insensitive by default
  return new Promise((resolve, reject) => {
    chrome.tabs.query(queryOpts, (tabs) => {
      if (chrome.runtime.lastError) {
        return reject(
          new Error(
            "chrome.tabs.query error: " + chrome.runtime.lastError.message,
          ),
        );
      }
      const matches = (tabs || []).filter((t) => {
        // Some tabs may not expose a title (about:blank, chrome:// pages), guard for that
        const title = typeof t.title === "string" ? t.title : "";
        return rx.test(title);
      });
      resolve(matches);
    });
  });
}

/**
 * Helper: pin or unpin a tab
 * @param {number} tabId
 * @param {boolean} pinned true => pin, false => unpin
 * @returns {Promise<chrome.tabs.Tab>} resolves to updated tab
 */
function setTabPinned(tabId, pinned = true) {
  return new Promise((resolve, reject) => {
    if (typeof tabId !== "number") {
      return reject(new Error("setTabPinned: tabId must be a number"));
    }
    chrome.tabs.update(tabId, { pinned }, (tab) => {
      if (chrome.runtime.lastError) {
        return reject(
          new Error(
            "chrome.tabs.update error: " + chrome.runtime.lastError.message,
          ),
        );
      }
      resolve(tab);
    });
  });
}

/**
 * Close duplicate tabs, keep the first one, pin & activate the keeper.
 * Accepts:
 *  - Array of chrome.tabs.Tab objects
 *  - Array of [title, id] tuples
 *  - Array of numeric ids
 *
 * Returns a Promise resolving to { keeper: Tab|null, removed: number[], pinned: boolean, activated: boolean }
 */
async function closeDuplicateTabs(tabsArr = []) {
  // helper to extract numeric id when input item is [title, id] or number
  const extractId = (item) => {
    if (!item) return null;
    if (Array.isArray(item) && item.length >= 2) return Number(item[1]);
    if (typeof item === "number") return item;
    if (typeof item === "string" && /^\d+$/.test(item)) return Number(item);
    if (typeof item === "object" && item.id !== undefined)
      return Number(item.id);
    return null;
  };

  // Normalize: gather full Tab objects for each item (if already Tab, keep as-is)
  const tabPromises = (tabsArr || []).map((item) => {
    // if it's a tab-like object already with .id and .url (best-effort)
    if (
      item &&
      typeof item === "object" &&
      item.id !== undefined &&
      item.windowId !== undefined
    ) {
      return Promise.resolve(item);
    }
    const id = extractId(item);
    if (!Number.isFinite(id)) return Promise.resolve(null);
    // fetch tab by id
    return new Promise((resolve) => {
      chrome.tabs.get(id, (tab) => {
        if (chrome.runtime.lastError) {
          console.warn(
            "closeDuplicateTabs: chrome.tabs.get failed for id",
            id,
            chrome.runtime.lastError.message,
          );
          return resolve(null);
        }
        resolve(tab);
      });
    });
  });

  const tabsResolved = (await Promise.all(tabPromises)).filter(Boolean);
  if (!Array.isArray(tabsResolved) || tabsResolved.length === 0) {
    return { keeper: null, removed: [], pinned: false, activated: false };
  }
  if (tabsResolved.length === 1) {
    // nothing to close, but ensure pin+activate as requested
    const keeperTab = tabsResolved[0];
    try {
      await ensurePinAndActivate(keeperTab);
      return { keeper: keeperTab, removed: [], pinned: true, activated: true };
    } catch (err) {
      return {
        keeper: keeperTab,
        removed: [],
        pinned: keeperTab.pinned,
        activated: !!keeperTab.active,
      };
    }
  }

  // Keeper = first in array (preserves original caller order)
  const keeper = tabsResolved[0];
  const duplicates = tabsResolved.slice(1);
  const duplicatesIds = duplicates.map((t) => t.id).filter(Number.isFinite);

  // 1) Pin keeper if not pinned
  let pinned = keeper.pinned === true;
  try {
    if (!pinned) {
      await new Promise((resolve) => {
        chrome.tabs.update(keeper.id, { pinned: true }, (updated) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "closeDuplicateTabs: failed to pin keeper",
              chrome.runtime.lastError.message,
            );
            return resolve(null);
          }
          pinned = !!updated?.pinned;
          // console.log('closeDuplicateTabs: keeper pinned ->', pinned, 'tabId=', keeper.id);
          resolve(updated);
        });
      });
    } else {
      // console.log('closeDuplicateTabs: keeper already pinned', keeper.id);
    }
  } catch (err) {
    console.warn("closeDuplicateTabs: pin step threw", err);
  }

  // 2) Focus the keeper's window
  let windowFocused = false;
  try {
    await new Promise((resolve) => {
      chrome.windows.update(keeper.windowId, { focused: true }, (win) => {
        if (chrome.runtime.lastError) {
          console.warn(
            "closeDuplicateTabs: windows.update failed",
            chrome.runtime.lastError.message,
          );
          return resolve(null);
        }
        windowFocused = true;
        // console.log('closeDuplicateTabs: focused window', keeper.windowId);
        resolve(win);
      });
    });
  } catch (err) {
    console.warn("closeDuplicateTabs: window focus step threw", err);
  }

  // 3) Activate keeper tab in its window
  let activated = false;
  try {
    await new Promise((resolve) => {
      chrome.tabs.update(keeper.id, { active: true }, (tab) => {
        if (chrome.runtime.lastError) {
          console.warn(
            "closeDuplicateTabs: tabs.update(active) failed",
            chrome.runtime.lastError.message,
          );
          return resolve(null);
        }
        activated = !!tab?.active;
        // console.log('closeDuplicateTabs: activated keeper tab', keeper.id);
        resolve(tab);
      });
    });
  } catch (err) {
    console.warn("closeDuplicateTabs: activate step threw", err);
  }

  // 4) Remove duplicates
  let removed = [];
  try {
    if (duplicatesIds.length) {
      await new Promise((resolve) => {
        chrome.tabs.remove(duplicatesIds, () => {
          if (chrome.runtime.lastError) {
            console.warn(
              "closeDuplicateTabs: tabs.remove error",
              chrome.runtime.lastError.message,
            );
            // we still treat as attempted
            removed = duplicatesIds;
            return resolve(null);
          }
          removed = duplicatesIds;
          // console.log('closeDuplicateTabs: removed duplicates', removed);
          resolve(null);
        });
      });
    }
  } catch (err) {
    console.warn("closeDuplicateTabs: remove step threw", err);
  }

  return { keeper, removed, pinned, activated };
}

/**
 * Small helper used above if you want to pin+activate a single tab separately.
 * (keeps code tidy in the main function)
 */
async function ensurePinAndActivate(tab) {
  if (!tab || !tab.id) return;
  // pin if needed
  if (!tab.pinned) {
    await new Promise((resolve) =>
      chrome.tabs.update(tab.id, { pinned: true }, () => resolve()),
    );
  }
  // focus window then activate
  await new Promise((resolve) =>
    chrome.windows.update(tab.windowId, { focused: true }, () => resolve()),
  );
  await new Promise((resolve) =>
    chrome.tabs.update(tab.id, { active: true }, () => resolve()),
  );
}

// js/background.js

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_SIDE_PANEL") {
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
  }
});
