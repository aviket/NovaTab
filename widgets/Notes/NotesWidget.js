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

        // Step 2: add default notes
        this.accordion.addItem({
            id: "note1",
            title: "Note 1",
            data: { text: "Hello 👋" }
        }); // Open first note by default

        // this.accordion.addItem({
        //     id: "note2",
        //     title: "Note 2",
        //     data: { text: "Write something..." }

        // });

        this.accordion.toggleItem("note1"); // Open first note by default

        // Step 3: create widget shell
        this.element = createWidgetShell({
            id: this.id,
            title: "Notes",
            content: accEl
        });

        return this.element;
    }

    init() {
        loadCSS("notes-widget-css", "widgets/Notes/NotesWidget.css");   
        // Add controls (like Add Note button)
        const header = this.element.querySelector(".widget-header");

        const addBtn = document.createElement("button");
        addBtn.textContent = "+";

        addBtn.onclick = () => this.addNote();

        header.appendChild(addBtn);
    }

    addNote() {
        const id = "note_" + Date.now();

        this.accordion.addItem({
            id,
            title: "New Note",
            data: { text: "" }
        });
    }
}