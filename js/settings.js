// js/settings.js
import { getSettings, saveSettings } from "./storage.js";

const form = document.getElementById("settings-form");

// Load settings
async function load() {
  const settings = await getSettings();

  // GENERAL
  document.querySelector(
    `input[name="theme"][value="${settings.general?.theme || "light"}"]`,
  ).checked = true;
  document.getElementById("openSearchInNewTab").checked =
    settings.general?.openSearchInNewTab || false;

  // SEARCH
  document.getElementById("defaultEngine").value =
    settings.search?.defaultEngine || "google";
  document.getElementById("customEngines").value =
    settings.search?.customEngines || "";

  // API
  document.getElementById("googleMaps").value =
    settings.apiKeys?.googleMaps || "";
  document.getElementById("openWeather").value =
    settings.apiKeys?.openWeather || "";

  // UI
  document.getElementById("showClock").checked =
    settings.ui?.showClock || false;
  document.getElementById("compactMode").checked =
    settings.ui?.compactMode || false;
}

// Save settings
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const settings = {
    general: {
      theme: document.querySelector('input[name="theme"]:checked').value,
      openSearchInNewTab: document.getElementById("openSearchInNewTab").checked,
    },
    search: {
      defaultEngine: document.getElementById("defaultEngine").value,
      customEngines: document.getElementById("customEngines").value,
    },
    apiKeys: {
      googleMaps: document.getElementById("googleMaps").value,
      openWeather: document.getElementById("openWeather").value,
    },
    ui: {
      showClock: document.getElementById("showClock").checked,
      compactMode: document.getElementById("compactMode").checked,
    },
  };

  await saveSettings(settings);

  alert("Settings saved ✅");
});

load();
