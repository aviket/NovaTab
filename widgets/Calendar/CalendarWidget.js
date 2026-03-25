import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { loadCSS } from "../../utilities/loadcss.js";

export class CalendarWidget extends BaseWidget {
    constructor(id, config = {}) {
        super(id, config);
        this.viewDate = new Date();
    }

    // ==============================
    // Create Inner Content
    // ==============================
    createContent() {
        const container = document.createElement("div");

        container.innerHTML = `
            <div class="calendar-widget-inner">

                <!-- Controls (NOT in header anymore) -->
                <div class="calendar-controls">
                    <button class="nav-btn" id="cal-prev">◀</button>
                    <button class="nav-btn home-btn" id="cal-home">Today</button>
                    <button class="nav-btn" id="cal-next">▶</button>
                </div>

                <div class="calendar-title" id="cal-title"></div>

                <div class="calendar-body">
                    <img id="cal-img" src="" alt="Calendar">
                    <div id="cal-error" class="cal-error">
                        <div>⚠️</div>
                        <p>Image not found</p>
                    </div>
                </div>
            </div>

            <!-- Modal -->
            <div class="cal-modal">
                <span class="cal-modal-close">&times;</span>
                <img class="cal-modal-content">
            </div>
        `;

        return container;
    }

    // ==============================
    // Render Shell
    // ==============================
    render() {
        const content = this.createContent();

        this.element = createWidgetShell({
            id: this.id,
            title: "📅 Calendar",
            content,
            onRemove: () => this.destroy()
        });

        return this.element;
    }

    // ==============================
    // Init
    // ==============================
    init() {
        loadCSS("calendar-css", "widgets/Calendar/calendar.css");
        this.renderCalendar();
        this.bindEvents();
    }

    // ==============================
    // Render Calendar Image
    // ==============================
    renderCalendar() {
        const titleEl = this.element.querySelector('#cal-title');
        const imgEl = this.element.querySelector('#cal-img');
        const errorEl = this.element.querySelector('#cal-error');

        const monthName = this.viewDate.toLocaleString('default', { month: 'long' });
        const year = this.viewDate.getFullYear();
        const filename = `${monthName}_${year}.jpg`;

        titleEl.textContent = `${monthName} ${year}`;

        const imagePath = chrome.runtime.getURL(`assets/months/${filename}`);

        imgEl.style.display = 'block';
        errorEl.style.display = 'none';
        imgEl.src = imagePath;

        imgEl.onerror = () => {
            imgEl.style.display = 'none';
            errorEl.style.display = 'block';
        };
    }

    // ==============================
    // Events
    // ==============================
    bindEvents() {
        const prev = this.element.querySelector('#cal-prev');
        const next = this.element.querySelector('#cal-next');
        const home = this.element.querySelector('#cal-home');

        const img = this.element.querySelector('#cal-img');
        const modal = this.element.querySelector('.cal-modal');
        const modalImg = this.element.querySelector('.cal-modal-content');
        const modalClose = this.element.querySelector('.cal-modal-close');

        // Navigation
        prev.onclick = () => {
            this.viewDate.setMonth(this.viewDate.getMonth() - 1);
            this.renderCalendar();
        };

        next.onclick = () => {
            this.viewDate.setMonth(this.viewDate.getMonth() + 1);
            this.renderCalendar();
        };

        home.onclick = () => {
            this.viewDate = new Date();
            this.renderCalendar();
        };

        // Modal
        img.onclick = () => {
            modal.classList.add("visible");
            modalImg.src = img.src;
        };

        modalClose.onclick = () => {
            modal.classList.remove("visible");
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove("visible");
            }
        };
    }

    // ==============================
    // Cleanup
    // ==============================
    destroy() {
        super.destroy();
    }


}