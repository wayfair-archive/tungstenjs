'use strict';

var _ = require('underscore');
var animFrame = {
  request: null,
  cancel: null
};
var rafShim = function(callback) {
  var currTime = new Date().getTime();
  var timeToCall = Math.max(0, 16 - (currTime - lastTime));
  var id = setTimeout(function() {
    callback(currTime + timeToCall);
  },
    timeToCall);
  lastTime = currTime + timeToCall;
  return id;
};

if (typeof window !== 'undefined') {
  animFrame.request = window.requestAnimationFrame;
  animFrame.cancel = window.cancelAnimationFrame;

  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !animFrame.request; ++x) {
    animFrame.request = window[vendors[x] + 'RequestAnimationFrame'];
    animFrame.cancel = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!animFrame.request) {
    animFrame.request = rafShim;
  } else {
    animFrame.request = _.bind(animFrame.request, window);
  }

  if (!animFrame.cancel) {
    animFrame.cancel = function(id) {
      clearTimeout(id);
    };
  } else {
    animFrame.cancel = _.bind(animFrame.cancel, window);
  }
} else {
  animFrame.request = rafShim;
}

module.exports = animFrame;
