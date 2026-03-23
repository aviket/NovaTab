export function createWidgetShell({ id, title, content }) {
    const wrapper = document.createElement("div");
    wrapper.className = "widget";
    wrapper.dataset.id = id;

    wrapper.innerHTML = `
        <div class="widget-header">
            <span class="widget-title">${title}</span>
            <div class="widget-controls">
                <button class="toggle-btn">▾</button>
                <button class="remove-btn">✕</button>
            </div>
        </div>
        <div class="widget-body">
            <div class="widget-content"></div>
        </div>
    `;

    const contentContainer = wrapper.querySelector(".widget-content");
    contentContainer.appendChild(content);

    // Collapse logic
    const toggleBtn = wrapper.querySelector(".toggle-btn");
    const body = wrapper.querySelector(".widget-body");

    toggleBtn.onclick = () => {
        body.classList.toggle("collapsed");
    };

    // Remove logic
    wrapper.querySelector(".remove-btn").onclick = () => {
        wrapper.remove();
    };

    return wrapper;
}