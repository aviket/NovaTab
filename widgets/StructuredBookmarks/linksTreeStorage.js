// linksTreeStorage.js

import { StorageManager } from "../../utilities/StorageUtils/storageManager.js";

export const LinksTreeStorage = {
  async getTree() {
    return await StorageManager.get("LINKS_TREE");
  },

  async saveTree(tree) {
    return await StorageManager.set("LINKS_TREE", tree);
  },

  async updateTree(updater) {
    return await StorageManager.update("LINKS_TREE", updater);
  },
};
