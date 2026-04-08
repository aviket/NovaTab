export class JsTreeAdapter {
  constructor( selector ,  $) {
    if (!$) {
      throw new Error("jQuery not loaded");
    }
    this.$el = $(selector);
  }

  getInstance() {
    return this.$el.jstree(true);
  }

  init(config) {
    this.$el.jstree(config);
  }

  on(event, handler) {
    this.$el.on(event, handler);
  }

  destroy() {
    this.$el.jstree("destroy");
  }
}