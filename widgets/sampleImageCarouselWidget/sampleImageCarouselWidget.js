// widgets/Clock/clock.js
import { BaseWidget } from "../widget-base.js";
import { createWidgetShell } from "../widget-shell.js";
import { loadCSS } from "../../utilities/loadcss.js";
import { Carousel } from "../components/Carousel/Carousel.js";


export class sampleImageCarouselWidget  extends BaseWidget {
    constructor(id, config = {}) {
        super(id, config);
    }

    // ==============================
    // Create inner content (ONLY content)
    // ==============================
    createContent() {
       // Inside some Widget class...

// 1. Initialize your existing Carousel manager
this.imageCarousel = new Carousel({
    autoPlay: true,     // Turn on the magic!
    interval: 4000      // Change slides every 4 seconds
});
const carouselDOM = this.imageCarousel.render();

// 2. Create Image 1
const img1 = document.createElement("img");
img1.src = "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba"; // Replace with your image URL or local extension path
img1.alt = "Beautiful mountain landscape";
img1.className = "carousel-image"; // We'll add some CSS to this below!

this.imageCarousel.addItem({
    id: "img_1",
    contentEl: img1
});

// 3. Create Image 2
const img3 = document.createElement("img");
img3.src = "https://picsum.photos/id/15/800/450"; // River valley
img3.alt = "River valley";
img3.className = "carousel-image";

this.imageCarousel.addItem({
    id: "img_3",
    contentEl: img3
});


// 3. Create Image 2
const img4 = document.createElement("img");
img4.src = "https://picsum.photos/id/16/800/450"; // River valley
img4.alt = "River valley";
img4.className = "carousel-image";

this.imageCarousel.addItem({
    id: "img_4",
    contentEl: img4
});

// 3. Create Image 2
const img5 = document.createElement("img");
img5.src = "https://picsum.photos/id/17/800/450"; // River valley
img5.alt = "River valley";
img5.className = "carousel-image";

this.imageCarousel.addItem({
    id: "img_5",
    contentEl: img5
});

// 3. Create Image 2
const img2 = document.createElement("img");
img2.src = "https://picsum.photos/id/14/800/450"; // River valley
img2.alt = "River valley";
img2.className = "carousel-image";

this.imageCarousel.addItem({
    id: "img_2",
    contentEl: img2
});

// 4. Load the CSS and initialize
this.imageCarousel.init();
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
            content
        });

        return this.element;
    }

    // ==============================
    // Init (after DOM mount)
    // ==============================
    init() {

    }

  
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