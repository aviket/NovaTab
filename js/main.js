// js/main.js
// ==============================
// Theme Handling
// ==============================
const themeSelect = document.getElementById("theme-select");

import { WidgetHost } from "../widgets/widget-host.js";
import { getDefaultWidgets } from "../widgets/widget-config.js";

document.addEventListener('DOMContentLoaded', async () => {
  const btnSidebar = document.getElementById('btn-open-sidebar');
  if (btnSidebar) {
    console.log('Sidebar button found, adding click listener');
    btnSidebar.addEventListener('click', () => {
      // Send a message to the background script to open the Side Panel
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    });
  }
   await initLinksTree();
});

const widgetHost = new WidgetHost();
widgetHost.registerContainer("widget-container");

// Load default widgets
getDefaultWidgets().forEach(widget => {
    widgetHost.mountWidget("widget-container", widget);
});


themeSelect.addEventListener("change", () => {
    const theme = themeSelect.value;

    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);

    // Persist theme
    localStorage.setItem("novatab-theme", theme);
});

// Load saved theme
const savedTheme = localStorage.getItem("novatab-theme") || "light";
document.body.classList.add(savedTheme);
themeSelect.value = savedTheme;


// ==============================
// Search Handling
// ==============================
const searchInput = document.getElementById("search-input");

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        performSearch();
    }
});

function performSearch() {
    const query = searchInput.value.trim();
    const engine = document.getElementById("search-engine").value;

    if (!query) return;

    let url = "";

    switch (engine) {
        case "google":
            url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            break;

        case "bing":
            url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            break;

        case "duckduckgo":
            url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
            break;
    }

    // Open in same tab
    window.location.href = url;
}

// Settings button handler
document.getElementById("settings-btn").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
});



// import { WidgetManager } from "./widget-manager.js";
// import { ClockWidget } from "./../widgets/Clock/clock.js";
// import { CalendarWidget } from "./../widgets/Calendar/CalendarWidget.js";
// import { ShortcutsWidget } from "./../widgets/Shortcuts/shortcutsWidget.js";
// import { TimeToolsWidget } from "./../widgets/TimeTools/TimeToolsWidget.js";
// import { NotesWidget } from "./../widgets/Notes/NotesWidget.js";
// import { sampleCarouselWidget } from "./../widgets/sampleCarouselWidget/sampleCarouselWidget.js";
// import { sampleImageCarouselWidget } from "./../widgets/sampleImageCarouselWidget/sampleImageCarouselWidget.js";


// const container = document.getElementById("widget-container");

// const manager = new WidgetManager(container);

// // Add widget
// const clock = new ClockWidget("w1");
// const calendar = new CalendarWidget("w2");
// const shorts = new ShortcutsWidget("w3");
// const timeTools = new TimeToolsWidget("w4");
// const notes = new NotesWidget("w5");
// const carousel = new sampleCarouselWidget("w6");
// const imageCarousel = new sampleImageCarouselWidget("w7");



// manager.addWidget(clock);
// // manager.addWidget(calendar);
// manager.addWidget(shorts);
// manager.addWidget(timeTools);
// manager.addWidget(notes);
// manager.addWidget(calendar);
// manager.addWidget(carousel);
// manager.addWidget(imageCarousel);
