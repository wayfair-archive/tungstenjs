'use strict';

const OBJECT_QUEUED = '__raf_queued__';

const animFrame = require('./animation_frame');
const queue = [];
function renderQueue() {
  for (let i = 0; i < queue.length; i++) {
    queue[i][0][OBJECT_QUEUED] = false;
    queue[i][1]();
  }
  queue.length = 0;
}

module.exports = function(obj, fn) {
  if (obj[OBJECT_QUEUED] === true || typeof fn !== 'function') {
    return;
  }
  obj[OBJECT_QUEUED] = true;
  // If the queue is currently empty request an animation frame
  if (!queue.length) {
    animFrame.request(renderQueue);
  }
  queue.push([obj, fn]);
};
