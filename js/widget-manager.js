// js/widget-manager.js
export class WidgetManager {
    constructor(container) {
        this.container = container;
        this.widgets = new Map();
        this.layout = [];
        this.draggedId = null;
    }

    async addWidget(widgetInstance) {
        const el = widgetInstance.render();

        this._makeDraggable(el);

        this.widgets.set(widgetInstance.id, widgetInstance);
        this.layout.push(widgetInstance.id);

        await widgetInstance.init();

        this.render();
    }

    render() {
        this.container.innerHTML = "";

        for (const id of this.layout) {
            const widget = this.widgets.get(id);
            this.container.appendChild(widget.element);
        }
    }

    _makeDraggable(el) {
        el.draggable = true;

        el.addEventListener("dragstart", (e) => {
            this.draggedId = el.dataset.id;
            el.classList.add("dragging");

                // 🔥 FIX: force correct drag image
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
        });

        el.addEventListener("dragend", () => {
            el.classList.remove("dragging");
            this._clearDropIndicators();
        });

        el.addEventListener("dragover", (e) => {
            e.preventDefault();

            const targetId = el.dataset.id;
            if (targetId === this.draggedId) return;

            this._showDropIndicator(el, e.clientX);
        });

        el.addEventListener("drop", (e) => {
            e.preventDefault();

            const targetId = el.dataset.id;
            this._handleDrop(targetId, e.clientX);
        });
    }

    _handleDrop(targetId, mouseX) {
        const draggedId = this.draggedId;

        const from = this.layout.indexOf(draggedId);
        const to = this.layout.indexOf(targetId);

        if (from === -1 || to === -1) return;

        // Remove dragged
        this.layout.splice(from, 1);

        // Decide before / after
        const targetEl = this.container.querySelector(`[data-id="${targetId}"]`);
        const rect = targetEl.getBoundingClientRect();

        const isAfter = mouseX > rect.left + rect.width / 2;

        const newIndex = isAfter ? to + 1 : to;

        this.layout.splice(newIndex, 0, draggedId);

        this.render();
    }

    removeWidget(id) {
        const widget = this.widgets.get(id);
        if (!widget) return;

        widget.destroy();
        this.widgets.delete(id);
    }

    _showDropIndicator(el, mouseX) {
    this._clearDropIndicators();

    const rect = el.getBoundingClientRect();
    const isAfter = mouseX > rect.left + rect.width / 2;

    if (isAfter) {
        el.classList.add("drop-right");
    } else {
        el.classList.add("drop-left");
    }
}

_clearDropIndicators() {
    this.container.querySelectorAll(".widget").forEach(el => {
        el.classList.remove("drop-left", "drop-right");
    });
}
}