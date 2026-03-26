import { loadCSS } from "../../../utilities/loadcss.js";
import { CarouselItem } from "./CarouselItem.js";

export class Carousel {
    constructor(config = {}) {
        this.items = []; // 🔥 We use an Array instead of a Map because order matters!
        this.currentIndex = 0;
        this.config = config;

        // 1. Create main container
        this.element = document.createElement("div");
        this.element.className = "carousel-container";

        // 2. Create the moving track
        this.track = document.createElement("div");
        this.track.className = "carousel-track";

        // 3. Create navigation buttons
        this.prevBtn = document.createElement("button");
        this.prevBtn.className = "carousel-btn prev";
        this.prevBtn.innerHTML = "❮";
        this.prevBtn.onclick = () => this.prev();

        this.nextBtn = document.createElement("button");
        this.nextBtn.className = "carousel-btn next";
        this.nextBtn.innerHTML = "❯";
        this.nextBtn.onclick = () => this.next();

        // Assemble
        this.element.appendChild(this.prevBtn);
        this.element.appendChild(this.track);
        this.element.appendChild(this.nextBtn);
    }

    render() {
        return this.element;
    }

    // Accepts the exact same structure as your Accordion!
    addItem({ id, contentEl }) {
        const item = new CarouselItem({ id, contentEl });
        this.items.push(item);
        this.track.appendChild(item.element);
        
        this._updateUI(); // Refresh buttons and position
    }

    next() {
        if (this.currentIndex < this.items.length - 1) {
            this.currentIndex++;
            this._updateUI();
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this._updateUI();
        }
    }

    // 🔥 The magic function that moves the slides
    _updateUI() {
        // Move the track left by 100% per slide index
        const offset = this.currentIndex * -100;
        this.track.style.transform = `translateX(${offset}%)`;

        // Disable buttons if we are at the very beginning or end
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.items.length - 1;

        // Hide buttons entirely if there's only 1 slide
        const showNav = this.items.length > 1;
        this.prevBtn.style.display = showNav ? 'block' : 'none';
        this.nextBtn.style.display = showNav ? 'block' : 'none';
    }

    init() {
        loadCSS("carousel-css", "widgets/components/Carousel/Carousel.css");
        this._updateUI(); // Set initial state
    }

    destroy() {
        if (this.element) this.element.remove();
    }
}