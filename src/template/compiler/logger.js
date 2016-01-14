'use strict';

const _ = require('underscore');
const logger = require('../../utils/logger');

const ERROR_LEVELS = {
  'EXCEPTION': 0,
  'ERROR' : 1,
  'WARNING': 2
};

let errorLevel = ERROR_LEVELS.ERROR;

function logMessage(messageLevel, data) {
  // Reduce any error messages to the maximum allowed
  let level = Math.min(errorLevel, messageLevel);
  switch (level) {
    case ERROR_LEVELS.EXCEPTION:
      let error = _.map(data, (item) => {
        return JSON.stringify(item);
      });
      throw Error(error.join(' '));
    case ERROR_LEVELS.WARNING:
      logger.warn.apply(logger, data);
      break;
    case ERROR_LEVELS.ERROR:
      logger.error.apply(logger, data);
      break;
    default:
      logger.log.apply(logger, data);
  }
}

module.exports.warn = function() {
  for (var l = arguments.length, data = Array(l), i = 0; i < l; i++) {
    data[i] = arguments[i];
  }
  logMessage(ERROR_LEVELS.WARNING, data);
};

module.exports.error = function() {
  for (var l = arguments.length, data = Array(l), i = 0; i < l; i++) {
    data[i] = arguments[i];
  }
  logMessage(ERROR_LEVELS.ERROR, data);
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
