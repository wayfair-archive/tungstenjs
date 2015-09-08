/**
 * Wrapper for logging that can be abstracted based on needs
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */
'use strict';

var _ = require('underscore');

/**
 * Gets a bound console method, falls back to log for unavailable functions
 * @param  {String}   name Name of the method to get
 * @return {Function}      Bound console function
 */
/*eslint-disable no-console */
var getConsoleMethod = function(name) {
  var func = console[name] || console.log;
  return _.bind(func, console);
};
/*eslint-enable no-console */

module.exports = {
  info: getConsoleMethod('info'),
  debug: getConsoleMethod('debug'),
  log: getConsoleMethod('log'),
  warn: getConsoleMethod('warn'),
  error: getConsoleMethod('error'),
  trace: getConsoleMethod('trace'),
  getConsoleMethod: getConsoleMethod
};
