import { Accordion } from "../components/Accordion.js";
import { loadCSS } from "../../utilities/loadcss.js";

export class NotesAccordion extends Accordion {
    
    constructor(config = {}) {
        super(config);
    }

    // 🔥 Override rendering logic
    renderContent(item) {
        const text = document.createElement("textarea");
        text.value = item.data.text || "";
        text.className = "note-text";

        text.oninput = () => {
            item.data.text = text.value;
        };

        return text;   // 🔥 return textarea directly
    }

    init() {
        loadCSS("notes-accordion-css", "widgets/Notes/NotesAccordion.css");
    }
}