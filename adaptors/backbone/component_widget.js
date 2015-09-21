'use strict';

/**
 * Similar to BackboneViewWidget, but more simplistic
 * @param {Function} ViewConstructor Constructor function for the view
 * @param {Object}   model           Model data
 * @param {Function} template        Template function
 * @param {String}   key             VDom Key
 */
function ComponentWidget(ViewConstructor, model, template, key) {
  this.ViewConstructor = ViewConstructor;
  this.model = model;
  this.template = template;
  this.key = key;
}

/**
 * Type indicator for Virtual-Dom
 * @type {String}
 */
ComponentWidget.prototype.type = 'Widget';

/**
 * Render the view's template to DOM nodes and attach a view to it
 * @return {Element} DOM node with the child view attached
 */
ComponentWidget.prototype.init = function init() {
  // toDom returns a DocumentFragment with one child node
  var docFrag = this.template.toDom(this.model);
  this.view = new this.ViewConstructor({
    template: this.template,
    model: this.model,
    // Since we can't attach a view to a DocumentFragment, pull out firstChild
    el: docFrag.childNodes[0]
  });
  return this.view.el;
};

/**
 * Pass through to the view's destroy method
 */
ComponentWidget.prototype.destroy = function destroy() {
  if (this.view && this.view.destroy) {
    this.view.destroy();
  }
};

/**
 * Attaches the childView to the given DOM node
 * Used for initial startup where a full render and update is excessive
 * @param  {Element}            elem DOM node to act upon
 */
ComponentWidget.prototype.attach = function attach(elem) {
  this.view = new this.ViewConstructor({
    el: elem,
    model: this.model,
    template: this.template
  });
};

/**
 * Updates an existing childView
 * @param  {ComponentWidget} prev Widget instance from old VTree
 * @param  {Element}         elem DOM node to act upon
 */
ComponentWidget.prototype.update = function update(prev, elem) {
  var vtree = null;
  // If the previous tree was instantiated, check if it's usable
  if (prev.view) {
    if (this.ViewConstructor === prev.ViewConstructor) {
      // if the two widgets have the same constructor, it's fully usable
      this.view = prev.view;
      this.view.setElement(elem);
    } else {
      // if they are different
      //   save the vtree off so we can diff against what's on the DOM
      vtree = prev.view.vtree;
      //   and destroy the old one to remove events
      prev.destroy();
    }
  }

  // If the view for this instance isn't created, we need to make one
  if (!this.view) {
    // Pass in vtree from previous view, if available
    // Constructing the view automatically calls render
    this.view = new this.ViewConstructor({
      el: elem,
      model: this.model,
      vtree: vtree,
      template: this.template
    });
  } else {
    // Call the update model to run and updates if the model has changed
    this.view.update(this.model);
  }
};

module.exports = ComponentWidget;
