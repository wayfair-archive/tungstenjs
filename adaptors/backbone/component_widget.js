'use strict';

var _ = require('underscore');
var errors = require('../../src/utils/errors');
var modelFunctionsToMap = ['trigger', 'set', 'get', 'has', 'doSerialize', 'save', 'fetch', 'sync', 'validate', 'isValid'];
var modelFunctionsToDummy = ['on', 'off', 'listenTo'];

module.exports = ComponentWidget;

var getDummyFunction = function(fn) {
  return function() {
    // Collection._addReference will bind all events to its models
    // to avoid spamming errors about this, handle the specific case
    if (arguments.length === 3 && arguments[0] === 'all' && arguments[1] === require('./base_collection').prototype._onModelEvent) {
      return;
    }
    errors.componentFunctionMayNotBeCalledDirectly(fn);
  };
};

if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
  modelFunctionsToMap.push('getDebugName');
}

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
  this.model.isComponentModel = true;
  this.template = template;
  this._isInitializedCallbacks = [];
  this.isInitialized = false;
  this.key = key || _.uniqueId('w_component');
  this.model.session = (this.model.session || []).concat(['content', 'yield']);
  if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
    this.model._private = {
      content: true, yield: true
    };
  }

  // Start with generic model functions
  var methodsToExpose = modelFunctionsToMap;
  // Add any methods declared by the model
  if (model.exposedFunctions && _.isArray(model.exposedFunctions)) {
    methodsToExpose = methodsToExpose.concat(model.exposedFunctions);
  }
  // Add any methods declared by the component
  if (options && options.exposedFunctions && _.isArray(options.exposedFunctions)) {
    methodsToExpose = methodsToExpose.concat(options.exposedFunctions);
  }
  // dedupe
  methodsToExpose = _.uniq(methodsToExpose);

  var i, fn;
  for (i = 0; i < methodsToExpose.length; i++) {
    fn = methodsToExpose[i];
    if (typeof model[fn] === 'function') {
      if (typeof this[fn] === 'undefined') {
        this[fn] = _.bind(model[fn], model);
      } else {
        errors.cannotOverwriteComponentMethod(fn);
      }
    }
  }

  if (options && options.exposedEvents === true || model.exposedEvents === true) {
    this.exposedEvents = true;
  } else {
    this.exposedEvents = [];
    if (options && options.exposedEvents && _.isArray(options.exposedEvents)) {
      this.exposedEvents = this.exposedEvents.concat(options.exposedEvents);
    }
    if (model.exposedEvents && _.isArray(model.exposedEvents)) {
      this.exposedEvents = this.exposedEvents.concat(model.exposedEvents);
    }
    this.exposedEvents = _.uniq(this.exposedEvents);
  }

  // Other model functions should be present, but noops
  for (i = 0; i < modelFunctionsToDummy.length; i++) {
    fn = modelFunctionsToDummy[i];
    this[fn] = getDummyFunction(fn);
  }
  // Setting some values for Collection use
  this.idAttribute = 'key';
  this.attributes = model.attributes;
  this.cid = model.cid;

  if (options && options.collection) {
    // If passed a collection during construction, save a reference
    this.collection = options.collection;
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
 * Type indicator for Lookups
 * @type {String}
 */
ComponentWidget.prototype.isComponent = true;

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
  this.isInitialized = true;
  return this.view.el;
};

/**
 * Pass through to the view's destroy method
 */
ComponentWidget.prototype.destroy = function destroy() {
  if (this.view && this.view.destroy) {
    this.isInitialized = false;
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
  this.isInitialized = true;
  // If callbacks were registered for postInitialization, process them
  if (this._isInitializedCallbacks) {
    if (this.view.isInitialized) {
      this._isInitializedCallbacks.forEach((fn) => fn());
    } else {
      this.view.once('initialized', () => {
        this._isInitializedCallbacks.forEach((fn) => fn());
        this._isInitializedCallbacks.length = 0;
      });
    }
  }
};

/**
 * Binds a function to process after this view's postInitialize method
 * @param  {Function} callback
 */
ComponentWidget.prototype.waitForAttach = function(callback) {
  this._isInitializedCallbacks.push(callback);
};

/**
 * Handle for component lambdas to be updated less-expensively but less-flexibly
 * @param  {Template} tmpl Template to use as content
 */
ComponentWidget.prototype.updateContent = function updateContent(template) {
  // Attach to a fake view to avoid template wrapping or unnecessary construction
  var thisView = {
    childViews: this.ViewConstructor.prototype.childViews,
    el: false
  };
  var contentTemplate = template.attachView(thisView);

  this.model.set({
    'content': contentTemplate,
    'yield': template
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

if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
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
    return '<span class="js-view-list-item u-clickable u-underlined" data-id="' + name + '">[' + name + ']</span>';
  };
}
