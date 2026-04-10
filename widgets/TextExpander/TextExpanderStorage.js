// linksTreeStorage.js

import { StorageManager } from "../../utilities/StorageUtils/storageManager.js";

export const TextExpanderStorage = {

  async getTextExpander() {
    return await StorageManager.get("TEXT_EXPANDER");
  },

  async saveTextExpander(textExpander) {
    return await StorageManager.set("TEXT_EXPANDER", textExpander);
  },

  async updateTextExpander(updater) {
    return await StorageManager.update("TEXT_EXPANDER", updater);
  }
};