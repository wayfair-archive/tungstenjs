'use strict';

var window = require('global/window');
var animFrame = {
  request: null
};

animFrame.request = window.requestAnimationFrame;

var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for (var x = 0; x < vendors.length && !animFrame.request; ++x) {
  animFrame.request = window[vendors[x] + 'RequestAnimationFrame'];
  animFrame.cancel = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!animFrame.request) {
  animFrame.request = function rafShim(callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = setTimeout(function() {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
} else {
  animFrame.request = animFrame.request.bind(window);
}

module.exports = animFrame;
