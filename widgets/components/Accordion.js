import { loadCSS } from "../../utilities/loadcss.js";
export class Accordion {
    constructor(config = {}) {
        this.items = [];
        this.element = null;

        this.config = {
            allowMultipleOpen: false,
            defaultOpenIndex: null,
            ...config
        };
    }

    // Create root DOM
    render() {
        this.element = document.createElement("div");
        this.element.className = "accordion";

        return this.element;
    }

    // Add new item
    addItem({ id, title, data }) {
        const item = { id, title, data, expanded: false };
        this.items.push(item);

        const itemEl = this._createItemElement(item);
        this.element.appendChild(itemEl);
    }

    // Remove item
    removeItem(id) {
        this.items = this.items.filter(i => i.id !== id);

        const el = this.element.querySelector(`[data-id="${id}"]`);
        if (el) el.remove();
    }

    // Expand / collapse
    toggleItem(id) {
        console.log("Toggling item:", id);
        const el = this.element.querySelector(`[data-id="${id}"]`);
        console.log("Found element:", el);
        if (!el) return;

        const body = el.querySelector(".accordion-body");
        const isOpen = body.classList.contains("open");
        console.log("Is currently open?", isOpen);
        if (isOpen) {
            // ✅ FORCE CLOSE
            body.style.maxHeight = "0px";
            body.classList.remove("open");
            console.log("Item closed");
        } else {
            // Close others (if needed)
            if (!this.config.allowMultipleOpen) {
                this._closeAll();
            }

            // ✅ FORCE OPEN
            body.classList.add("open");
            body.style.maxHeight = body.scrollHeight + "px";
            console.log("Item opened");
        }
    }
    _closeAll() {
        console.log("Closing all items");
        this.element.querySelectorAll(".accordion-body").forEach(el => {
            el.style.maxHeight = "0px";   // 🔥 not null
            el.classList.remove("open");
        });
    }

    // 🔥 Core factory
    _createItemElement(item) {
        const wrapper = document.createElement("div");
        wrapper.className = "accordion-item";
        wrapper.dataset.id = item.id;

        wrapper.innerHTML = `
            <div class="accordion-header">${item.title}</div>
            <div class="accordion-body"></div>
        `;

        const header = wrapper.querySelector(".accordion-header");
        const body = wrapper.querySelector(".accordion-body");

        // 🔥 FORCE INITIAL STATE CLOSED
        body.style.maxHeight = "0px";
        body.classList.remove("open");

        const content = this.renderContent(item);
        body.appendChild(content);

        header.onclick = () => this.toggleItem(item.id);

        return wrapper;
    }

    // 🔥 OVERRIDABLE METHOD
    renderContent(item) {
        const div = document.createElement("div");
        div.textContent = item.data;
        return div;
    }

    init() {
        loadCSS("accordion-css", "widgets/components/Accordion.css");
    }

    destroy() {
        if (this.element) this.element.remove();
    }
}