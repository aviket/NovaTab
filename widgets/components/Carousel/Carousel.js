import { loadCSS } from "../../../utilities/loadcss.js";
import { CarouselItem } from "./CarouselItem.js";

export class Carousel {
    constructor(config = {}) {
        this.items = []; // 🔥 We use an Array instead of a Map because order matters!
        this.currentIndex = 0;
        // 🔥 1. Add autoPlay settings to the default config
        this.config = {
            autoPlay: false,
            interval: 3000,      // Default to 3 seconds
            pauseOnHover: true,  // Good UX: Stop sliding if the user is hovering
            ...config
        };

        this.autoPlayTimer = null;

        // 1. Create main container
        this.element = document.createElement("div");
        this.element.className = "carousel-container";

        // 🔥 2. Pause on Hover Logic
        if (this.config.pauseOnHover) {
            this.element.addEventListener("mouseenter", () => this.stopAutoPlay());
            this.element.addEventListener("mouseleave", () => this.startAutoPlay());
        }

        // 2. Create the moving track
        this.track = document.createElement("div");
        this.track.className = "carousel-track";

        // 3. Create navigation buttons
        this.prevBtn = document.createElement("button");
        this.prevBtn.className = "carousel-btn prev";
        this.prevBtn.innerHTML = "❮";
        this.prevBtn.onclick = () => {
            this.prev();
            this.resetAutoPlay(); // Reset timer if user manually clicks
        };  

        this.nextBtn = document.createElement("button");
        this.nextBtn.className = "carousel-btn next";
        this.nextBtn.innerHTML = "❯";
        this.nextBtn.onclick = () => {
            this.next();
            this.resetAutoPlay(); // Reset timer if user manually clicks
        };

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

// 🔥 3. Upgraded to support Infinite Looping
    next() {
        if (this.currentIndex < this.items.length - 1) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0; // Loop back to the start!
        }
        this._updateUI();
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else {
            this.currentIndex = this.items.length - 1; // Loop to the end!
        }
        this._updateUI();
    }

    // ==========================================
    // 🔥 AUTO-PLAY LOGIC
    // ==========================================

    startAutoPlay() {
        // Don't start if turned off, or if there's only 1 slide
        if (!this.config.autoPlay || this.items.length <= 1) return;

        this.stopAutoPlay(); // Clear any existing timers just to be safe

        this.autoPlayTimer = setInterval(() => {
            this.next();
        }, this.config.interval);
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    resetAutoPlay() {
        if (this.config.autoPlay) {
            this.stopAutoPlay();
            this.startAutoPlay();
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
        this.startAutoPlay(); // Start auto-play if enabled
    }

    destroy() {
        this.stopAutoPlay();
        if (this.element) this.element.remove();
    }
}