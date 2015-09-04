'use strict';

var logger = require('../../../src/utils/logger.js');

describe('logger.js public API', function() {
  var loggerMethods = ['info', 'debug', 'log', 'warn', 'error', 'trace'];
  for (var i = 0; i < loggerMethods.length; i++) {
    var method = loggerMethods[i];
    describe('logger.' + method, function() {
      it('should be a function', function() {
        expect(logger[method]).to.be.a('function');
      });
    });
  }
});
