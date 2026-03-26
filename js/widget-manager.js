// js/widget-manager.js
export class WidgetManager {
    constructor(container) {
        this.container = container;
        this.widgets = new Map();
    }

    async addWidget(widgetInstance) {
        const el = widgetInstance.render();
        this.container.appendChild(el);

         await widgetInstance.init();

        this.widgets.set(widgetInstance.id, widgetInstance);
    }

    removeWidget(id) {
        const widget = this.widgets.get(id);
        if (!widget) return;

        widget.destroy();
        this.widgets.delete(id);
    }
}