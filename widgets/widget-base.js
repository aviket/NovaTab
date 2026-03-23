export class BaseWidget {
    constructor(id, config = {}) {
        this.id = id;
        this.config = config;
        this.element = null;
    }

    // Create DOM
    render() {
        throw new Error("render() must be implemented");
    }

    // After DOM added
    init() {}

    // Cleanup
    destroy() {
        if (this.element) {
            this.element.remove();
        }
    }
}