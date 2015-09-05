'use strict';

var logger = require('../../../src/utils/logger.js');

describe('logger.js public API', function() {
  var loggerMethods = ['info', 'debug', 'log', 'warn', 'error', 'trace'];
  var message = 'test logger method';
  for (var i = 0; i < loggerMethods.length; i++) {
    var method = loggerMethods[i];
    describe('logger.' + method, function() {
      it('should be a function', function() {
        expect(logger[method]).to.be.a('function');
      });
      it('should call the respective console method', function() {
        console[method].calls.reset();
        logger[method](message);
        jasmineExpect(console[method]).toHaveBeenCalledWith(message);
      });
    });
  }
  it('should handle undefined console methods', function() {
    console.log.calls.reset();
    var fakeMethod = logger.getConsoleMethod('asfd');
    fakeMethod(message);
    jasmineExpect(console.log).toHaveBeenCalledWith(message);
  });
});
