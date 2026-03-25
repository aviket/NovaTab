import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { NotesAccordion } from "./NotesAccordion.js";
import { loadCSS } from "../../utilities/loadcss.js";

export class NotesWidget extends BaseWidget {

    render() {
        // Step 1: create accordion
        this.accordion = new NotesAccordion({
            allowMultipleOpen: false
        });

        const accEl = this.accordion.render();

        // Step 2: add default note
        // 🔥 Generate the DOM element first
        const note1Content = this.accordion.createEditableNote("Hello 👋", (newText) => {
            // In the future, you can hook up your storage save logic here!
            console.log("Note 1 updated:", newText);
        });

        // 🔥 Pass it using the new Component Composition architecture
        this.accordion.addItem({
            id: "note1",
            title: "Note 1",
            contentEl: note1Content
        }); 

        // Step 3: create widget shell
        this.element = createWidgetShell({
            id: this.id,
            title: "Notes",
            content: accEl
        });

        return this.element;
    }

    init() {
        // 🔥 Initialize the accordion (this loads the CSS rules we need!)
        this.accordion.init(); 

        loadCSS("notes-widget-css", "widgets/Notes/NotesWidget.css");   
        
        // Add controls (like Add Note button)
        const header = this.element.querySelector(".widget-header");

        const addBtn = document.createElement("button");
        addBtn.textContent = "+";

        addBtn.onclick = () => this.addNote();

        header.appendChild(addBtn);

        // Open the first note AFTER the widget is attached to the DOM
        setTimeout(() => {
            this.accordion.toggleItem("note1"); 
        }, 0);
    }

    addNote() {
        const id = "note_" + Date.now();

        // 🔥 Generate the new note's DOM element
        const newNoteContent = this.accordion.createEditableNote("", (newText) => {
             console.log("New note updated:", newText);
        });

        // 🔥 Pass it to the accordion
        this.accordion.addItem({
            id: id,
            title: "New Note",
            contentEl: newNoteContent
        });

        // Automatically open the newly created note
        setTimeout(() => {
            this.accordion.toggleItem(id);
        }, 0);
    }
}