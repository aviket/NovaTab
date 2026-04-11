// widgets/Clock/clock.js
import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { loadCSS } from "../../utilities/loadcss.js";

export class ClockWidget extends BaseWidget {
  constructor(id, config = {}) {
    super(id, config);
    this.animationFrameId = null;
  }

  // ==============================
  // Create inner content (ONLY content)
  // ==============================
  createContent() {
    const container = document.createElement("div");

    container.innerHTML = `
            <div class="clock-widget-inner">
                <button class="btn-toggle">Digital</button>

                <div class="clock-card">
                    <div class="clock" id="analog-clock-face">
                        <div class="hand hour" id="h"></div>
                        <div class="hand minute" id="m"></div>
                        <div class="hand second" id="s"></div>
                        <div class="nums" id="nums"></div>
                    </div>

                    <div class="digital-clock hidden" id="digitalClock">
                        <div class="digital-time" id="digitalTime">00:00:00</div>
                        <div class="digital-date" id="digitalDate">Mon, 01 Jan 1970</div>
                    </div>
                </div>
            </div>
        `;

    return container;
  }

  // ==============================
  // Render full widget
  // ==============================
  render() {
    const content = this.createContent();

    this.element = createWidgetShell({
      id: this.id,
      title: "🕒 Clock",
      content,
    });

    return this.element;
  }

  // ==============================
  // Init (after DOM mount)
  // ==============================
  init() {
    if (!this.element) return;
    console.log("Initializing ClockWidget...");
    loadCSS("clock-css", "widgets/Clock/clock.css");
    this.drawClockFace();
    this.bindEvents();
    this.startTicker();
  }

  // ==============================
  // Clock face numbers
  // ==============================
  drawClockFace() {
    const numsContainer = this.element.querySelector("#nums");
    if (!numsContainer) return;

    const radius = 32;

    for (let i = 1; i <= 12; i++) {
      const span = document.createElement("span");
      span.className = "num";
      span.textContent = i;

      const angleRad = (i * 30 - 90) * (Math.PI / 180);
      span.style.left = `${50 + radius * Math.cos(angleRad)}%`;
      span.style.top = `${50 + radius * Math.sin(angleRad)}%`;

      numsContainer.appendChild(span);
    }
  }

  // ==============================
  // Events
  // ==============================
  bindEvents() {
    const modeBtn = this.element.querySelector(".btn-toggle");
    const analogEl = this.element.querySelector("#analog-clock-face");
    const digitalEl = this.element.querySelector("#digitalClock");

    if (modeBtn) {
      modeBtn.addEventListener("click", () => {
        const isAnalogHidden = analogEl.classList.contains("hidden");

        if (isAnalogHidden) {
          analogEl.classList.remove("hidden");
          digitalEl.classList.add("hidden");
          modeBtn.textContent = "Digital";
        } else {
          analogEl.classList.add("hidden");
          digitalEl.classList.remove("hidden");
          modeBtn.textContent = "Analog";
        }
      });
    }
  }

  // ==============================
  // Animation loop
  // ==============================
  startTicker() {
    const update = () => {
      // Stop if widget removed
      if (!this.element || !document.body.contains(this.element)) return;

      const now = new Date();

      const s = now.getSeconds();
      const m = now.getMinutes();
      const h = now.getHours();

      const elS = this.element.querySelector("#s");
      const elM = this.element.querySelector("#m");
      const elH = this.element.querySelector("#h");

      if (elS)
        elS.style.transform = `translate(-50%, -100%) rotate(${s * 6}deg)`;
      if (elM)
        elM.style.transform = `translate(-50%, -100%) rotate(${m * 6 + s * 0.1}deg)`;
      if (elH)
        elH.style.transform = `translate(-50%, -100%) rotate(${(h % 12) * 30 + m * 0.5}deg)`;

      const dTime = this.element.querySelector("#digitalTime");
      const dDate = this.element.querySelector("#digitalDate");

      if (dTime)
        dTime.textContent = now.toLocaleTimeString([], { hour12: false });
      if (dDate)
        dDate.textContent = now.toLocaleDateString(undefined, {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        });

      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  // ==============================
  // Cleanup
  // ==============================
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    super.destroy();
  }
}
