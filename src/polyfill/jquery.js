'use strict';

var _ = require('underscore');

/**
 * Construct a new jQuery-style element representation.
 *
 * @param {Element} element An existing element to wrap.
 */
function $(element) {
  // Call as a constructor if it was used as a function.
  if (!(this instanceof $)) {
    return new $(element);
  }

  if (!element) {
    this.length = 0;
  } else {
    // This handles both the 'Element' and 'Window' case, as both support
    // event binding via 'addEventListener'.
    this[0] = element;
    this.length = 1;
  }
}

$.prototype = {
  attr: _.noop
};

$.ajax = require('backbone.nativeajax');

module.exports = $;
