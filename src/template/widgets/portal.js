/**
 * Widget wrapper for Portals
 * Widgets in Virtual-Dom have three lifecycle methods: init, update, destroy
 * 'init' is called when the new VTree contains a widget that the old VTree does not
 * 'update' is called when the old and the new VTree contains a widget at the same position
 * 'destroy' is called when the old VTree contains a widget that the new VTree does not
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */

'use strict';
var document = require('global/document');
var _ = require('underscore');
var tungsten = require('tungstenjs')._core;

/**
 * The tagName it should be wrapped by
 * @type {String}
 */
var tagName = 'div';

/**
 * Wrapper Widget for child views
 * @param {String} text    Text of comment
 */
function PortalWidget(template, view, context, parentView) {
  this.template = template;
  this.template.view = parentView;
  this.context = context;
  // In case we need DOM events to bubble out of the portal
  // Change eventCore's bubbling to allow for a custom function/property
  // aside from parentNode that can link this.el to this.placeholder
  this.placeholder = null;
  this.el = null;
  this.vtree = null;
}

/**
 * Maps the Section tag into an element wrapper
 * @param  {Object} template Original template rooted at section
 * @return {Object}          Template for widget
 */
PortalWidget.getTemplate = function(template) {
  return {
    t: 7,
    e: tagName,
    f: template.f,
    a: {
      'class': 'portal_output'
    }
  };
};

/**
 * Type indicator for Virtual-Dom
 * @type {String}
 */
PortalWidget.prototype.type = 'Widget';

/**
 * Render the view's template to DOM nodes and attach a view to it
 * @return {Element} DOM node with the child view attached
 */
PortalWidget.prototype.init = function init() {
  this.id = _.uniqueId('w_portal');
  this.vtree = this.template.toVdom(this.context);
  var emptyTree = tungsten.parseString('<' + tagName + '></' + tagName + '>');
  var result = tungsten.updateTree(document.createElement(tagName), emptyTree, this.vtree);
  this.el = result.elem;
  this.el.id = this.id;
  document.body.appendChild(this.el);

  // Placeholder always uses span
  this.placeholder = document.createElement('span');
  // Adding class in case spans are styled in some fashion
  this.placeholder.className = 'portal_placeholder';
  this.placeholder.setAttribute('data-id', this.id);
  return this.placeholder;
};

/**
 * Updates an existing Portal
 * @param  {PortalWidget} prev Widget instance from old VTree
 * @param  {Element}      elem DOM node to act upon
 */
PortalWidget.prototype.update = function update(prev) {
  this.id = prev.id;
  this.el = prev.el;
  this.placeholder = prev.placeholder;

  var result = tungsten.updateTree(this.el, prev.vtree, this.template.toVdom(this.context));
  this.vtree = result.vtree;
};

/**
 * Destroys the portal
 */
PortalWidget.prototype.destroy = function destroy() {
  this.el.parentNode.removeChild(this.el);
};

/**
 * Attaches the Portal to the given DOM node
 * Used for initial startup where a full render and update is excessive
 * @param  {Element} elem DOM node to act upon
 */
PortalWidget.prototype.attach = function attach(elem) {
  this.placeholder = elem;
  this.id = elem.getAttribute('data-id');
  this.el = document.getElementById(this.id);
  this.vtree = this.template.toVdom(this.context);
};
/**
 * Function to allow the Widget to control how it is viewed on the debug panel
 * ChildViews are displayed as a clickable link
 *
 * @param {Function} recurse Function to render child nodes
 *
 * @return {string} Debug panel version of this widget
 */
PortalWidget.prototype.templateToString = function(recurse) {
  return '&lt;<span class="TemplateString_tag">Portal</span>&gt;' +
    recurse(this.vtree, this.el) +
  '&lt;/<span class="TemplateString_tag">Portal</span>&gt;';
};

/**
 * Function to allow the Widget to control how its DOM/VDOM diff is computed
 *
 * @param  {Element}  elem    DOM node being diffed
 * @param  {Function} recurse Function to compute child diff
 *
 * @return {String}
 */
PortalWidget.prototype.diff = function(elem, recurse) {
  var templateStr = this.templateToString(recurse);
  if (elem === this.placeholder) {
    return templateStr;
  } else {
    return '<del>' + templateStr + '</del>' + recurse(null, elem);
  }
};

module.exports = PortalWidget;
