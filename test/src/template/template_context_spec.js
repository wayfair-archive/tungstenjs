'use strict';

var logger = require('../../../src/utils/logger');
var Context = require('../../../src/template/template_context');

describe('template_context.js public API', function() {
  describe('lookup', function() {
    var testContext = new Context();
    it('should be a function', function() {
      expect(testContext.lookup).to.be.a('function');
    });
    it('should return null when receiving a comment block', function() {
      expect(testContext.lookup('!text')).to.equal(null);
    });
    if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
      it('should be able to log using debug helpers', function() {
        spyOn(logger, 'log');
        testContext.lookup('!w/context');
        testContext.lookup('!w/context/debugstring');
        testContext.lookup('!w/lastModel/debugstring');
        testContext.lookup('!w/debug/debugstring');
        expect(logger.log.calls.count()).to.equal(4);
      });
    }
  });
});
