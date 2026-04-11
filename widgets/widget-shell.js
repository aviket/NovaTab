// widgets/widget-shell.js
export function createWidgetShell({ id, title, content }) {
  const wrapper = document.createElement("div");
  wrapper.className = "widget";
  wrapper.dataset.id = id;

  wrapper.innerHTML = `
        <div class="widget-header">
            <span class="widget-title">${title}</span>
            <div class="widget-controls">
                 <button class="maximize-btn">⛶</button>
                 <button class="remove-btn">✕</button>
            </div>
        </div>
        <div class="widget-body">
            <div class="widget-content"></div>
        </div>
    `;

  const contentContainer = wrapper.querySelector(".widget-content");
  contentContainer.appendChild(content);

  // Remove logic
  wrapper.querySelector(".remove-btn").onclick = () => {
    wrapper.remove();
  };

  // 🔥 Maximize logic
  const maximizeBtn = wrapper.querySelector(".maximize-btn");

  maximizeBtn.onclick = () => {
    wrapper.classList.toggle("maximized");

    // Change icon
    maximizeBtn.textContent = wrapper.classList.contains("maximized")
      ? "🗗"
      : "⛶";
  };

  return wrapper;
}
