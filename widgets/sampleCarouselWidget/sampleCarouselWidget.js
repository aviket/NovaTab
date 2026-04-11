// widgets/sampleCarouselWidget/sampleCarouselWidget.js
import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { loadCSS } from "../../utilities/loadcss.js";
import { Carousel } from "../components/Carousel/Carousel.js";

export class sampleCarouselWidget extends BaseWidget {
  constructor(id, config = {}) {
    super(id, config);
  }

  // ==============================
  // Create inner content (ONLY content)
  // ==============================
  createContent() {
    // Inside some Widget class...

    this.carousel = new Carousel();
    const carouselDOM = this.carousel.render();

    // Create slide 1
    const slide1 = document.createElement("div");
    slide1.innerHTML = "<h1>Weather Data</h1><p>Sunny, 72°</p>";

    this.carousel.addItem({
      id: "slide_1",
      contentEl: slide1,
    });

    // Create slide 2
    const slide2 = document.createElement("div");
    slide2.innerHTML = "<h1>Stock Market</h1><p>AAPL: +2.4%</p>";

    this.carousel.addItem({
      id: "slide_2",
      contentEl: slide2,
    });

    // Don't forget to call init() to load the CSS!
    this.carousel.init();
    return carouselDOM;
  }

  // ==============================
  // Render full widget
  // ==============================
  render() {
    const content = this.createContent();

    this.element = createWidgetShell({
      id: this.id,
      title: "Sample Carousel",
      content,
    });

    return this.element;
  }

  // ==============================
  // Init (after DOM mount)
  // ==============================
  init() {}

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
