'use strict';

var _ = require('underscore');
var objectDiff = require('./object_diff');

function pad(input, len) {
  var str = input == null ? '' : input.toString();
  while (str.length > len) {
    str = '0' + str;
  }
  return str;
}

function getTimeStr(timestamp) {
  var d = new Date(timestamp);
  var h = pad(d.getHours(), 2);
  var m = pad(d.getMinutes(), 2);
  var s = pad(d.getSeconds(), 2);
  var ms = pad(d.getMilliseconds(), 4);
  return h + ':' + m + ':' + s + '.' + ms;
}

function getStateObject(state) {
  var ts = Date.now();
  return {
    timestamp: ts,
    label: getTimeStr(ts),
    state: state
  };
}

function getStateAtIndex(stateArr, index) {
  var patches = stateArr.slice(1, 1 + index);
  return objectDiff.patch(stateArr[0].state, _.pluck(patches, 'state'));
}

function StateHistory(obj) {
  this.obj = obj;
  this.last = obj.getState();
  this.track = [getStateObject(this.last)];
  this.currentIndex = 0;
  this.slider = this.getSlider();

  var self = this;
  this.ignoreRender = false;
  this.obj.on('rendered', function() {
    if (!self.ignoreRender) {
      var currentState = self.obj.getState();
      var diff = objectDiff.diff(self.last, currentState);
      if (_.size(diff) > 0) {
        self.track.push(getStateObject(diff));
        self.last = currentState;
        self.currentIndex = self.track.length - 1;
        self.slider = self.getSlider();
      }
    } else {
      self.ignoreRender = false;
    }
  });
}

StateHistory.prototype.clear = function() {
  this.last = this.obj.getState();
  this.track = [getStateObject(this.last)];
  this.currentIndex = 0;
  this.slider = this.getSlider();
};

StateHistory.prototype.getStateAtIndex = function(index) {
  return getStateAtIndex(this.track, index);
};

StateHistory.prototype.goFirst = function() {
  this.goToIndex(0);
};

StateHistory.prototype.goLast = function() {
  this.goToIndex(this.track.length - 1);
};

StateHistory.prototype.goBack = function() {
  this.goToIndex(this.currentIndex - 1);
};

StateHistory.prototype.goNext = function() {
  this.goToIndex(this.currentIndex + 1);
};

StateHistory.prototype.goToIndex = function(index) {
  if (index < 0 || index > this.track.length - 1) {
    return;
  }
  var data = this.getStateAtIndex(index);
  this.ignoreRender = true;
  this.obj.setState(data);
  this.currentIndex = index;
  this.slider = this.getSlider();
};

StateHistory.prototype.getSlider = function() {
  var lastIndex = this.track.length - 1;
  var startTime = this.track[0].timestamp;
  var endTime = this.track[lastIndex].timestamp;
  var range = Math.max(endTime - startTime, 1);

  var items = new Array(this.track.length);
  for (var i = 0; i <= lastIndex; i++) {
    var state = this.track[i];
    items[i] = {
      index: i,
      // Gives a % range from 3% to 97%, which leaves some side-padding
      left: 3 + (94 * ((state.timestamp - startTime) / range)),
      label: state.label,
      active: i === this.currentIndex
    };
  }

  return {
    nextEnabled: this.currentIndex < lastIndex,
    prevEnabled: this.currentIndex > 0,
    items: items,
    currentLabel: this.currentIndex === lastIndex ? 'Current' : this.track[this.currentIndex].label,
    currentIndex: this.currentIndex,
    maxIndex: lastIndex
  };
};

module.exports = StateHistory;