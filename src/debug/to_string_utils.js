'use strict';

var _ = require('underscore');

/**
 * Transformed property names that should reverted
 * @type {Object}
 */
module.exports.propertiesToTransform = {
  'className': 'class',
  'htmlFor': 'for',
  'httpEquiv': 'http-equiv'
};

module.exports.NODE_TYPES = {
  ELEMENT: 1,
  TEXT: 3,
  COMMENT: 8
};


var entityMap = {};
_.each(require('html-tokenizer/entity-map'), function(charCode, name) {
  // Ignore whitespace only characters
  if (!/\s/.test(charCode)) {
    entityMap[charCode.charCodeAt(0)] = '&' + name.toLowerCase() + ';';
  }
});

module.exports.escapeString = function(str) {
  var output = '';
  for (var i = 0; i < str.length; i++) {
    output += entityMap[str.charCodeAt(i)] || str.charAt(i);
  }
  return output;
};

module.exports.entities = {
  unescaped: {
    amp: '&',
    open: '<',
    close: '>',
    quote: '"'
  },
  escaped: {
    amp: '&amp;',
    open: '&lt;',
    close: '&gt;',
    quote: '&quot;'
  }
};

module.exports.noClosing = {
  'br': true,
  'hr': true,
  'img': true,
  'input': true,
  'meta': true,
  'link': true
};
module.exports.selfClosing = {
  'area': true,
  'base': true,
  'col': true,
  'command': true,
  'embed': true,
  'hr': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true
};

module.exports.getCommentString = function(text, chars) {
  return chars.open + '-- ' + text + ' --' + chars.close;
};

module.exports.elementToString = function(elem, chars) {
  if (elem.nodeType === module.exports.NODE_TYPES.COMMENT) {
    return module.exports.getCommentString(elem.textContent, chars);
  } else if (elem.nodeType === module.exports.NODE_TYPES.TEXT) {
    return module.exports.escapeString(elem.textContent);
  } else {
    return module.exports.escapeString(elem.outerHTML);
  }
};