// utilities/notify/builder.js
export function buildOptions(config) {
  const options = {
    type: config.type || "basic",
    iconUrl: config.iconUrl || "assets/icons/icon32.png",
    title: config.title || "",
    message: config.message || "",
    priority: config.priority ?? 0,
    requireInteraction: config.requireInteraction || false,
    silent: config.silent || false,
  };

  switch (config.type) {
    case "image":
      if (config.imageUrl) options.imageUrl = config.imageUrl;
      break;

    case "list":
      if (config.items) options.items = config.items;
      break;

    case "progress":
      options.progress = config.progress || 0;
      break;
  }

  if (config.buttons) {
    options.buttons = config.buttons.map((b) => ({
      title: b.title,
      iconUrl: b.iconUrl,
    }));
  }

  return options;
}
