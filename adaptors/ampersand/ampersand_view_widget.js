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

var logger = require('../../src/utils/logger');

/**
 * Wrapper Widget for child views
 * @param {Object}   template    Precompiled template object that represents this section
 * @param {Function} childView   Ampersand View to own this section
 * @param {Object}   context     Current rendering context
 * @param {Object}   parentView  Parent View passed to child view constructor
 */
function AmpersandViewWidget(template, childView, context, parentView) {
  this.template = template;
  this.context = context;
  this.parentView = parentView;

  if (childView.tungstenView === true) {
    // If we're using the default syntax
    // 'className': constructor
    this.ViewConstructor = childView;
    this.model = this.context.lastModel;
  } else {
    // If we're using the verbose syntax
    // 'className': { view: constructor, scope: 'scope' }
    this.ViewConstructor = childView.view;
    var scope = childView.scope;
    if (scope === '__TEMPLATE__') {
      // __TEMPLATE__ is the default scope
      // Uses the current mustache syntax as the model
      this.model = this.context.lastModel;
    } else if (scope === '__PARENT__') {
      // __PARENT__ uses the parentView's model as the childView's model
      this.model = parentView.model;
    } else if (scope) {
      // Any other value is treated as a parent model lookup
      this.model = parentView.model.getDeep(scope);
    } else {
      logger.warn('ChildView was passed as object without a scope property');
    }
  }
}

/**
 * Type indicator for Virtual-Dom
 * @type {String}
 */
AmpersandViewWidget.prototype.type = 'Widget';

/**
 * Render the view's template to DOM nodes and attach a view to it
 * @return {Element} DOM node with the child view attached
 */
AmpersandViewWidget.prototype.init = function init() {
  var elem = this.template.toDom(this.context);
  this.view = new this.ViewConstructor({
    template: this.template,
    model: this.model,
    context: this.context,
    // Since we can't attach a view to a DocumentFragment, pull out firstChild
    el: elem,
    parentView: this.parentView
  });
  return this.view.el;
};

/* develblock:start */
/**
 * Function to allow the Widget to control how it is viewed on the debug panel
 * ChildViews are displayed as a clickable link
 *
 * @return {string} Debug panel version of this widget
 */
AmpersandViewWidget.prototype.templateToString = function() {
  if (!this.view) {
    return;
  }
  var name = this.view.getDebugName();
  return '<span class="js-view-list-item u-clickable u-underlined" data-id="' + name + '">[' + name + ']</span>';
};
/* develblock:end */

/**
 * Pass through to the view's destroy method
 */
AmpersandViewWidget.prototype.destroy = function destroy() {
  if (this.view && this.view.destroy) {
    this.view.destroy();
  }
};

/**
 * Attaches the childView to the given DOM node
 * Used for initial startup where a full render and update is excessive
 * @param  {Element}            elem DOM node to act upon
 */
AmpersandViewWidget.prototype.attach = function attach(elem) {
  this.view = new this.ViewConstructor({
    el: elem,
    model: this.model,
    parentView: this.parentView,
    template: this.template
  });
};

/**
 * Updates an existing childView
 * @param  {AmpersandViewWidget} prev Widget instance from old VTree
 * @param  {Element}            elem DOM node to act upon
 */
AmpersandViewWidget.prototype.update = function update(prev, elem) {
  var vtree = null;
  // If the previous tree was instantiated, check if it's usable
  if (prev.view) {
    if (this.ViewConstructor === prev.ViewConstructor) {
      // if the two widgets have the same constructor, it's fully usable
      this.view = prev.view;
      this.view.el = elem;
      this.view.parentView = this.parentView;
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
      parentView: this.parentView,
      context: this.context,
      vtree: vtree,
      template: this.template
    });
  } else {
    // If prev.view is the same type, set the context and template
    this.view.context = this.context;
    // @TODO figure out how to compare template objects to avoid this operation
    this.view.compiledTemplate = this.template.attachView(this.view, AmpersandViewWidget);
    // Call the update model to run and updates if the model has changed
    this.view.update(this.model);
  }
};

module.exports = AmpersandViewWidget;
