'use strict';

const _ = require('underscore');
const logger = require('../../utils/logger');

const ERROR_LEVELS = {
  'EXCEPTION': 0,
  'WARNING': 1
};

let strictMode = true;
let overrides = {};
let contextFn = _.noop;

function logMessage(messageLevel, data) {
  // Reduce any error messages to the maximum allowed
  if (strictMode) {
    messageLevel = ERROR_LEVELS.EXCEPTION;
  }
  let context = contextFn();
  if (typeof context !== 'string') {
    context = '';
  }
  switch (messageLevel) {
    case ERROR_LEVELS.EXCEPTION:
      if (overrides.exception) {
        overrides.exception(data, context);
      } else {
        let error = _.map(data, (item) => {
          return JSON.stringify(item);
        });
        throw Error(error.join(' ') + context);
      }
      break;
    case ERROR_LEVELS.WARNING:
      if (overrides.warning) {
        overrides.warning(data, context);
      } else {
        if (context) {
          data.push(context);
        }
        logger.warn.apply(logger, data);
      }
      break;
  }
}

module.exports.warn = function() {
  let data = INLINE_ARGUMENTS;
  logMessage(ERROR_LEVELS.WARNING, data);
};

module.exports.exception = function() {
  let data = INLINE_ARGUMENTS;
  logMessage(ERROR_LEVELS.EXCEPTION, data);
};

module.exports.setStrictMode = function(value) {
  strictMode = value;
};
module.exports.setOverrides = function(opts) {
  overrides = opts;
};
module.exports.setContextFunction = function(fn) {
  contextFn = typeof fn === 'function' ? fn : _.noop;
};
