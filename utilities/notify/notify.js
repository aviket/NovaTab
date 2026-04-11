// utilities/notify/notify.js
import { buildOptions } from "./builder.js";
import { registerHandlers } from "./handlers.js";

class Notify {
  constructor() {
    this.handlers = new Map();
    registerHandlers(this.handlers);
  }

  create(config) {
    const id = config.id || `ntf_${Date.now()}`;

    const options = buildOptions(config);

    chrome.notifications.create(id, options);

    this.handlers.set(id, {
      onClick: config.onClick,
      onButtonClick: config.onButtonClick,
      buttons: config.buttons,
    });

    return id;
  }

  clear(id) {
    chrome.notifications.clear(id);
    this.handlers.delete(id);
  }
}

export const notify = new Notify();
