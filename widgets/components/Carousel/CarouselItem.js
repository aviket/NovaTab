// widgets/components/Carousel/CarouselItem.js
export class CarouselItem {
    constructor({ id, contentEl }) {
        this.id = id;
        this.contentEl = contentEl; // This can be ANY HTML element
        this.element = this.render();
    }

    render() {
        const wrapper = document.createElement("div");
        wrapper.className = "carousel-item";
        wrapper.dataset.id = this.id;

        // Inject the flexible content
        wrapper.appendChild(this.contentEl);

        return wrapper;
    }
}