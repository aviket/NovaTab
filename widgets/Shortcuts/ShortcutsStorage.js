// linksTreeStorage.js

import { StorageManager } from "../../utilities/StorageUtils/storageManager.js";

export const ShortcutsStorage = {
  async getShortcuts() {
    return await StorageManager.get("SHORTCUTS");
  },

  async saveShortcuts(shortcuts) {
    return await StorageManager.set("SHORTCUTS", shortcuts);
  },

  async updateShortcuts(updater) {
    return await StorageManager.update("SHORTCUTS", updater);
  },
};
