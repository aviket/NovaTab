// widgets/Notes/NotesWidget.js
//widgets\Notes\NotesWidget.js
import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { NotesAccordion } from "./NotesAccordion.js";
import { loadCSS } from "../../utilities/loadcss.js";
import { getNotes, saveNotes } from "../../utilities/storage.js";

export class NotesWidget extends BaseWidget {
  render() {
    // Step 1: Create an EMPTY accordion
    this.accordion = new NotesAccordion({
      allowMultipleOpen: false,
    });

    const accEl = this.accordion.render();

    // Step 2: Create widget shell
    this.element = createWidgetShell({
      id: this.id,
      title: "Notes",
      content: accEl,
    });

    // Return immediately so the UI doesn't freeze
    return this.element;
  }

  // 🔥 Make init async so we can wait for storage
  async init() {
    // Initialize the accordion and CSS
    this.accordion.init();
    loadCSS("notes-widget-css", "widgets/Notes/NotesWidget.css");

    // Add the Add Note (+) button
    const header = this.element.querySelector(".widget-header");
    const addBtn = document.createElement("button");
    addBtn.textContent = "+";
    addBtn.onclick = () => this.addNote("New Note", "");
    header.appendChild(addBtn);

    // ==========================================
    // 🔥 THE STORAGE LOGIC
    // ==========================================

    // 1. Fetch all saved notes
    const allNotes = await getNotes();
    const noteIds = Object.keys(allNotes);

    // 2. Check if we have any notes
    if (noteIds.length === 0) {
      // NO NOTES FOUND! Create the default note.
      // (addNote handles saving it to storage automatically)
      await this.addNote("Note 1", "Hello 👋");
    } else {
      // NOTES FOUND! Loop through and render them.
      for (const id of noteIds) {
        const noteData = allNotes[id];
        this.renderNoteToDOM(id, noteData.title, noteData.content);
      }

      // Open the first note by default
      setTimeout(() => {
        this.accordion.toggleItem(noteIds[0]);
      }, 0);
    }
  }

  // 🔥 Helper: Renders a note to the screen AND attaches the Save logic
  renderNoteToDOM(id, title, initialHTML) {
    const noteContent = this.accordion.createEditableNote(
      initialHTML,
      async (newHTML) => {
        // THIS FIRES WHEN THE SAVE BUTTON IS CLICKED!
        const allNotes = await getNotes();

        // Make sure the object exists, then update the HTML content
        if (!allNotes[id]) allNotes[id] = { title: title };
        allNotes[id].content = newHTML;

        await saveNotes(allNotes);
        console.log(`Note ${id} saved successfully!`);
      },
    );

    // Add it to the accordion UI
    this.accordion.addItem({
      id: id,
      title: title,
      contentEl: noteContent,
    });
  }

  // 🔥 Creates a brand new note, saves it, and opens it
  async addNote(title = "New Note", initialText = "") {
    const id = "note_" + Date.now(); // Generate unique ID

    // 1. Save it to storage first so it persists
    const allNotes = await getNotes();
    allNotes[id] = { title: title, content: initialText };
    await saveNotes(allNotes);

    // 2. Render it to the screen
    this.renderNoteToDOM(id, title, initialText);

    // 3. Automatically open the newly created note
    setTimeout(() => {
      this.accordion.toggleItem(id);
    }, 0);
  }
}
