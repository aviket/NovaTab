# 🚀 NovaTab - Customizable New Tab Extension

NovaTab is a modern, extensible browser new tab experience built with a modular widget system.  
It allows users to personalize their dashboard with interactive widgets, utilities, and quick tools — all in a clean and flexible UI.

---

## ✨ Features

### 🧩 Extensible Widget System
NovaTab is built around a powerful widget architecture.

- Widgets are **independent, self-contained modules**
- Easily add, remove, or extend widgets without affecting others
- Each widget follows a consistent lifecycle (`render → init → destroy`)
- Managed centrally via a Widget Manager system :contentReference[oaicite:0]{index=0}

#### Current Widgets
- 🕒 Clock
- 📅 Calendar
- 🔗 Shortcuts (with import/export support)
- ⏱️ Time Tools (Stopwatch & Countdown)
- 📝 Notes (rich text editor with accordion UI)

The system is designed so developers can **plug in new widgets with minimal effort**.

---

### 🧠 Smart Storage Strategy
NovaTab uses a hybrid storage approach:

- `chrome.storage.sync` → for settings (lightweight, synced across devices)
- `chrome.storage.local` → for larger data like notes (HTML content) :contentReference[oaicite:1]{index=1}

This ensures:
- ⚡ Performance
- ☁️ Sync where needed
- 📦 Efficient handling of large data

---

### 🎛️ Side Panel Integration
NovaTab includes a lightweight side panel for quick actions and future extensibility.

- Designed as a **control surface / utility panel**
- Can be extended to include:
  - Quick settings
  - Widget toggles
  - Contextual tools

(Current implementation is minimal and evolving) :contentReference[oaicite:2]{index=2}

---

### 🎨 Customization & Settings
- Theme switching (light/dark)
- Search engine selection
- Configurable UI behavior
- API key integration support (e.g., maps, weather)

Settings are persisted and loaded dynamically :contentReference[oaicite:3]{index=3}

---

### 🔍 Built-in Search
- Supports multiple engines (Google, Bing, DuckDuckGo)
- Quick search directly from the new tab
- Configurable default engine :contentReference[oaicite:4]{index=4}

---

## 🏗️ Architecture Overview

```mermaid
classDiagram

%% ======================
%% CORE BASE
%% ======================
class BaseWidget {
  +id
  +config
  +element
  +render()
  +init()
  +destroy()
}

%% ======================
%% MANAGER
%% ======================
class WidgetManager {
  -container
  -widgets : Map
  +addWidget(widget)
  +removeWidget(id)
}

WidgetManager --> BaseWidget : manages

%% ======================
%% WIDGET SHELL (UTILITY)
%% ======================
class createWidgetShell {
  <<function>>
}

BaseWidget ..> createWidgetShell : uses

%% ======================
%% WIDGETS
%% ======================
class ClockWidget {
  -animationFrameId
  +createContent()
  +render()
  +init()
  +destroy()
}

class CalendarWidget {
  -viewDate
  +createContent()
  +render()
  +init()
}

class ShortcutsWidget {
  -data
  -STORAGE_KEY
  +render()
  +init()
  +loadData()
  +saveData()
}

class TimeToolsWidget {
  -swInterval
  -cdInterval
  +render()
  +init()
  +destroy()
}

class NotesWidget {
  -accordion
  +render()
  +init()
  +addNote()
}

%% Inheritance
BaseWidget <|-- ClockWidget
BaseWidget <|-- CalendarWidget
BaseWidget <|-- ShortcutsWidget
BaseWidget <|-- TimeToolsWidget
BaseWidget <|-- NotesWidget

%% ======================
%% ACCORDION SYSTEM
%% ======================
class Accordion {
  -items : Map
  +addItem()
  +removeItem()
  +toggleItem()
}

class AccordionItem {
  -id
  -title
  -isOpen
  +toggle()
  +open()
  +close()
}

class NotesAccordion {
  +createEditableNote()
}

Accordion --> AccordionItem : contains
NotesAccordion --|> Accordion

NotesWidget --> NotesAccordion : uses

%% ======================
%% STORAGE
%% ======================
class Storage {
  +getSettings()
  +saveSettings()
  +getNotes()
  +saveNotes()
}

NotesWidget ..> Storage : uses
ShortcutsWidget ..> Storage : uses (chrome.storage)

%% ======================
%% UTILITIES
%% ======================
class loadCSS {
  <<function>>
}

BaseWidget ..> loadCSS
```
