// widgets/components/Accordion/AccordionItem.js

export class AccordionItem {
  constructor({ id, title, contentEl, onToggle }) {
    this.id = id;
    this.title = title;
    this.contentEl = contentEl; // This can be ANY HTML element
    this.onToggle = onToggle; // Callback to tell the parent it opened

    this.isOpen = false;
    this.element = this.render();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "accordion-item";
    wrapper.dataset.id = this.id;

    wrapper.innerHTML = `
            <div class="accordion-header">${this.title}</div>
            <div class="accordion-body" style="max-height: 0px;"></div>
        `;

    const header = wrapper.querySelector(".accordion-header");
    const body = wrapper.querySelector(".accordion-body");

    // 🔥 Inject the flexible content!
    body.appendChild(this.contentEl);

    // Bind the click event to this specific instance
    header.onclick = () => this.toggle();

    return wrapper;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    const body = this.element.querySelector(".accordion-body");
    body.classList.add("open");

    // Let the browser calculate the required height based on content
    body.style.maxHeight = body.scrollHeight + "px";

    // Notify parent so it can close other tabs if necessary
    if (this.onToggle) this.onToggle(this.id, true);
  }

  close() {
    this.isOpen = false;
    const body = this.element.querySelector(".accordion-body");
    body.classList.remove("open");
    body.style.maxHeight = "0px";
  }
}
