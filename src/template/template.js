/**
 * Template constructor
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */
'use strict';

var _ = require('underscore');
var ractiveAdaptor = require('./ractive_adaptor');
var Context = require('./template_context');

/**
 * Hash of registered partials
 * @type {Object}
 */
var registeredPartials = {};

var Template = function(templateObj, partials, view, context) {
  this.templateObj = templateObj;
  this.partials = partials;
  this.view = view;
  this.context = context;
};

Template.prototype.type = 'Template';

Template.prototype.getPartials = function() {
  return this.partials || registeredPartials;
};

Template.prototype.setPartials = function(partials) {
  this.partials = partials;
};

/**
 * Registers a template as a named partial
 * @param  {String} partialName Name to register the partial as
 */
Template.prototype.register = function(partialName) {
  registeredPartials[partialName] = this.templateObj;
};

Template.prototype._iterate = function(template, data, view, partials, stack) {
  var context = (data && data.constructor && data instanceof Context) ? data : new Context(data);
  // If the template has declared context, ensure that it is within lookup scope but prioritize passed data
  if (this.context) {
    context = this.context.push(context);
  }
  ractiveAdaptor.render(
    stack,
    template || this.templateObj,
    context,
    partials || registeredPartials,
    view
  );
};
Template.prototype._render = function(template, data, view, partials, stack) {
  this._iterate(template, data, view, partials, stack);
  return stack.getOutput();
};

/**
 * Outputs the template to a HTML string
 * @param  {Object} data Model to render the template with
 * @return {String}      HTML string of the rendered template
 */
Template.prototype.toString = function(data) {
  var templateToRender = this.templateObj.wrapped ? this.templateObj.f : this.templateObj;
  var ToHtmlString = require('./stacks/html_string');
  return this._render(templateToRender, data, null, this.partials, new ToHtmlString());
};
/**
 * Outputs the template to a DocumentFragment
 * @param  {Object} data Model to render the template with
 * @return {Object}      DocumentFragment containing the template's DOM nodes
 */
Template.prototype.toDom = function(data) {
  var templateToRender = this.templateObj.wrapped ? this.templateObj.f : this.templateObj;
  var ToDom = require('./stacks/dom');
  return this._render(templateToRender, data, null, this.partials, new ToDom());
};
/**
 * Outputs the template to a VirtualTree
 * @param  {Object} data  Model to render the template with
 * @return {Object}       VirtualTree representing the template
 */
Template.prototype.toVdom = function(data) {
  var ToVdom = require('./stacks/vdom');
  return this._render(this.templateObj, data, this.view, this.partials, new ToVdom());
};

/**
 * Wrap the template in a given tag, defaulting to <div>
 * @param  {String} tagName Tag name to wrap the template in
 * @return {Object}         Wrapped template
 */
Template.prototype.wrap = function(tagName) {
  return new Template(ractiveAdaptor.wrap(this.templateObj, tagName), this.partials, this.view, this.context);
};

var widgetConstructor;
function createChildView(view, template, partials) {
  return {
    type: 'WidgetConstructor',
    constructor: widgetConstructor,
    childView: view,
    template: new Template(template, partials)
  };
}

/**
 * Exposed function to attachView
 * @param  {Object}   view          View to attach to
 * @param  {Function} widgetWrapper Constructor function for widget from adaptor
 * @return {Template}               New template with updated template object
 */
Template.prototype.attachView = function(view, widgetWrapper) {
  // @TODO assign this via adaptor?
  if (widgetWrapper !== undefined) {
    widgetConstructor = widgetWrapper;
  }
  var templateObj = ractiveAdaptor.attach(
    _.clone(this.templateObj),
    view,
    createChildView,
    this.getPartials()
  );
  return new Template(templateObj, this.partials, view);
};

/**
 * Returns the parsed template object into an equivalent Mustache string
 * Used for lambdas to allow source transforms before rendering
 * @return {String}
 */
Template.prototype.toSource = function(forDebugger) {
  return ractiveAdaptor.toSource(this.templateObj, forDebugger);
};

module.exports = Template;
