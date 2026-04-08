import { STORAGE_KEYS } from "./storageRegistry.js";

export class StorageManager {

  static async get(alias) {
    const config = STORAGE_KEYS[alias];
    const storage = chrome.storage[config.storage];

    const result = await storage.get([config.key]);
    return result[config.key] ?? config.default;
  }

  static async set(alias, value) {
    const config = STORAGE_KEYS[alias];
    const storage = chrome.storage[config.storage];

    await storage.set({ [config.key]: value });
  }

  static async update(alias, updater) {
    const current = await this.get(alias);
    const updated = updater(current);
    await this.set(alias, updated);
  }

  static async remove(alias) {
    const config = STORAGE_KEYS[alias];
    const storage = chrome.storage[config.storage];

    await storage.remove([config.key]);
  }
}