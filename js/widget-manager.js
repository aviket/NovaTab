export class WidgetManager {
    constructor(container) {
        this.container = container;
        this.widgets = new Map();
    }

    addWidget(widgetInstance) {
        const el = widgetInstance.render();
        this.container.appendChild(el);

        widgetInstance.init();

        this.widgets.set(widgetInstance.id, widgetInstance);
    }

    removeWidget(id) {
        const widget = this.widgets.get(id);
        if (!widget) return;

        widget.destroy();
        this.widgets.delete(id);
    }
}