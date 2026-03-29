// widgets/widget-config.js
import { ClockWidget } from "../widgets/Clock/clock.js";
import { CalendarWidget } from "../widgets/Calendar/CalendarWidget.js";
import { ShortcutsWidget } from "../widgets/Shortcuts/shortcutsWidget.js";
import { TimeToolsWidget } from "../widgets/TimeTools/TimeToolsWidget.js";
import { NotesWidget } from "../widgets/Notes/NotesWidget.js";

export function getDefaultWidgets() {
    return [
        new ClockWidget("w1"),
        new CalendarWidget("w2"),
        new ShortcutsWidget("w3"),
        new TimeToolsWidget("w4"),
        new NotesWidget("w5")
    ];
}