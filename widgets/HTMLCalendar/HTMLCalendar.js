// widgets/TimeTools/TimeToolsWidget.js
import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { loadCSS } from "../../utilities/loadcss.js";
// import { Modal } from "../../utilities/modal/modal.js";
// const modal = new Modal();
import { notify } from "../../utilities/notify/notify.js";

export class HTMLCalendar extends BaseWidget {
  constructor() {
    super("html-calendar");
  }

  render() {
    const content = document.createElement("div");
    content.className = "calendar-root";

    content.innerHTML = `
    <div class="calendar-header">
      <button id="prev-month">◀</button>
      <span id="month-label"></span>
      <button id="next-month">▶</button>
    </div>
      <!-- 👇 ADD THIS -->
  <div class="calendar-weekdays">
    <div>S</div>
    <div>M</div>
    <div>T</div>
    <div>W</div>
    <div>T</div>
    <div>F</div>
    <div>S</div>
  </div>

    <div id="calendar-grid" class="calendar-grid"></div>
  `;

    this.element = createWidgetShell({
      id: this.id,
      title: "📅 Calendar",
      content,
    });

    return this.element;
  }

  init() {
    loadCSS("html-calendar", "widgets/HTMLCalendar/HTMLCalendar.css");
    const root = this.element;

    let current = new Date();

    const renderCalendar = () => {
      const grid = root.querySelector("#calendar-grid");
      const label = root.querySelector("#month-label");

      const year = current.getFullYear();
      const month = current.getMonth();

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      label.textContent = `${monthNames[month]} ${year}`;

      const firstDay = new Date(year, month, 1).getDay(); // 0–6
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      grid.innerHTML = "";

      // 1️⃣ Empty slots before first day
      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.classList.add("empty-cell");
        grid.appendChild(empty);
      }

      // 2️⃣ Actual days ONLY
      const today = new Date();
      for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement("div");
        cell.addEventListener("mouseover", (e) => {
          console.log("Hovering over date:", d);
          cell.classList.add("calendar-day--hover");
        });
        cell.addEventListener("mouseleave", (e) => {
          cell.classList.remove("calendar-day--hover");
        });
        cell.addEventListener("click", () => {
          const selectedDate = new Date(year, month, d);
          notify.create({
            type: "basic",
            title: "📅 Calendar",
            message: "You selected: " + selectedDate.toDateString(),
            priority: 2,
            requireInteraction: true,

            // 👇 optional click
            onClick: () => {
              console.log("Notification clicked");
            },
          });
        });
        cell.textContent = d;

          // 🔥 Check if this cell is today
  if (
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  ) {
    console.log("Marking today:", d);
    cell.style.backgroundColor = "#b9d5f2";
    cell.style.fontWeight = "bold";
    cell.style.border = "2px solid #1976D2";
    cell.style.color = "#1976D2";
  }
       
        

        grid.appendChild(cell);
      }
      

    };

    root.querySelector("#prev-month").onclick = () => {
      current.setMonth(current.getMonth() - 1);
      renderCalendar();
    };

    root.querySelector("#next-month").onclick = () => {
      current.setMonth(current.getMonth() + 1);
      renderCalendar();
    };

    renderCalendar();
  }

  destroy() {
    // if (this.swInterval) clearInterval(this.swInterval);
    // if (this.cdInterval) clearInterval(this.cdInterval);

    super.destroy();
  }
}
