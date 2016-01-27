'use strict';

var escapeString = require('../utils/escape_string');

/**
 * Transformed property names that should reverted
 * @type {Object}
 */
module.exports.propertiesToTransform = {
  'className': 'class',
  'htmlFor': 'for',
  'httpEquiv': 'http-equiv'
};

/** @type {Object} Relevant map of NodeTypes */
module.exports.NODE_TYPES = {
  ELEMENT: 1,
  TEXT: 3,
  COMMENT: 8
};

/** @type {Object} Escaped or unescaped entities */
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

/** @type {Object} List of elements that don't close */
module.exports.noClosing = {
  'br': true,
  'hr': true,
  'img': true,
  'input': true,
  'meta': true,
  'link': true
};

/** @type {Object} List of elements that self close */
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

/**
 * Get string representing HTML comment
 *
 * @param  {string} text  Text of comment
 * @param  {Object} chars Character set to use
 *
 * @return {string}       Resultant string
 */
module.exports.getCommentString = function(text, chars) {
  return chars.open + '-- ' + text + ' --' + chars.close;
};

/**
 * Outputs an DOM Element to a string
 *
 * @param  {Element} elem  Element to stringify
 * @param  {Object}  chars Character set to use
 *
 * @return {string}        String for given element
 */
module.exports.elementToString = function(elem, chars) {
  if (elem.nodeType === module.exports.NODE_TYPES.COMMENT) {
    return module.exports.getCommentString(elem.textContent, chars);
  } else if (elem.nodeType === module.exports.NODE_TYPES.TEXT) {
    return escapeString(elem.textContent);
  } else {
    return escapeString(elem.outerHTML);
  }
};
