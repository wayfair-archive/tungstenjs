/**
 * Wrapper for feature detect library.  Could be replaced by lib of your choice.
 *
 * @author Andrew Rota <rota.andrew@gmail.com>
 */
'use strict';
var window = require('global/window');
module.exports = {
  isiOS: function() {
    if (!window.navigator) {
      return false;
    }
    return /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
  }
};
