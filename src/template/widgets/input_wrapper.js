/**
 * Widget wrapper for HTML Comment
 * Widgets in Virtual-Dom have three lifecycle methods: init, update, destroy
 * 'init' is called when the new VTree contains a widget that the old VTree does not
 * 'update' is called when the old and the new VTree contains a widget at the same position
 * 'destroy' is called when the old VTree contains a widget that the new VTree does not
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */

'use strict';
var document = require('global/document');
var tungsten = require('../../tungsten');
var _ = require('underscore');

var addListener, removeListener;
if (document.addEventListener) {
  addListener = function(el, type, handler) {
    el.addEventListener(type, handler, true);
  };
  removeListener = function(el, type, handler) {
    el.removeEventListener(type, handler, true);
  };
} else {
  addListener = function(el, type, handler) {
    el.attachEvent('on' + type, handler);
  };
  removeListener = function(el, type, handler) {
    el.detachEvent('on' + type, handler);
  };
}

/**
 * Any given element only has one property that user input can adjust
 * This returns the property for the input element
 * @param  {Element} elem The element to check
 * @return {string}
 */
function getRelevantPropertyForElement(elem) {
  var property = 'value';

  var tagName = elem.tagName.toUpperCase();
  if (tagName === 'INPUT') {
    var type = elem.type.toUpperCase();
    if (type === 'CHECKBOX' || type === 'RADIO') {
      property = 'checked';
    }
  }
  return property;
}

/**
 * Wrapper Widget for child views
 * @param {Object}   template    Precompiled template object that represents this section
 * @param {Function} childView   Backbone View to own this section
 * @param {Object}   context     Current rendering context
 * @param {Object}   parentView  Parent View passed to child view constructor
 * @param {Object}   OtherWidget Parent View passed to child view constructor
 */
function InputWrapperWidget(template, childView, context, parentView, OtherWidget) {
  this.template = template;
  this.context = context;
  this.updateValue = _.bind(this.updateValue, this);
  if (OtherWidget) {
    template.templateObj.input_wrapper = true;
    this.otherWidget = new OtherWidget(template, childView, context, parentView);
    this.view = this.otherWidget.view;
  }
}

/**
 * Type indicator for Virtual-Dom
 * @type {String}
 */
InputWrapperWidget.prototype.type = 'Widget';

/**
 * Render the view's template to DOM nodes and attach a view to it
 * @return {Element} DOM node with the child view attached
 */
InputWrapperWidget.prototype.init = function init() {
  var el;
  if (this.otherWidget) {
    el = this.otherWidget.init();
    this.view = this.otherWidget.view;
  } else {
    this.vtree = this.template.toVdom(this.context);
    el = this.template.toDom(this.context);
  }
  this.el = el;
  this.bindListeners();
  return el;
};

/**
 * Updates an existing childView
 * @param  {BackboneViewWidget} prev Widget instance from old VTree
 * @param  {Element}            elem DOM node to act upon
 */
InputWrapperWidget.prototype.update = function update(prev, elem) {
  this.el = elem;
  prev.unbindListeners();
  this.bindListeners();
  var prop = getRelevantPropertyForElement(this.el);

  this.vtree = this.template.toVdom(this.context);
  var prevVtree;
  if (this.otherWidget) {
    prevVtree = prev.otherWidget.getVtree();
  } else {
    prevVtree = prev.vtree;
  }

  /*
   !DOM & !VDOM => NOOP
    DOM & !VDOM => NOOP
   !DOM &  VDOM => DOM->VDOM
    DOM &  VDOM => DOM->VDOM
  */

  if (prevVtree.properties[prop] !== this.vtree.properties[prop]) {
    // If the DOM changed AND the VDOM changed, assume the VDOM will be right
    prevVtree.properties[prop] = prev.value;
  } else if (prev.value != null && prop === 'checked') {
    // update the compared value to the current DOM value (as that's what it should represent)
    prevVtree.properties[prop] = prev.value;
  }

  if (this.otherWidget) {
    this.otherWidget.update(prev.otherWidget, elem);
    this.view = this.otherWidget.view;
  } else {
    tungsten.updateTree(elem, prevVtree, this.vtree);
  }
};

/**
 * Pass through to the view's destroy method
 */
InputWrapperWidget.prototype.destroy = function destroy(prev, elem) {
  this.el = elem;
  this.unbindListeners();
  if (this.otherWidget) {
    this.otherWidget.destroy(prev, elem);
  }
};

/**
 * Attaches the childView to the given DOM node
 * Used for initial startup where a full render and update is excessive
 * @param  {Element}            elem DOM node to act upon
 */
InputWrapperWidget.prototype.attach = function attach(elem) {
  this.el = elem;
  if (this.otherWidget) {
    this.otherWidget.attach(elem);
    this.view = this.otherWidget.view;
  } else {
    this.vtree = this.template.toVdom(this.context);
  }
  this.bindListeners();
};

InputWrapperWidget.prototype.updateValue = function() {
  var prop = getRelevantPropertyForElement(this.el);
  this.value = this.el[prop];
};

var eventsToListenOn = ['keyup', 'change', 'input'];

InputWrapperWidget.prototype.bindListeners = function() {
  _.each(eventsToListenOn, (evt) => {
    addListener(this.el, evt, this.updateValue);
  });
};

InputWrapperWidget.prototype.unbindListeners = function() {
  _.each(eventsToListenOn, (evt) => {
    removeListener(this.el, evt, this.updateValue);
  });
};

InputWrapperWidget.prototype.templateToString = function(recurse) {
  if (this.otherWidget) {
    return this.otherWidget.templateToString(recurse);
  } else {
    return recurse(this.vtree, this.el);
  }
};

InputWrapperWidget.wrapExistingWidget = function(OtherWidgetConstructor) {
  return function(template, childView, context, parentView) {
    return new InputWrapperWidget(template, childView, context, parentView, OtherWidgetConstructor);
  };
};

module.exports = InputWrapperWidget;
