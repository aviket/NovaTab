// widgets/widget-manager.js

import { DragController } from "./DragController.js";

export class WidgetManager {
  constructor(container) {
    this.container = container;

    this.widgets = new Map();
    this.layout = [];

    this.dragController = new DragController(container, {
      onReorder: this._handleReorder.bind(this),
    });
  }

  async addWidget(widgetInstance) {
    const el = await widgetInstance.render();

    // Delegate drag behavior
    this.dragController.makeDraggable(el);

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

  _handleReorder({ draggedId, targetId, mouseX }) {
    const from = this.layout.indexOf(draggedId);
    const to = this.layout.indexOf(targetId);

    if (from === -1 || to === -1) return;

    // Remove dragged item
    this.layout.splice(from, 1);

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

    const index = this.layout.indexOf(id);
    if (index !== -1) {
      this.layout.splice(index, 1);
    }

    this.render();
  }
}
