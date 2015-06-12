/**
 * Widget wrapper for Child Views
 * Widgets in Virtual-Dom have three lifecycle methods: init, update, destroy
 *
 * 'init' is called when the new VTree contains a widget that the old VTree does not
 * 'update' is called when the old and the new VTree contains a widget at the same position
 * 'destroy' is called when the old VTree contains a widget that the new VTree does not
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */

'use strict';

var _ = require('underscore');
var logger = require('../../src/utils/logger');

/**
 * Wrapper Widget for child views
 * @param {Object}   template    Precompiled template object that represents this section
 * @param {Function} childView   Backbone View to own this section
 * @param {Object}   context     Current rendering context
 * @param {Object}   parentView  Parent View passed to child view constructor
 */
function BackboneFluxViewWidget(template, childView, context, parentView) {
  this.template = template;
  this.context = context;
  this.parentView = parentView;

  if (!(childView.view && childView.view.tungstenView === true && childView.scope)) {
    logger.warn('ChildView was not passed as object with view and scope properties.', childView);
  } else {
    // If we're using the verbose syntax
    // 'className': { view: constructor, scope: 'scope' }
    this.ViewConstructor = childView.view;
    var scope = childView.scope;
    if (scope) {
      var ctx = this.context;
      // Back up the context tree until we hit our parent's model or an iterator item
      while (ctx && ctx !== parentView.model && !ctx.isIterator && ctx.parent) {
        ctx = ctx.parent;
      }
      var model = {};
      _.each(scope, function(key) {
        if (key.indexOf(':') > -1) {
          var keyParts = key.split(':');
          model[keyParts[1]] = ctx.lookup(keyParts[0]);
        } else {
          model[key] = ctx.lookup(key);
        }
      });
      this.model = model;
    }
  }
}

/**
 * Type indicator for Virtual-Dom
 * @type {String}
 */
BackboneFluxViewWidget.prototype.type = 'Widget';

/**
 * Render the view's template to DOM nodes and attach a view to it
 * @return {Element} DOM node with the child view attached
 */
BackboneFluxViewWidget.prototype.init = function init() {
  // toDom returns a DocumentFragment with one child node
  var docFrag = this.template.toDom(this.context);
  this.view = new this.ViewConstructor({
    template: this.template,
    model: this.model,
    context: this.context,
    // Since we can't attach a view to a DocumentFragment, pull out firstChild
    el: docFrag.childNodes[0],
    parentView: this.parentView
  });
  return this.view.el;
};

/**
 * Pass through to the view's destroy method
 */
BackboneFluxViewWidget.prototype.destroy = function destroy() {
  if (this.view && this.view.destroy) {
    this.view.destroy();
  }
};

/**
 * Updates an existing childView
 * @param  {BackboneFluxViewWidget} prev Widget instance from old VTree
 * @param  {Element}            elem DOM node to act upon
 */
BackboneFluxViewWidget.prototype.update = function update(prev, elem) {
  var vtree = null;
  var template = null;
  // If the previous tree was instantiated, check if it's usable
  if (prev.view) {
    if (this.ViewConstructor === prev.ViewConstructor) {
      // if the two widgets have the same constructor, it's fully usable
      this.view = prev.view;
      this.view.setElement(elem);
      this.view.parentView = this.parentView;
    } else {
      // if they are different, destroy the old one to remove events
      vtree = prev.view.vtree;
      prev.destroy();
    }
    template = prev.template;
  }

  // If the view for this instance isn't created, we need to make one
  if (!this.view) {
    // initialize with previous model so previous vtree is created
    this.view = new this.ViewConstructor({
      el: elem,
      model: prev.model,
      parentView: this.parentView,
      vtree: vtree,
      template: template || this.template
    });
  }

  // Call the update model to run and updates if the model has changed
  this.view.context = this.context;
  this.view.update(this.model, this.template);
};

module.exports = BackboneFluxViewWidget;
