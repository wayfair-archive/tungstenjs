var compilerLogger = require('../../../../src/template/compiler/compiler_logger');
var logger = require('../../../../src/utils/logger');

describe('compiler_logger', function() {
  beforeEach(function() {
    compilerLogger.setStrictMode(false);
    compilerLogger.setOverrides({});
  });
  describe('warn', function() {
    it('should be a function', function() {
      expect(compilerLogger.warn).to.be.a('function');
      expect(compilerLogger.warn).to.have.length(0);
    });
    it('should log a warning', function() {
      spyOn(logger, 'warn');
      var msg = 'foobar';
      compilerLogger.warn(msg);
      jasmineExpect(logger.warn).toHaveBeenCalledWith(msg);
    });
  });
  describe('exception', function() {
    it('should be a function', function() {
      expect(compilerLogger.exception).to.be.a('function');
      expect(compilerLogger.exception).to.have.length(0);
    });
    it('should trigger an exception', function() {
      expect(compilerLogger.exception).to.throw(Error);
    });
    it('should trigger an exception with the stringified data passed', function() {
      var msg = ['foobar', {bar: 'baz'}];
      try {
        compilerLogger.exception.apply(compilerLogger, msg);
      } catch (ex) {
        expect(ex.message).to.equal('"foobar" {"bar":"baz"}');
      }
    });
  });
  describe('setStrictMode', function() {
    it('should be a function', function() {
      expect(compilerLogger.setStrictMode).to.be.a('function');
      expect(compilerLogger.setStrictMode).to.have.length(1);
    });
    it('escalates warnings to exceptions', function() {
      compilerLogger.setStrictMode(true);
      expect(compilerLogger.warn).to.throw(Error);
    });
  });
  describe('setOverrides', function() {
    it('should be a function', function() {
      expect(compilerLogger.setOverrides).to.be.a('function');
      expect(compilerLogger.setOverrides).to.have.length(1);
    });
    it('allowed overrides to the default functionality', function() {
      var overrides = {
        warning: jasmine.createSpy('warn'),
        exception: jasmine.createSpy('exception')
      };
      compilerLogger.setOverrides(overrides);
      compilerLogger.warn('foo');
      compilerLogger.exception('bar');

      jasmineExpect(overrides.warning).toHaveBeenCalledWith(['foo']);
      jasmineExpect(overrides.exception).toHaveBeenCalledWith(['bar']);
    });
  });
});
