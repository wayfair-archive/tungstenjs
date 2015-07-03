/**
 * Hook for Virtual-Dom library to set focus for newly created elements
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 * @copyright 2015 Wayfair, LLC - All rights reserved
 */

'use strict';

var featureDetect = require('../../utils/feature_detect');

var isiOS = (function() {
  if (typeof featureDetect.isiOS === 'function') {
    return featureDetect.isiOS();
  }
  return false;
}());

function FocusHook() {
  if (!(this instanceof FocusHook)) {
    return new FocusHook();
  }
}

FocusHook.prototype.hook = function (node, prop, prev) {
  // Only run this hook if this wasn't on the previous tree
  // and not on iOS because it really breaks things
  if (!isiOS && !prev) {
    setTimeout(function () {
      if (document.activeElement !== node) {
        node.focus();
      }
    }, 0);
  }
};

module.exports = FocusHook;
