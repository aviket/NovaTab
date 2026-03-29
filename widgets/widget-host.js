import { WidgetManager } from "./widget-manager.js";

export class WidgetHost {
    constructor() {
        this.managers = new Map(); // containerId → manager
    }

    registerContainer(containerId) {
        const el = document.getElementById(containerId);
        if (!el) throw new Error(`Container ${containerId} not found`);

        const manager = new WidgetManager(el);
        this.managers.set(containerId, manager);
    }

    async mountWidget(containerId, widget) {
        const manager = this.managers.get(containerId);
        if (!manager) throw new Error(`No manager for ${containerId}`);

        await manager.addWidget(widget);
    }

    getManager(containerId) {
        return this.managers.get(containerId);
    }
}