// widgets/sampleImageCarouselWidget/sampleImageCarouselWidget.js
import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { loadCSS } from "../../utilities/loadcss.js";
import { Carousel } from "../components/Carousel/Carousel.js";

// ==========================================
// 📄 THE JSON DATA
// You can easily swap this out to read from chrome.storage later!
// ==========================================
const CAROUSEL_DATA = [
  { src: "https://picsum.photos/id/15/800/450", alt: "River valley" },
  // { src: "assets/images/local-test.jpg", alt: "A Local Extension Image" }, // 🔥 Local Image Example!
  // { src: "https://this-website-is-fake.com/broken.jpg", alt: "Broken Image" }, // ❌ This will be automatically skipped!
  { src: "https://picsum.photos/id/16/800/450", alt: "Coastal rocks" },
  { src: "https://picsum.photos/id/17/800/450", alt: "Forest path" },
];

export class sampleImageCarouselWidget extends BaseWidget {
  constructor(id, config = {}) {
    super(id, config);
  }

  // ==============================
  // Create inner content (Synchronous)
  // ==============================
  createContent() {
    // 1. Initialize an EMPTY Carousel manager
    this.imageCarousel = new Carousel({
      autoPlay: true,
      interval: 4000,
    });

    // Return the empty track immediately so the UI doesn't freeze
    return this.imageCarousel.render();
  }

  // ==============================
  // Render full widget
  // ==============================
  render() {
    const content = this.createContent();

    this.element = createWidgetShell({
      id: this.id,
      title: "Data-Driven Carousel",
      content,
    });

    return this.element;
  }

  // ==============================
  // Init (Asynchronous - after DOM mount)
  // ==============================
  async init() {
    // Initialize the carousel engine and CSS
    this.imageCarousel.init();

    // Loop through our JSON data
    for (let i = 0; i < CAROUSEL_DATA.length; i++) {
      const data = CAROUSEL_DATA[i];

      // 🔥 Check if the image actually exists before adding it!
      const isValid = await this.preloadImage(data.src);

      if (isValid) {
        // Image is good! Build it and add it to the carousel.
        const img = document.createElement("img");
        img.src = data.src;
        img.alt = data.alt;
        img.className = "carousel-image";

        this.imageCarousel.addItem({
          id: `img_${i}`,
          contentEl: img,
        });
      } else {
        // Image is broken! Log it and skip it.
        console.warn(`[Carousel] Image failed to load, skipping: ${data.src}`);
      }
    }
  }

  // ==============================
  // Helper: Validates an image URL
  // ==============================
  preloadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      // If it successfully downloads, resolve true
      img.onload = () => resolve(true);
      // If it hits a 404 or fails, resolve false
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  // ==============================
  // Cleanup
  // ==============================
  destroy() {
    // Crucial: We must destroy the carousel to stop its autoPlay timer!
    if (this.imageCarousel) {
      this.imageCarousel.destroy();
    }

    super.destroy();
  }
}
