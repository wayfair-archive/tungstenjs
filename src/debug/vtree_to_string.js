'use strict';

import _ from 'underscore';
import logger from '../utils/logger';
import syntaxHighlight from './syntax_highlight';
import virtualDomImplementation from '../vdom/virtual_dom_implementation';
import virtualHyperscript from '../vdom/virtual_hyperscript';
var vdom = virtualDomImplementation.vdom;
import utils from './to_string_utils';
import escapeString from '../utils/escape_string';

function toString(vtree, escaped) {
  var chars = utils.entities[escaped ? 'escaped' : 'unescaped'];
  var output = '';
  var i;
  if (virtualDomImplementation.isVNode(vtree)) {
    var tagName = syntaxHighlight.tag(vtree.tagName.toLowerCase());
    output += chars.open + tagName;
    var addAttributes = function(val, key) {
      if (virtualDomImplementation.isHook(val)) {
        return;
      }
      if (key === 'attributes' || key === 'namespace') {
        return;
      }
      if (key.toLowerCase() === 'style') {
        val = val.cssText;
      }
      if (key.toLowerCase() === 'contenteditable' && val.toLowerCase() === 'inherit') {
        return;
      }
      output += ' ' + syntaxHighlight.attribute(utils.propertiesToTransform[key] || key, val);
    };
    _.each(vtree.properties, addAttributes);
    _.each(vtree.properties.attributes, addAttributes);
    if (utils.noClosing[tagName] != null) {
      output += chars.close;
    } else if (utils.selfClosing[tagName] != null) {
      output += '' + chars.close;
    } else {
      output += chars.close;
      for (i = 0; i < vtree.children.length; i++) {
        output += toString(vtree.children[i], escaped);
      }
      output += chars.open + '/' + tagName + chars.close;
    }
  } else if (virtualDomImplementation.isWidget(vtree)) {
    if (typeof vtree.templateToString === 'function') {
      output += vtree.templateToString(escaped);
    } else {
      logger.warn('Widget type: ' + vtree.constructor.name + ' has no templateToString function, falling back to DOM');
      var elem = vdom.create(virtualHyperscript('div', {}, vtree));
      output += elem.innerHTML;
    }
  } else if (virtualDomImplementation.isVText(vtree)) {
    output += escapeString(vtree.text);
  } else if (typeof vtree === 'string') {
    output += escapeString(vtree);
  } else if (vtree.length) {
    for (i = 0; i < vtree.length; i++) {
      output += toString(vtree[i], escaped);
    }
  }
  return output;
}

module.exports = toString;
