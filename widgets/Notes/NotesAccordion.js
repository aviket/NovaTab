import { Accordion } from "../components/Accordion.js";
import { loadCSS } from "../../utilities/loadcss.js";

export class NotesAccordion extends Accordion {
    
    constructor(config = {}) {
        super(config);
    }

    // 🔥 Helper function to generate the editable div for a note
    createEditableNote(initialText, onTextChange) {
        const textDiv = document.createElement("div");
        
        textDiv.contentEditable = "true"; 
        textDiv.innerHTML = initialText || "";
        textDiv.className = "note-text";

        // Default styling for the yellow note
        textDiv.style.minHeight = "100px"; 
        textDiv.style.outline = "none";    
        textDiv.style.width = "100%";
        textDiv.style.boxSizing = "border-box";
        textDiv.style.backgroundColor = "#fff59d"; 

        // Handle typing and auto-expanding
        textDiv.oninput = () => {
            // Pass the new text back up if you need to save it to storage later
            if (onTextChange) onTextChange(textDiv.innerHTML);
            
            // Auto-grow the accordion body smoothly
            const parentBody = textDiv.closest('.accordion-body');
            if (parentBody && parentBody.classList.contains('open')) {
                parentBody.style.maxHeight = parentBody.scrollHeight + "px";
            }
        };

        return textDiv;   
    }

    init() {
        super.init(); // 🔥 Critical: Loads the base Accordion.css!
        loadCSS("notes-accordion-css", "widgets/Notes/NotesAccordion.css");
    }
}