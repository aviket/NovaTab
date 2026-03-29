// widgets/components/Accordion/Accordion.js
import { loadCSS } from "../../../utilities/loadcss.js";
import { AccordionItem } from "./AccordionItem.js";

export class Accordion {
    constructor(config = {}) {
        this.items = new Map(); // Using a Map makes finding items by ID super easy
        
        this.config = {
            allowMultipleOpen: false,
            ...config
        };

        this.element = document.createElement("div");
        this.element.className = "accordion";
    }

    render() {
        return this.element;
    }

    // Notice how clean this is now! We just accept contentEl
    addItem({ id, title, contentEl }) {
        const item = new AccordionItem({
            id,
            title,
            contentEl,
            // When an item opens, it tells the manager. 
            // The manager then closes the others.
            onToggle: (toggledId, isOpen) => {
                if (isOpen && !this.config.allowMultipleOpen) {
                    this._closeAllExcept(toggledId);
                }
            }
        });

        this.items.set(id, item);
        this.element.appendChild(item.element);
    }

    removeItem(id) {
        const item = this.items.get(id);
        if (item) {
            item.element.remove();
            this.items.delete(id);
        }
    }

    toggleItem(id) {
        const item = this.items.get(id);
        if (item) item.toggle();
    }

    _closeAllExcept(keepOpenId) {
        // Loop through all managed items and close them
        for (const [id, item] of this.items.entries()) {
            if (id !== keepOpenId && item.isOpen) {
                item.close();
            }
        }
    }

    init() {
        loadCSS("accordion-css", "widgets/components/Accordion/Accordion.css");
    }

    destroy() {
        if (this.element) this.element.remove();
    }
}