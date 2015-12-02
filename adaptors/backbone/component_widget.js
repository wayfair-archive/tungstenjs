'use strict';

var _ = require('underscore');

var modelFunctionsToMap = ['trigger', 'set', 'get', 'has', 'doSerialize'];
var modelFunctionsToDummy = ['on', 'off', 'listenTo'];

/**
 * Similar to BackboneViewWidget, but more simplistic
 * @param {Function} ViewConstructor Constructor function for the view
 * @param {Object}   model           Model data
 * @param {Function} template        Template function
 * @param {Object}   options         Options object from set call
 * @param {String}   key             VDom Key
 */
function ComponentWidget(ViewConstructor, model, template, options, key) {
  this.ViewConstructor = ViewConstructor;
  this.model = model;
  this.template = template;
  this.key = key || _.uniqueId('w_component');

  var i, fn;
  // Map generic model functions up to the component
  for (i = 0; i < modelFunctionsToMap.length; i++) {
    fn = modelFunctionsToMap[i];
    if (typeof model[fn] === 'function') {
      this[fn] = _.bind(model[fn], model);
    }
  }

  // Other model functions should be present, but noops
  for (i = 0; i < modelFunctionsToDummy.length; i++) {
    fn = modelFunctionsToDummy[i];
    this[fn] = _.noop;
  }
  // Setting some values for Collection use
  this.idAttribute = 'key';
  this.attributes = model.attributes;
  this.cid = model.cid;

  if (options) {
    // If passed a collection during construction, save a reference
    if (options.collection) {
      this.collection = options.collection;
    }
    // If passed an array of functions, publicly expose those
    if (options.modelFunctions && options.modelFunctions.length) {
      for (i = 0; i < options.modelFunctions.length; i++) {
        fn = options.modelFunctions[i];
        if (typeof model[fn] === 'function') {
          this[fn] = _.bind(model[fn], model);
        }
      }
    }
  }

  // Ensure that destroying the model destroys the component
  if (typeof this.model.destroy === 'function') {
    var self = this;
    var _destroy = _.bind(this.model.destroy, this.model);
    this.model.destroy = function(opts) {
      if (self.collection) {
        self.collection.remove(self);
      } else if (self.parent) {
        self.parent.unset(self.parentProp);
      }
      _destroy(opts);
    };
  }
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
  this.view = new this.ViewConstructor({
    template: this.template,
    model: this.model,
    dynamicInitialize: true,
    isComponentView: true
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
    template: this.template,
    isComponentView: true
  });
};

/**
 * Updates an existing childView;  should not be possible with
 * components since they're standalone
 */
ComponentWidget.prototype.update = _.noop;

ComponentWidget.isComponent = function(obj) {
  if (obj && obj.type === ComponentWidget.prototype.type && obj.model && obj.model.tungstenModel) {
    return true;
  }
  return false;
};

/* develblock:start */
/**
 * Function to allow the Widget to control how it is viewed on the debug panel
 * ChildViews are displayed as a clickable link
 *
 * @return {string} Debug panel version of this widget
 */
ComponentWidget.prototype.templateToString = function() {
  if (!this.view) {
    return;
  }
  var name = this.view.getDebugName();
  return '<span class="js-view-list-item clickable-property" data-id="' + name + '">[' + name + ']</span>';
};
/* develblock:end */

module.exports = ComponentWidget;
