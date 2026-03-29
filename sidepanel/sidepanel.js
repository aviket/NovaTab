import { WidgetHost } from "../widgets/widget-host.js";
import { getDefaultSideWidgets } from "../widgets/widget-config.js";

const widgetHost = new WidgetHost();

// register container
widgetHost.registerContainer("widget-container-side");

// mount widgets
const widgets = getDefaultSideWidgets();

widgets.forEach(widget => {
    widgetHost.mountWidget("widget-container-side", widget);
});