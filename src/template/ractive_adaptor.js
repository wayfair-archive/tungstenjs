'use strict';

var _ = require('underscore');
var ToString = require('./stacks/string');
var Context = require('./template_context');
var logger = require('./../utils/logger');
var ractiveTypes = require('./ractive_types');
var virtualDomImplementation = require('../vdom/virtual_dom_implementation');
var isWidget = virtualDomImplementation.isWidget;
var isVNode = virtualDomImplementation.isVNode;

var htmlParser = require('./html_parser');

var whitespaceOnlyRegex = /^\s*$/;
/**
 * Used to parse loose interpolators inside a opening tag
 * @param  {Object}  templates Template object
 * @param  {Context} context   current Context to evaluate in
 * @return {Object}            Parsed dictionary of attribute names/values
 */
function parseStringAttrs(templates, context) {
  var stringAttrs = '';
  var toString = new ToString();
  for (var i = 0; i < templates.length; i++) {
    toString.clear();
    render(toString, templates[i], context);
    stringAttrs += ' ' + toString.getOutput() + ' ';
  }
  if (whitespaceOnlyRegex.test(stringAttrs)) {
    return null;
  }
  var node = htmlParser('<div ' + stringAttrs + '></div>');
  return node.properties.attributes;
}

/**
 * Render the value of an element's attribute
 * @param  {String|Object} values  VTree object for the attribute value
 * @param  {Context}       context current Context to evaluate in
 * @return {String}                String value for the attribute
 */
function renderAttributeString(values, context) {
  if (typeof values === 'string') {
    return values;
  }

  var buffer = '';
  var toString = new ToString();
  for (var i = 0; i < values.length; i++) {
    toString.clear();
    render(toString, values[i], context);
    buffer += toString.getOutput();
  }

  return buffer;
}

/**
 * Recursive function to render Template into VDom format
 * @param  {Object}  stack       Object collecting output
 * @param  {Object}  template    Template to render
 * @param  {Context} context     Value for the current rendering context
 * @param  {Object}  partials    Object map of partial templates
 * @param  {Object}  parentView  ParentView to attach widgets to
 */
function render(stack, template, context, partials, parentView) {
  var i, j, value, valueLength;
  if (typeof template === 'undefined') {
    return;
  } else if (typeof template === 'string') {
    stack.createObject(template);
  } else if (Context.isArray(template)) {
    for (i = 0; i < template.length; i++) {
      render(stack, template[i], context, partials, parentView);
    }
  } else if (template.type === 'Widget') {
    // Widgets are how we attach Views to subtrees
    // If we have a parentView, we're rendering Vdom, if not this is rendering to Dom or string, so ignore
    if (parentView) {
      // If we have a parent view, attach this as a widget so the child view will render and attach
      stack.createObject(new template.constructor(template.template, template.childView, context, parentView));
    } else {
      // If we aren't in the context of a view, just render out the widget without attaching the child view
      template.template._iterate(null, context, null, null, stack);
    }
    return;
  }

  switch (template.t) {
    // <!-- comment -->
    case ractiveTypes.COMMENT:
      var toString = new ToString();
      render(toString, template.c, context, partials, parentView);
      stack.createComment(toString.getOutput());
      return;
    // {{value}} or {{{value}}} or {{& value}}
    case ractiveTypes.INTERPOLATOR:
    case ractiveTypes.TRIPLE:
      value = context.lookup(Context.getInterpolatorKey(template), stack);
      if (value != null) {
        // If value is already a widget or vnode, add it wholesale
        if (template.t === ractiveTypes.TRIPLE && (isWidget(value) || isVNode(value))) {
          stack.createObject(value);
        } else {
          stack.createObject(value.toString(), {
            // TRIPLE is unescaped content, so it may need parsing
            parse: template.t === ractiveTypes.TRIPLE,
            // INTERPOLATOR is escaped content, so it may need escaping
            escape: template.t === ractiveTypes.INTERPOLATOR
          });
        }
      }
      break;

    // {{> partial}}
    case ractiveTypes.PARTIAL:
      var partialName = Context.getInterpolatorKey(template);
      if (partials[partialName]) {
        var partialTemplate = partials[partialName];
        if (partialTemplate._iterate) {
          // @Todo determine if using partial context is necessary
          partialTemplate._iterate(null, context, parentView, partials, stack);
        } else {
          render(stack, partialTemplate, context, partials[partialName].partials || partials, parentView);
        }
      } else {
        // @TODO, perhaps return this string as the partial result so it renders to the page?
        logger.warn('Warning: no partial registered with the name ' + partialName);
      }
      break;

    // {{# section}} or {{^ unless}}
    case ractiveTypes.SECTION:
      value = Context.parseValue(context.lookup(Context.getInterpolatorKey(template), stack));
      if (template.n === ractiveTypes.SECTION_UNLESS) {
        if (!value.isTruthy) {
          render(stack, template.f, context, partials, parentView);
        }
      } else if (value.isTruthy) {
        // Sections become loops if an array or collection is passed
        if (value.isArray) {
          // Iterate over the collection
          for (j = 0, valueLength = value.value.length; j < valueLength; ++j) {
            render(stack, template.f, context.push(value.value[j]), partials, parentView);
          }
        } else if (typeof value.value === 'object' || typeof value.value === 'string') {
          // If the found value is an object or string, push it onto the context
          render(stack, template.f, context.push(value.value), partials, parentView);
        } else {
          // Not an object or string usually means boolean, so don't bother pushing that
          render(stack, template.f, context, partials, parentView);
        }
      }
      break;

    // DOM node
    case ractiveTypes.ELEMENT:
      var properties = {};
      var attributeHandler = function(values, attr) {
        properties[attr] = renderAttributeString(values, context);
      };

      // Parse static attribute values
      _.each(template.a, attributeHandler);
      // Handle dynamic values if need be
      if (template.m) {
        var attrs = parseStringAttrs(template.m, context);
        if (attrs != null) {
          _.each(attrs, attributeHandler);
        }
      }

      // openElement gives back a unique ID so it can validate pairs when closing
      var elem = stack.openElement(template.e, properties);

      // Recuse into the elements' children
      if (template.f) {
        render(stack, template.f, context, partials, parentView);
      }

      stack.closeElement(elem);
  }
}

/**
 * Iterate over the template to attach a view's childViews
 * @todo attach events?
 * @param  {Object}   view          View to attach
 * @param  {Object}   template      Template object to attach to
 * @param  {Function} createWidget Constructor function to wrap childViews with
 * @param  {Object}   partials      Dictionary to lookup partials from
 * @param  {Object}   childClasses  Classes to look for for this View wrapper
 * @return {Object}                 Template object with attached view
 */
var attachView = function(view, template, createWidget, partials, childClasses) {
  var i;

  // If cached version hasn't been passed down, parse childViews into an array of class names
  if (!childClasses) {
    childClasses = {};
    childClasses.flat = _.keys(view.childViews);
    childClasses.padded = _.map(childClasses.flat, function(key) {
      return ' ' + key + ' ';
    });
    childClasses.length = childClasses.flat.length;
  }

  // String is a dead-end
  if (typeof template === 'string') {
    return template;
  }

  // Arrays need iterating over
  if (Context.isArray(template)) {
    for (i = 0; i < template.length; i++) {
      template[i] = attachView(view, template[i], createWidget, partials, childClasses);
    }
    // short circuit
    return template;
  }

  // If the view has childViews and this isn't the root, attempt to attach Widget
  if (!template.root && view.childViews) {
    // If this is an element with a class property, see if we should attach Widget
    if (template.a && template.a['class']) {
      var className = template.a['class'];
      // If className has dynamic values, filter them out to just the static ones
      if (typeof className !== 'string') {
        className = _.filter(className, function(obj) {
          return typeof obj === 'string';
        });
        className = className.join(' ');
      }
      // Pad with spaces for better hasClass-ing
      className = ' ' + className + ' ';
      for (i = childClasses.length; i--; ) {
        if (className.indexOf(childClasses.padded[i]) > -1) {
          // If we match a childView class, replace the template with a Widget
          template = createWidget(view.childViews[childClasses.flat[i]], template, partials);
          break;
        }
      }
    }
  }

  // Recurse on any child elements
  if (template.f) {
    for (i = 0; i < template.f.length; i++) {
      template.f[i] = attachView(view, template.f[i], createWidget, partials, childClasses);
    }
    // in the event of a partial, we may get a nested array, this flattens it out
    template.f = _.flatten(template.f, true);
  }

  // If this is a partial, lookup and recurse
  if (template.t === ractiveTypes.PARTIAL) {
    var partialName = Context.getInterpolatorKey(template);
    if (!partials[partialName]) {
      logger.warn('Warning: no partial registered with the name ' + partialName);
      return null;
    } else {
      var partialTemplate = partials[partialName];
      if (partialTemplate.templateObj) {
        partialTemplate = partialTemplate.templateObj;
      }
      template = attachView(
        view,
        _.clone(partialTemplate),
        createWidget,
        partials[partialName].partials || partials,
        childClasses
      );
    }
  }

  return template;
};

function wrap(templateObj, tagName) {
  var objectToWrap = null;

  if (templateObj.t === ractiveTypes.ELEMENT) {
    // There is a top level element from previous wrapping
    //  Grab the contents
    if (templateObj.wrapped) {
      objectToWrap = templateObj.f;
    }
  } else {
    objectToWrap = templateObj;
  }

  if (!objectToWrap) {
    return templateObj;
  } else {
    return {
      't': ractiveTypes.ELEMENT,
      'e': tagName || 'div',
      'f': objectToWrap,
      wrapped: true
    };
  }
}

function attach(templateObj, view, createWidget, partials) {
  templateObj = wrap(templateObj, view.el.nodeName);
  return attachView(view, templateObj, createWidget, partials);
}

/*****************************************************************************/

var HtmlString = require('./stacks/html_string');
function reverseAttributeString(templates, join) {
  if (typeof templates === 'string') {
    return templates;
  }
  var output = [];
  var toString = new ToString();
  for (var i = 0; i < templates.length; i++) {
    toString.clear();
    _toSource(toString, templates[i]);
    output.push(toString.getOutput());
  }
  return output.join(join);
}

function toSource(template) {
  var stack = new HtmlString();
  _toSource(stack, template);
  return stack.getOutput();
}
module.exports = toSource;

function _toSource(stack, template) {
  var i;
  if (typeof template === 'undefined') {
    return;
  } else if (typeof template === 'string') {
    stack.createObject(template);
  } else if (Context.isArray(template)) {
    for (i = 0; i < template.length; i++) {
      _toSource(stack, template[i]);
    }
  } else if (template.type === 'Widget') {
    _toSource(stack, template.template.templateObj);
    return;
  }

  switch (template.t) {
    // <!-- comment -->
    case ractiveTypes.COMMENT:
      var htmlString = new HtmlString();
      _toSource(htmlString, template.c);
      stack.createComment(htmlString.getOutput());
      return;
    // {{value}} or {{{value}}} or {{& value}}
    case ractiveTypes.INTERPOLATOR:
      stack.createObject('{{' + Context.getInterpolatorKey(template) + '}}');
      return;
    case ractiveTypes.TRIPLE:
      stack.createObject('{{{' + Context.getInterpolatorKey(template) + '}}}');
      break;

    // {{> partial}}
    case ractiveTypes.PARTIAL:
      stack.createObject('{{>' + Context.getInterpolatorKey(template) + '}}');
      break;

    // {{# section}} or {{^ unless}}
    case ractiveTypes.SECTION:
      var name = Context.getInterpolatorKey(template);
      if (template.n === ractiveTypes.SECTION_UNLESS) {
        stack.createObject('{{^' + name + '}}');
      } else {
        stack.createObject('{{#' + name + '}}');
      }
      _toSource(stack, template.f);
      stack.createObject('{{/' + name + '}}');
      break;

    // DOM node
    case ractiveTypes.ELEMENT:
      var properties = {};
      var attributeHandler = function(values, attr) {
        properties[attr] = reverseAttributeString(values, '');
      };

      // Parse static attribute values
      _.each(template.a, attributeHandler);

      // Handle dynamic values if need be
      if (template.m) {
        var attrs = reverseAttributeString(template.m, ' ');
        properties[attrs] = false;
      }

      // openElement gives back a unique ID so it can validate pairs when closing
      var elem = stack.openElement(template.e, properties);

      // Recuse into the elements' children
      if (template.f) {
        _toSource(stack, template.f);
      }

      stack.closeElement(elem);
  }
}

module.exports = {
  render: render,
  attach: attach,
  wrap: wrap,
  toSource: toSource
};
