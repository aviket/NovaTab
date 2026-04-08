export const STORAGE_KEYS = {
    LINKS_TREE: {
    key: "linksTree",
    storage: "local",
    default: {},   // or [] depending on your structure
  },
  SETTINGS: {
    key: "settings",
    storage: "sync",
    default: {},
  },
  NOTES: {
    key: "notes",
    storage: "local",
    default: {},
  },
  SHORTCUTS: {
    key: "shortcuts",
    storage: "local",
    default: [],
  }
};