/**
 * Wrapper for feature detect library.  Could be replaced by lib of your choice.
 *
 * @author Andrew Rota <rota.andrew@gmail.com>
 */
'use strict';
module.exports = {
  isiOS: function() {
    if (!navigator) {
      return;
    }
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
};