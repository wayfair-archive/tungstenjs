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
 * VTree representing the empty initial state used for init
 * @type {Object}
 */
var EMPTY_TREE = tungsten.parseString('<div></div>');

/**
 * Wrapper Widget for child views
 * @param {String} text    Text of comment
 */
function PortalWidget(template, view, context) {
  this.template = template;
  this.context = context;
  this.placeholder = null;
  this.el = null;
  this.vtree = null;
}

/**
 * Exports the tagName it should be wrapped by
 * @type {String}
 */
PortalWidget.tagName = 'div';

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
  var result = tungsten.updateTree(document.createElement(PortalWidget.tagName), EMPTY_TREE, this.vtree);
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
PortalWidget.prototype.update = function update(prev, elem) {
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

module.exports = PortalWidget;
