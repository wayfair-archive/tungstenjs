'use strict';

/**
 * Similar to BackboneViewWidget, but more simplistic
 * @param {Function} template        Template function
 * @param {Object}   data            Data to render with
 */
function DumbComponentWidget(template, data) {
  this.template = template;
  this.data = data;
}

/**
 * Type indicator for Virtual-Dom
 * @type {String}
 */
DumbComponentWidget.prototype.type = 'Widget';

/**
 * Render the view's template to DOM nodes and attach a view to it
 * @return {Element} DOM node with the child view attached
 */
DumbComponentWidget.prototype.init = function init() {
  return this.template.toDom(this.data);
};

DumbComponentWidget.prototype.nested_content = function() {
  return this;
};

var noop = function() {};
DumbComponentWidget.prototype.update = function(prev, elem) {
  elem.parentNode.replaceChild(this.template.toDom(this.data), elem);
};
DumbComponentWidget.prototype.attach = noop;
DumbComponentWidget.prototype.destroy = noop;

module.exports = DumbComponentWidget;
