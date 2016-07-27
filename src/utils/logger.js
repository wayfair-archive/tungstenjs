/**
 * Wrapper for logging that can be abstracted based on needs
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */
'use strict';

/**
 * Gets a bound console method, falls back to log for unavailable functions
 * @param  {String}   name Name of the method to get
 * @return {Function}      Bound console function
 */
/* eslint-disable no-console */
function getDefaultConsole() {
  if (console && typeof console.log === 'function') {
    return console.log;
  } else {
    return function() {
      // Console isn't available until dev tools is open in old IE, so keep checking
      if (console && typeof console.log === 'function') {
        let args = INLINE_ARGUMENTS;
        console.log.apply(console, args);
      }
    };
  }
}

var defaultConsole = getDefaultConsole();

var getConsoleMethod = function(name) {
  var func = typeof console[name] === 'function' ? console[name] : defaultConsole;
  return func.bind(console);
};
/* eslint-enable no-console */

module.exports = {
  info: getConsoleMethod('info'),
  debug: getConsoleMethod('debug'),
  log: getConsoleMethod('log'),
  warn: getConsoleMethod('warn'),
  error: getConsoleMethod('error'),
  trace: getConsoleMethod('trace'),
  getConsoleMethod: getConsoleMethod,
  getDefaultConsole: getDefaultConsole
};
