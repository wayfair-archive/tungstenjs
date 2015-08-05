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

function diffElements(vNode, elem) {
  var output = '';
  var tagDiff = textDiff(vNode.tagName.toLowerCase(), elem.tagName.toLowerCase());
  output += chars.open;
  output += tagDiff;
  _.each(vNode.properties, function(value, key) {
    if (key.toLowerCase() === 'contenteditable' && value.toLowerCase() === 'inherit') {
      return;
    }
    var propValue = value;
    if (isHook(propValue)) {
      if (propValue.value) {
        propValue = propValue.value;
      } else {
        return;
      }
    }
    var propName = utils.propertiesToTransform[key] ? utils.propertiesToTransform[key] : key;
    var vAttr = ' ' + propName + '=' + chars.quote + propValue + chars.quote;
    var eAttr = ' ' + propName + '=' + chars.quote + elem[key] + chars.quote;
    // If the property is a boolean, any non-"false" value of the template is fine
    output += elem[key] === true && propValue.toString() !== 'false' ? vAttr : textDiff(vAttr, eAttr);
  });
  _.each(vNode.properties.attributes, function(value, key) {
    if (key.toLowerCase() === 'contenteditable' && value.toLowerCase() === 'inherit') {
      return;
    }
    var propValue = value;
    if (isHook(propValue)) {
      propValue = propValue.value;
    }
    var vAttr = ' ' + key + '=' + chars.quote + propValue + chars.quote;
    var eAttr = ' ' + key + '=' + chars.quote + elem.getAttribute(key) + chars.quote;
    output += textDiff(vAttr, eAttr);
  });
  if (vNode.children.length > 0 || elem.childNodes.length > 0) {
    output += chars.close;
    var numChildren = Math.max(vNode.children.length, elem.childNodes.length);

    for (var i = 0; i < numChildren; i++) {
      output += recursiveDiff(vNode.children[i], elem.childNodes[i]);
    }
    output += chars.open + '/' + tagDiff + chars.close;
  } else {
    output += chars.close + chars.open + '/' + tagDiff + chars.close;
  }
  return output;
}

function recursiveDiff(vtree, elem) {
  var output = '';
  if (vtree == null && elem != null) {
    output += '<ins>' + utils.elementToString(elem, chars) + '</ins>';
  } else if (isVNode(vtree)) {
    if (!elem || elem.nodeType !== utils.NODE_TYPES.ELEMENT) {
      output += '<del>' + vNodeToString(vtree, true, false) + '</del>';
      if (elem) {
        output += '<ins>' + utils.elementToString(elem, chars) + '</ins>';
      }
    } else {
      output += diffElements(vtree, elem);
    }
  } else if (isVText(vtree)) {
    if (!elem || elem.nodeType !== utils.NODE_TYPES.TEXT) {
      output += '<del>' + utils.escapeString(vtree.text) + '</del>';
      if (elem) {
        output += '<ins>' + utils.elementToString(elem, chars) + '</ins>';
      }
    } else {
      output += textDiff(vtree.text, elem.textContent);
    }
  } else if (isWidget(vtree)) {
    if (vtree.constructor === HTMLCommentWidget) {
      if (!elem || elem.nodeType !== utils.NODE_TYPES.COMMENT) {
        output += '<del>' + utils.getCommentString(utils.escapeString(vtree.text), chars) + '</del>';
        if (elem) {
          output += '<ins>' + utils.elementToString(elem, chars) + '</ins>';
        }
      } else {
        output += utils.getCommentString(textDiff(vtree.text, elem.textContent), chars);
      }
    } else {
      if (vtree.view && vtree.view.el !== elem) {
        if (typeof vtree.templateToString === 'function') {
          output += '<del><ins>' + vtree.view.getDebugName() + '</ins></del>';
        }
      } else {
        if (typeof vtree.templateToString === 'function') {
          output += vtree.templateToString(true, false);
        }
      }
    }
  }
  return output;
}

module.exports = recursiveDiff;