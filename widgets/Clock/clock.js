import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";

export class ClockWidget extends BaseWidget {

    render() {
        const content = document.createElement("div");
        content.innerHTML = `<h2 class="time">--:--:--</h2>`;

        const shell = createWidgetShell({
            id: this.id,
            title: "Clock",
            content
        });

        this.element = shell;
        this.timeEl = content.querySelector(".time");

        return shell;
    }

    init() {
        this.interval = setInterval(() => {
            const now = new Date();
            this.timeEl.textContent = now.toLocaleTimeString();
        }, 1000);
    }

    destroy() {
        clearInterval(this.interval);
        super.destroy();
    }
}