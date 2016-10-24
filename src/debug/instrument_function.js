const Timer = require('./timer');
const logger = require('../utils/logger');

/*
 * Instrument a function and log the following when it is called:
 *
 *  1. Arguments
 *  2. Return Value
 *  3. Execution Time
 *
 *  @param {String} fnName Function name
 *  @param {Function} fn Function
 *  @returns {Function} Instrumented Function
 *
 *  @example
 *  var myFunc = function() { return 4; };
 *  var myFuncInstrumented = instrumentedFunction('myFunc', myFunc);
 *
 *  myFuncInstrumented(1, 2, 3);
 *
 *  => "myFunc" called with arguments: [1, 2, 3]
 *  => "myFunc" executed in 2.0034ms and returned: 4
 */
module.exports = function instrumentFunction(fnName, fn) {
  return function instrumentedFunction(...args) {
    logger.trace(`${fnName} called with arguments: `, args);

    const timer = new Timer(fnName, false);
    const returnValue = fn.apply(this, args);
    const measurement = parseFloat(timer.getMeasurement()).toFixed(4);

    logger.trace(`${fnName} executed in ${measurement}ms and returned: `, returnValue);
    return returnValue;
  };
};
