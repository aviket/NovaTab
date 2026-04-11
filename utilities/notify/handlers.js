// utilities/notify/handlers.js
export function registerHandlers(handlerMap) {
  chrome.notifications.onClicked.addListener((id) => {
    const h = handlerMap.get(id);
    if (h?.onClick) h.onClick();
  });

  chrome.notifications.onButtonClicked.addListener((id, btnIndex) => {
    const h = handlerMap.get(id);
    const btn = h?.buttons?.[btnIndex];

    if (btn?.onClick) {
      btn.onClick(btnIndex);
    }
  });

  chrome.notifications.onClosed.addListener((id) => {
    handlerMap.delete(id);
  });
}
