'use strict';

var _ = require('underscore');
var utils = require('./to_string_utils');
var textDiff = require('./text_diff');
var virtualDomImplementation = require('../vdom/virtual_dom_implementation');
var isVNode = virtualDomImplementation.isVNode;
var isVText = virtualDomImplementation.isVText;
var isWidget = virtualDomImplementation.isWidget;
var HTMLCommentWidget = require('../template/widgets/html_comment');
var isHook = virtualDomImplementation.isHook;
var vNodeToString = require('./vtree_to_string');

var chars = utils.entities.escaped;

/**
 * Called when a VirtualNode and DOM node align
 *
 * @param  {Object}  vNode VirtualNode
 * @param  {Element} elem  DOM node
 *
 * @return {string}        Diff string
 */
function diffElements(vNode, elem) {
  var output = '';
  // Diff tagnames and save for closing
  var tagDiff = textDiff(vNode.tagName.toLowerCase(), elem.tagName.toLowerCase());
  tagDiff = '<span class="TemplateString_tag">' + tagDiff + '</span>';
  output += chars.open;
  output += tagDiff;

  // Check declared property values vs DOM values
  // This bypasses properties that are not managed by VirtualNode
  _.each(vNode.properties, function(value, key) {
    if (key === 'attributes' || key === 'namespace') {
      return;
    }
    if (key.toLowerCase() === 'contenteditable' && value.toLowerCase() === 'inherit') {
      return;
    }
    var propValue = value;
    if (isHook(propValue)) {
      if (propValue.value) {
        propValue = propValue.value;
      } else {
        // If this is a hook with no value, ignore as it's functional
        return;
      }
    }
    var propName = utils.propertiesToTransform[key] ? utils.propertiesToTransform[key] : key;

    var domValue = elem[key];
    if (_.isObject(domValue)) {
      domValue = elem.getAttribute(key);
    }
    if (propName === 'href' || propName === 'src') {
      // the href property displays the fully resolved URL when read, so fall back to attribute value
      domValue = elem.getAttribute(propName);
    } else if (propName === 'style') {
      // Style attributes are tricky because they can validly contain whitespace and be out of order
      propValue = _.filter(propValue.cssText.split(';'), _.identity).sort().join(';').replace(/\s/g, '');
      domValue = _.filter(domValue.split(';'), _.identity).sort().join(';').replace(/\s/g, '');
    }

    var vAttr = ' <span class="TemplateString_attrName">' + propName + '</span>=<span class="TemplateString_attrValue">' + chars.quote + propValue + chars.quote + '</span>';
    var eAttr = ' <span class="TemplateString_attrName">' + propName + '</span>=<span class="TemplateString_attrValue">' + chars.quote + domValue + chars.quote + '</span>';
    // If the property is a boolean, any non-"false" value of the template is fine
    output += elem[key] === true && propValue.toString() !== 'false' ? vAttr : textDiff(vAttr, eAttr);
  });

  // Check declared attribute values vs DOM values
  // This bypasses attributes that are not managed by VirtualNode
  _.each(vNode.properties.attributes, function(value, key) {
    if (key.toLowerCase() === 'contenteditable' && value.toLowerCase() === 'inherit') {
      return;
    }
    if (key === 'namespace') {
      return;
    }
    var propValue = value;
    if (isHook(propValue)) {
      if (propValue.value) {
        propValue = propValue.value;
      } else {
        // If this is a hook with no value, ignore as it's functional
        return;
      }
    }
    var vAttr = ' <span class="TemplateString_attrName">' + key + '</span>=<span class="TemplateString_attrValue">' + chars.quote + propValue + chars.quote + '</span>';
    var eAttr = ' <span class="TemplateString_attrName">' + key + '</span>=<span class="TemplateString_attrValue">' + chars.quote + elem.getAttribute(key) + chars.quote + '</span>';
    output += textDiff(vAttr, eAttr);
  });
  output += chars.close;

  // Iterate over the larger number of children
  var numChildren = Math.max(vNode.children.length, elem.childNodes.length);

  for (var i = 0; i < numChildren; i++) {
    output += recursiveDiff(vNode.children[i], elem.childNodes[i]);
  }
  // For diffing purposes all tags are <tag></tag>, even self-closing tags
  output += chars.open + '/' + tagDiff + chars.close;
  return output;
}

/**
 * Iterates over a VirtualDOM and DOM structure to create a diff string
 *
 * @param  {Object}  vtree VirtualDOM object
 * @param  {Element} elem  DOM object
 *
 * @return {string}        Diff string
 */
function recursiveDiff(vtree, elem) {
  var output = '';
  if (vtree == null && elem != null) {
    // If the VTree ran out but DOM still exists
    output += '<ins>' + utils.elementToString(elem, chars) + '</ins>';
  } else if (isVNode(vtree)) {
    if (!elem || elem.nodeType !== utils.NODE_TYPES.ELEMENT) {
      // If vtree is a VNode, but elem isn't an Element
      output += '<del>' + vNodeToString(vtree, true, false) + '</del>';
      if (elem) {
        output += '<ins>' + utils.elementToString(elem, chars) + '</ins>';
      }
    } else {
      // Diff elements and recurse
      output += diffElements(vtree, elem);
    }
  } else if (isVText(vtree)) {
    if (!elem || elem.nodeType !== utils.NODE_TYPES.TEXT) {
      // If vtree is a VText, but elem isn't a textNode
      output += '<del>' + utils.escapeString(vtree.text) + '</del>';
      if (elem) {
        output += '<ins>' + utils.elementToString(elem, chars) + '</ins>';
      }
    } else {
      output += textDiff(vtree.text, elem.textContent);
    }
  } else if (isWidget(vtree)) {
    var widgetName;
    // Widgets are the construct that hold childViews
    if (vtree.constructor === HTMLCommentWidget) {
      // HTMLCommentWidget is a special case
      if (!elem || elem.nodeType !== utils.NODE_TYPES.COMMENT) {
        output += '<del>' + utils.getCommentString(utils.escapeString(vtree.text), chars) + '</del>';
        if (elem) {
          output += '<ins>' + utils.elementToString(elem, chars) + '</ins>';
        }
      } else {
        output += utils.getCommentString(textDiff(utils.escapeString(vtree.text), elem.textContent), chars);
      }
    } else if (vtree && vtree.view) {
      widgetName = vtree.view.getDebugName();
      if (typeof vtree.templateToString === 'function') {
        widgetName = vtree.templateToString(true);
      }
      if (vtree.view.el !== elem) {
        // If the view at this position isn't bound to elem, something has gone terribly wrong
        output += '<del><ins>' + widgetName + '</ins></del>';
      } else {
        output += widgetName;
      }
    } else {
      output += '<del>[Uninitialized child view]</del>';
      output += '<ins>' + utils.elementToString(elem, chars) + '</ins>';
    }
  }
  return output;
}

module.exports = recursiveDiff;
