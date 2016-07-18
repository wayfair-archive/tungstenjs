'use strict';

var exports = {};
exports.registry = require('./registry');
exports.vtreeToString = require('./vtree_to_string');
exports.diffVtreeAndElem = require('./diff_dom_and_vdom');
exports.diff = require('./text_diff');
exports.timer = require('./timer');

if (typeof TUNGSTENJS_IS_TEST === 'undefined') {
  // Window manager does something that messes with the unit tests and is unnecessary to include
  exports.panel = require('./window_manager');
}

module.exports = exports;
