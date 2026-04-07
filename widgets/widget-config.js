// widgets/widget-config.js
import { ClockWidget } from "../widgets/Clock/clock.js";
import { CalendarWidget } from "../widgets/Calendar/CalendarWidget.js";
import { ShortcutsWidget } from "../widgets/Shortcuts/shortcutsWidget.js";
import { TimeToolsWidget } from "../widgets/TimeTools/TimeToolsWidget.js";
import { NotesWidget } from "../widgets/Notes/NotesWidget.js";
import { sampleImageCarouselWidget } from "../widgets/sampleImageCarouselWidget/sampleImageCarouselWidget.js";
import { TextExpandarWidget } from "../widgets/TextExpandar/textExpandarWidget.js";

export function getDefaultWidgets() {
    return [
        new ClockWidget("w1"),
        new CalendarWidget("w2"),
        new ShortcutsWidget("w3"),
        new TimeToolsWidget("w4"),
        new NotesWidget("w5"),
        new sampleImageCarouselWidget("w6"),
        new TextExpandarWidget("w7")
    ];
}

export function getDefaultSideWidgets() {
    return [
        new ClockWidget("ws1"),
        new TextExpandarWidget("ws3"),
        // new CalendarWidget("w2"),
        // new ShortcutsWidget("w3"),
        // new TimeToolsWidget("w4"),
        new NotesWidget("ws2")
    ];
}