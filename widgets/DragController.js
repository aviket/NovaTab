// controllers/DragController.js

export class DragController {
  constructor(container, { onReorder }) {
    this.container = container;
    this.onReorder = onReorder;

    this.draggedId = null;
  }

  makeDraggable(el) {
    el.draggable = true;

    el.addEventListener("dragstart", (e) => {
      this.draggedId = el.dataset.id;
      el.classList.add("dragging");

      // Fix drag image
      e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
      this._clearIndicators();
    });

    el.addEventListener("dragover", (e) => {
      e.preventDefault();

      const targetId = el.dataset.id;
      if (targetId === this.draggedId) return;

      this._showIndicator(el, e.clientX);
    });

    el.addEventListener("drop", (e) => {
      e.preventDefault();

      const targetId = el.dataset.id;

      this._clearIndicators();

      if (this.onReorder) {
        this.onReorder({
          draggedId: this.draggedId,
          targetId,
          mouseX: e.clientX,
        });
      }
    });
  }

  _showIndicator(el, mouseX) {
    this._clearIndicators();

    const rect = el.getBoundingClientRect();
    const isAfter = mouseX > rect.left + rect.width / 2;

    el.classList.add(isAfter ? "drop-right" : "drop-left");
  }

  _clearIndicators() {
    this.container.querySelectorAll(".widget").forEach((el) => {
      el.classList.remove("drop-left", "drop-right");
    });
  }
}
