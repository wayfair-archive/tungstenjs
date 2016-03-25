'use strict';

var window = require('global/window');
var _ = require('underscore');
var process = require('process');
var logger = require('../utils/logger');
var now;
/**
 * Use the highest resolution timing that the environment provides
 */
if (process && typeof process.hrtime === 'function') {
  // node
  now = function() {
    var time = process.hrtime();
    // Convert seconds and nanoseconds into high-resolution milliseconds
    return (time[0] * 1000) + (time[1] / 1e6);
  };
} else if (window && window.performance && typeof window.performance.now === 'function') {
  // modern browser
  now = window.performance.now.bind(window.performance);
} else {
  // everything else
  now = Date.now.bind(Date);
}

/**
 * Timing helper to performance test functionality
 *
 * @param {String}  name         Name of this time for tracking purposes
 * @param {Boolean} absoluteTime Whether to use absolute times or relative
 */
var Timer = function(name, absoluteTime) {
  this.name = name;
  this.startTime = now();
  this.absoluteTime = !!absoluteTime;
  this.adjust = 0;
  this.running = true;
};

/**
 * Log a stat point
 *
 * @param  {String} label Name to log as
 */
Timer.prototype.log = function(label) {
  if (!this.running) {
    return;
  }
  logStat(this.name + '.' + label, this.getMeasurement());
};

/**
 * Calculates the time measurement for the given timer
 *
 * @return {Number}      Time Measurement
 */
Timer.prototype.getMeasurement = function () {
  const rightNow = now();
  const offset = this.adjust + rightNow - this.startTime;
  if (!this.absoluteTime) {
    this.startTime = rightNow;
  }
  return offset;
};

/**
 * Pause the timer
 */
Timer.prototype.pause = function() {
  this.adjust = now() - this.startTime;
  this.running = false;
};

/**
 * Unpause the timer
 */
Timer.prototype.unpause = function() {
  this.startTime = now();
  this.running = true;
};

/** @type {Object} Track logged metrics to average later */
var statsTracker = {};
/** @type {Number} Timeout for printing stats */
var statsTimer;

/**
 * Add data point to stats
 *
 * @param  {String} stat  Full name of the stat
 * @param  {Number} value Run time to track
 */
function logStat(stat, value) {
  if (!statsTracker[stat]) {
    statsTracker[stat] = [];
  }
  statsTracker[stat].push(value);
  clearTimeout(statsTimer);
  statsTimer = setTimeout(printStats, 100);
}

/**
 * Output the average stats to logger
 */
function printStats() {
  _.each(statsTracker, function(vals, stat) {
    var numStats = vals.length;
    var total = _.reduce(vals, function(memo, num) {
      return memo + num;
    }, 0);
    var avg = parseFloat(total / numStats).toFixed(4) + 'ms';
    var printableTotal = parseFloat(total).toFixed(4) + 'ms';
    logger.log(stat + ': ' + avg + ' (' + printableTotal + ' / ' + numStats + ')');
  });
  statsTracker = {};
}

module.exports = Timer;
