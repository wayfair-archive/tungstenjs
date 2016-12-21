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
  },
  isIE: function() {
    if (!window.navigator) {
      return false;
    }
    return /Edge\/|Trident\/|MSIE/i.test(window.navigator.userAgent);
  },
  // Taken from https://github.com/Modernizr/Modernizr/blob/master/feature-detects/dom/passiveeventlisteners.js
  supportsPassiveEventListeners: function() {
    var supportsPassiveOption = false;
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassiveOption = true;
        }
      });
      window.addEventListener('test', null, opts);
      // eslint-disable-next-line
    } catch (e) {};
    return supportsPassiveOption;
  }
};
