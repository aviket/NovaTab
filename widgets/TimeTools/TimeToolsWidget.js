// widgets/TimeTools/TimeToolsWidget.js
import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { loadCSS } from "../../utilities/loadcss.js";

export class TimeToolsWidget extends BaseWidget {
    constructor() {
        super("time-tools");

        this.swInterval = null;
        this.cdInterval = null;
        this.swRunning = false;
        this.cdRunning = false;
    }

    render() {
        // Create inner content ONLY (no wrapper)
        const content = document.createElement("div");
        content.className = "time-tools-root";

        content.innerHTML = `
            <div class="segmented">
                <button id="toolStopwatch" class="seg-btn active">Stopwatch</button>
                <button id="toolCountdown" class="seg-btn">Countdown</button>
            </div>

            <!-- Stopwatch -->
            <div id="stopwatch" class="time-tool">
                <div id="stopwatch-display" class="time-readout">00:00:00</div>
                <div class="tool-buttons">
                    <button id="sw-start">Start</button>
                    <button id="sw-reset">Reset</button>
                </div>
            </div>

            <!-- Countdown -->
            <div id="countdown" class="time-tool hidden">
                <div class="duration-input">
                    <input id="cd-h" type="number" min="0" value="0"> :
                    <input id="cd-m" type="number" min="0" max="59" value="5"> :
                    <input id="cd-s" type="number" min="0" max="59" value="0">
                </div>
                <div id="countdown-display" class="time-readout">00:05:00</div>
                <div class="tool-buttons">
                    <button id="cd-start">Start</button>
                    <button id="cd-reset">Reset</button>
                </div>
            </div>
        `;

        // Wrap with shell
        this.element = createWidgetShell({
            id: this.id,
            title: "⏱️ Time Tools",
            content
        });

        return this.element;
    }

    init() {
        loadCSS("time-tools-css", "widgets/TimeTools/TimeToolsWidget.css");
        const root = this.element;

        const swBtn = root.querySelector('#toolStopwatch');
        const cdBtn = root.querySelector('#toolCountdown');
        const swDiv = root.querySelector('#stopwatch');
        const cdDiv = root.querySelector('#countdown');

        // -------------------------
        // TAB SWITCH
        // -------------------------
        swBtn.onclick = () => {
            swBtn.classList.add("active");
            cdBtn.classList.remove("active");
            swDiv.classList.remove("hidden");
            cdDiv.classList.add("hidden");
        };

        cdBtn.onclick = () => {
            cdBtn.classList.add("active");
            swBtn.classList.remove("active");
            cdDiv.classList.remove("hidden");
            swDiv.classList.add("hidden");
        };

        // -------------------------
        // STOPWATCH
        // -------------------------
        let swTime = 0;
        const swDisplay = root.querySelector('#stopwatch-display');
        const swStartBtn = root.querySelector('#sw-start');

        swStartBtn.onclick = () => {
            if (this.swRunning) {
                clearInterval(this.swInterval);
                this.swRunning = false;
                swStartBtn.textContent = "Start";
            } else {
                this.swRunning = true;
                swStartBtn.textContent = "Stop";

                const startTime = Date.now() - swTime;

                this.swInterval = setInterval(() => {
                    swTime = Date.now() - startTime;
                    swDisplay.textContent = new Date(swTime)
                        .toISOString()
                        .slice(11, 19);
                }, 100);
            }
        };

        root.querySelector('#sw-reset').onclick = () => {
            clearInterval(this.swInterval);
            this.swRunning = false;
            swTime = 0;
            swDisplay.textContent = "00:00:00";
            swStartBtn.textContent = "Start";
        };

        // -------------------------
        // COUNTDOWN
        // -------------------------
        const cdDisplay = root.querySelector('#countdown-display');
        const cdStartBtn = root.querySelector('#cd-start');
        const inputH = root.querySelector('#cd-h');
        const inputM = root.querySelector('#cd-m');
        const inputS = root.querySelector('#cd-s');

        let remainingSeconds = 0;

        cdStartBtn.onclick = () => {
            if (this.cdRunning) {
                clearInterval(this.cdInterval);
                this.cdRunning = false;
                cdStartBtn.textContent = "Start";

                inputH.disabled = false;
                inputM.disabled = false;
                inputS.disabled = false;
            } else {
                if (remainingSeconds <= 0) {
                    const h = +inputH.value || 0;
                    const m = +inputM.value || 0;
                    const s = +inputS.value || 0;
                    remainingSeconds = h * 3600 + m * 60 + s;
                }

                if (remainingSeconds <= 0) return;

                this.cdRunning = true;
                cdStartBtn.textContent = "Stop";

                inputH.disabled = true;
                inputM.disabled = true;
                inputS.disabled = true;

                this.cdInterval = setInterval(() => {
                    remainingSeconds--;

                    if (remainingSeconds < 0) {
                        clearInterval(this.cdInterval);
                        this.cdRunning = false;
                        cdStartBtn.textContent = "Start";

                        inputH.disabled = false;
                        inputM.disabled = false;
                        inputS.disabled = false;

                        alert("Time's up!");
                        remainingSeconds = 0;
                        return;
                    }

                    const hh = String(Math.floor(remainingSeconds / 3600)).padStart(2, '0');
                    const mm = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0');
                    const ss = String(remainingSeconds % 60).padStart(2, '0');

                    cdDisplay.textContent = `${hh}:${mm}:${ss}`;
                }, 1000);
            }
        };

        root.querySelector('#cd-reset').onclick = () => {
            clearInterval(this.cdInterval);
            this.cdRunning = false;
            remainingSeconds = 0;

            cdDisplay.textContent = "00:00:00";
            cdStartBtn.textContent = "Start";

            inputH.disabled = false;
            inputM.disabled = false;
            inputS.disabled = false;
        };
    }

    destroy() {
        if (this.swInterval) clearInterval(this.swInterval);
        if (this.cdInterval) clearInterval(this.cdInterval);

        super.destroy();
    }



}