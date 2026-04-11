import { loadScript } from "../loadscript.js";
import { loadCSS } from "../loadcss.js";
class TooltipManager {
  constructor() {
    // loadCSS( "tooltip" , "utilities\TooltipManager\TooltipManager.css");
    this.el = document.createElement("div");
    this.el.className = "custom-tooltip";
    this.el.style.position = "fixed";
    this.el.style.pointerEvents = "none";
    this.el.style.zIndex = "9999";
    this.el.style.display = "none";

    document.body.appendChild(this.el);
  }

  show(html, x, y) {
    loadCSS("tooltip", "utilities\TooltipManager\TooltipManager.css");
    this.el.innerHTML = html;
    this.el.style.left = x + 12 + "px";
    this.el.style.top = y + 12 + "px";

    this.el.style.display = "block";
    this.el.style.opacity = "1";
    this.el.style.visibility = "visible";

    // // console.log("Tooltip display:", this.el.style.display);
  }

  move(x, y) {
    this.el.style.left = x + 12 + "px";
    this.el.style.top = y + 12 + "px";
  }

  hide() {
    this.el.style.display = "none";
  }
}

export const tooltipManager = new TooltipManager();
