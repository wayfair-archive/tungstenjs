'use strict';

const _ = require('underscore');
const logger = require('../../utils/logger');

const ERROR_LEVELS = {
  'EXCEPTION': 0,
  'WARNING': 1
};

let errorLevel = ERROR_LEVELS.ERROR;
let overrides = {};

function logMessage(messageLevel, data) {
  // Reduce any error messages to the maximum allowed
  let level = Math.min(errorLevel, messageLevel);
  switch (level) {
    case ERROR_LEVELS.EXCEPTION:
      if (overrides.exception) {
        overrides.exception(data);
      } else {
        let error = _.map(data, (item) => {
          return JSON.stringify(item);
        });
        throw Error(error.join(' '));
      }
      break;
    case ERROR_LEVELS.WARNING:
      if (overrides.warning) {
        overrides.warning(data);
      } else {
        logger.warn.apply(logger, data);
      }
      break;
    default:
      if (overrides.log) {
        overrides.log(data);
      } else {
        logger.log.apply(logger, data);
      }
  }
}

module.exports.warn = function() {
  for (var l = arguments.length, data = Array(l), i = 0; i < l; i++) {
    data[i] = arguments[i];
  }
  logMessage(ERROR_LEVELS.WARNING, data);
};

module.exports.exception = function() {
  for (var l = arguments.length, data = Array(l), i = 0; i < l; i++) {
    data[i] = arguments[i];
  }
  logMessage(ERROR_LEVELS.EXCEPTION, data);
};

module.exports.ERROR_LEVELS = ERROR_LEVELS;

module.exports.setErrorLevel = function(errorLevelToSet) {
  errorLevel = errorLevelToSet;
};
module.exports.setOverrides = function(opts) {
  overrides = opts;
};
