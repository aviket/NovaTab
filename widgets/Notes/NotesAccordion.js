import { Accordion } from "../components/Accordion.js";
import { loadCSS } from "../../utilities/loadcss.js";

export class NotesAccordion extends Accordion {
    
    constructor(config = {}) {
        super(config);
    }

    createEditableNote(initialHTML, onTextChange) {
        // 1. The Container
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.backgroundColor = "#fff"; 
        container.style.borderRadius = "0 0 6px 6px";
        container.style.overflow = "hidden";
        
        // 2. The Fixed Toolbar
        const toolbar = document.createElement("div");
        toolbar.style.display = "flex";
        toolbar.style.alignItems = "center"; 
        toolbar.style.gap = "4px";
        toolbar.style.padding = "6px 12px";
        toolbar.style.backgroundColor = "#f5f5f5"; 
        toolbar.style.borderBottom = "1px solid #e0e0e0";

        // The Headings Dropdown
        const formatSelect = document.createElement("select");
        formatSelect.style.border = "none";
        formatSelect.style.background = "transparent";
        formatSelect.style.cursor = "pointer";
        formatSelect.style.fontSize = "14px";
        formatSelect.style.fontWeight = "bold";
        formatSelect.style.color = "#333";
        formatSelect.style.outline = "none";
        
        const formats = [
            { label: "Normal", value: "P" },
            { label: "Heading 1", value: "H1" },
            { label: "Heading 2", value: "H2" },
            { label: "Heading 3", value: "H3" },
            { label: "Heading 4", value: "H4" },
            { label: "Heading 5", value: "H5" }
        ];

        formats.forEach(f => {
            const opt = document.createElement("option");
            opt.value = f.value;
            opt.textContent = f.label;
            formatSelect.appendChild(opt);
        });

        formatSelect.addEventListener("change", (e) => {
            document.execCommand("formatBlock", false, e.target.value);
            if (onTextChange) onTextChange(editorDiv.innerHTML);
            formatSelect.value = "P"; 
        });

        toolbar.appendChild(formatSelect);

        // Visual separator line
        const separator1 = document.createElement("div");
        separator1.style.width = "1px";
        separator1.style.height = "16px";
        separator1.style.backgroundColor = "#ccc";
        separator1.style.margin = "0 6px";
        toolbar.appendChild(separator1);

        // 🔥 UPGRADED: Helper now accepts a 'value' parameter
        const createBtn = (html, command, value = null) => {
            const btn = document.createElement("button");
            btn.innerHTML = html;
            btn.style.background = "transparent";
            btn.style.border = "1px solid transparent";
            btn.style.borderRadius = "4px";
            btn.style.color = "#333";
            btn.style.cursor = "pointer";
            btn.style.fontSize = "14px";
            btn.style.fontWeight = "bold";
            btn.style.padding = "4px 8px";
            btn.style.transition = "background 0.2s";
            
            btn.onmouseover = () => btn.style.backgroundColor = "#e0e0e0";
            btn.onmouseout = () => btn.style.backgroundColor = "transparent";
            
            btn.onmousedown = (e) => {
                e.preventDefault(); 
                // 🔥 Pass the value to execCommand (it uses 'null' if not provided)
                document.execCommand(command, false, value);
                if (onTextChange) onTextChange(editorDiv.innerHTML); 
            };
            return btn;
        };

        // Add the standard formatting buttons
        toolbar.appendChild(createBtn("<b>B</b>", "bold"));
        toolbar.appendChild(createBtn("<i>I</i>", "italic"));
        toolbar.appendChild(createBtn("<u>U</u>", "underline"));
        toolbar.appendChild(createBtn("<s>S</s>", "strikeThrough"));
        
        // 🔥 ADDED: The Blockquote Button!
        toolbar.appendChild(createBtn("❝", "formatBlock", "BLOCKQUOTE"));

        toolbar.appendChild(createBtn("•", "insertUnorderedList"));
        toolbar.appendChild(createBtn("1.", "insertOrderedList"));

        // Add another visual separator line
        const separator2 = separator1.cloneNode();
        toolbar.appendChild(separator2);

        // The Native Color Picker
        const colorPicker = document.createElement("input");
        colorPicker.type = "color";
        colorPicker.value = "#333333"; 
        colorPicker.title = "Text Color";
        colorPicker.style.border = "none";
        colorPicker.style.background = "transparent";
        colorPicker.style.cursor = "pointer";
        colorPicker.style.width = "24px";
        colorPicker.style.height = "24px";
        colorPicker.style.padding = "0";

        colorPicker.addEventListener("input", (e) => {
            document.execCommand("foreColor", false, e.target.value);
            if (onTextChange) onTextChange(editorDiv.innerHTML);
        });

        toolbar.appendChild(colorPicker);

        // 4. The Editor
        const editorDiv = document.createElement("div");
        editorDiv.contentEditable = "true";
        editorDiv.innerHTML = initialHTML || "";
        editorDiv.className = "zen-editor";
        editorDiv.style.padding = "16px";
        editorDiv.style.minHeight = "80px";
        editorDiv.style.outline = "none";
        editorDiv.style.lineHeight = "1.5";
        editorDiv.style.color = "#333";

        // 5. Auto-expand Accordion and Save Data
        editorDiv.oninput = () => {
            if (onTextChange) onTextChange(editorDiv.innerHTML);
            const parentBody = container.closest('.accordion-body');
            if (parentBody && parentBody.classList.contains('open')) {
                parentBody.style.maxHeight = parentBody.scrollHeight + "px";
            }
        };

        container.appendChild(toolbar);
        container.appendChild(editorDiv);

        return container;   
    }

    init() {
        super.init(); 
        loadCSS("notes-accordion-css", "widgets/Notes/NotesWidget.css");
    }
}