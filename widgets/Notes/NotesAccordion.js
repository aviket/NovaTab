import { Accordion } from "../components/Accordion.js";
import { loadCSS } from "../../utilities/loadcss.js";

export class NotesAccordion extends Accordion {
    
    constructor(config = {}) {
        super(config);
    }

    // 🔥 Helper function to generate the editable div for a note
    // createEditableNote(initialText, onTextChange) {
    //     const textDiv = document.createElement("div");
        
    //     textDiv.contentEditable = "true"; 
    //     textDiv.innerHTML = initialText || "";
    //     textDiv.className = "note-text";

    //     // Default styling for the yellow note
    //     textDiv.style.minHeight = "100px"; 
    //     textDiv.style.outline = "none";    
    //     textDiv.style.width = "100%";
    //     textDiv.style.boxSizing = "border-box";
    //     textDiv.style.backgroundColor = "#fff59d"; 

    //     // Handle typing and auto-expanding
    //     textDiv.oninput = () => {
    //         // Pass the new text back up if you need to save it to storage later
    //         if (onTextChange) onTextChange(textDiv.innerHTML);
            
    //         // Auto-grow the accordion body smoothly
    //         const parentBody = textDiv.closest('.accordion-body');
    //         if (parentBody && parentBody.classList.contains('open')) {
    //             parentBody.style.maxHeight = parentBody.scrollHeight + "px";
    //         }
    //     };

    //     return textDiv;   
    // }


    // 🔥 Upgraded helper function: HTML Editor & Preview
    createEditableNote(initialHTML, onTextChange) {
        // 1. The Main Container
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.width = "100%";
        container.style.backgroundColor = "#fff59d"; // Yellow note background
        container.style.borderRadius = "0 0 6px 6px";
        container.style.overflow = "hidden"; // Keeps the corners clean

        // 2. The Toolbar / Toggle Button
        const toolbar = document.createElement("div");
        toolbar.style.display = "flex";
        toolbar.style.justifyContent = "flex-end";
        toolbar.style.padding = "4px 8px";
        toolbar.style.backgroundColor = "rgba(0,0,0,0.05)"; // Slight shadow for toolbar area

        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = "✏️ Edit HTML";
        toggleBtn.style.cursor = "pointer";
        toggleBtn.style.fontSize = "12px";
        toolbar.appendChild(toggleBtn);

        // 3. The Preview Area (Renders the HTML)
        const previewArea = document.createElement("div");
        previewArea.innerHTML = initialHTML || "<i>Write some HTML...</i>";
        previewArea.style.minHeight = "100px";
        previewArea.style.padding = "8px";
        previewArea.style.boxSizing = "border-box";
        previewArea.style.width = "100%";

        // 4. The Edit Area (Raw Code Textarea)
        const editArea = document.createElement("textarea");
        editArea.value = initialHTML || "";
        editArea.style.minHeight = "100px";
        editArea.style.width = "100%";
        editArea.style.padding = "8px";
        editArea.style.boxSizing = "border-box";
        editArea.style.fontFamily = "monospace"; // Code font
        editArea.style.border = "none";
        editArea.style.outline = "none";
        editArea.style.backgroundColor = "#fff9c4"; // Slightly different yellow for edit mode
        editArea.style.display = "none"; // Hide by default

        // --- THE LOGIC ---

        // Helper to recalculate the accordion animation height
        const updateHeight = () => {
            const parentBody = container.closest('.accordion-body');
            if (parentBody && parentBody.classList.contains('open')) {
                parentBody.style.maxHeight = parentBody.scrollHeight + "px";
            }
        };

        let isEditing = false;

        // Toggle between Edit and Preview
        toggleBtn.onclick = () => {
            isEditing = !isEditing;

            if (isEditing) {
                // Switch to Edit Mode
                toggleBtn.textContent = "👁️ Preview";
                previewArea.style.display = "none";
                editArea.style.display = "block";
            } else {
                // Switch to Preview Mode
                toggleBtn.textContent = "✏️ Edit HTML";
                editArea.style.display = "none";
                previewArea.style.display = "block";
                
                // 🔥 Apply the written HTML code to the preview viewer!
                previewArea.innerHTML = editArea.value || "<i>Write some HTML...</i>";
            }

            // Important: Recalculate height because the textarea might be taller/shorter than the preview
            setTimeout(updateHeight, 0); 
        };

        // Save data as you type in the HTML editor
        editArea.oninput = () => {
            if (onTextChange) onTextChange(editArea.value);
            updateHeight(); // Auto-expand as you type code lines
        };

        // Put it all together
        container.appendChild(toolbar);
        container.appendChild(previewArea);
        container.appendChild(editArea);

        return container;   
    }

    
    init() {
        super.init(); // 🔥 Critical: Loads the base Accordion.css!
        loadCSS("notes-accordion-css", "widgets/Notes/NotesAccordion.css");
    }
}