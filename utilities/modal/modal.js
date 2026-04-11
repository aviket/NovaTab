// utilities/modal/modal.js
import { loadCSS } from "../loadcss.js";
loadCSS("modal-css", "utilities/modal/modal.css");

export class Modal {
  constructor() {
    this.overlay = null;
    this.modal = null;
  }

  open({ title = "", content, onClose = null }) {
    // 🔹 Create overlay
    this.overlay = document.createElement("div");
    this.overlay.className = "modal-overlay";

    // 🔹 Create modal container
    this.modal = document.createElement("div");
    this.modal.className = "modal-box";

    // 🔹 Header
    const header = document.createElement("div");
    header.className = "modal-header";

    const titleEl = document.createElement("span");
    titleEl.textContent = title;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✖";
    closeBtn.onclick = () => this.close(onClose);

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // 🔹 Body
    const body = document.createElement("div");
    body.className = "modal-body";

    // Accept ANY HTML (same philosophy as AccordionItem)
    if (typeof content === "string") {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }

    // 🔹 Assemble
    this.modal.appendChild(header);
    this.modal.appendChild(body);
    this.overlay.appendChild(this.modal);

    document.body.appendChild(this.overlay);
  }

  close(callback) {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.modal = null;
    }

    if (callback) callback();
  }
}
