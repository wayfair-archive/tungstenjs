'use strict';

const OBJECT_QUEUED = '__raf_queued__';

const animFrame = require('lazy_initializer!./animation_frame');
const _queue = [];
function renderQueue() {
  for (let i = 0; i < _queue.length; i++) {
    _queue[i][0][OBJECT_QUEUED] = false;
    _queue[i][1]();
  }
  _queue.length = 0;
}

function queue(obj, fn) {
  if (obj[OBJECT_QUEUED] === true || typeof fn !== 'function') {
    return;
  }
  obj[OBJECT_QUEUED] = true;
  // If the queue is currently empty request an animation frame
  if (!_queue.length) {
    animFrame().request(renderQueue);
  }
  _queue.push([obj, fn]);
}

module.exports = {
  queue: queue,
  _key: OBJECT_QUEUED
};
