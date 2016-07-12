'use strict';

const errors = require('../../../src/utils/errors');
const logger = require('../../../src/utils/logger');

describe('errors.js public API', function() {
  describe('errors.extend', function() {
    it('should be a function', function() {
      expect(errors.extend).to.be.a('function');
    });

    const customHint = 'Check that all model variables are defined in your PHP view';
    const originalMessage = errors.domDoesNotMatchVDOMForView('ArbitraryView01');
    it('should extend an error message appropriately', function() {
      errors.extend('domDoesNotMatchVDOMForView', customHint);
      jasmineExpect(errors.domDoesNotMatchVDOMForView('ArbitraryView01')).toEqual(`${originalMessage}. ${customHint}`);
    });
    it('should support multiple extensions of an error message', function() {
      const customHint2 = 'This includes derived properties!';
      errors.extend('domDoesNotMatchVDOMForView', customHint2);
      jasmineExpect(errors.domDoesNotMatchVDOMForView('ArbitraryView01')).toEqual(`${originalMessage}. ${customHint}. ${customHint2}`);
    });
    it('should reject nonexistent error messages', function() {
      const nonexistentError = 'DOMdoesntmatch__~~~theVDOM~~~__forview';
      spyOn(logger, 'warn');
      errors.extend(nonexistentError, customHint);
      jasmineExpect(logger.warn).toHaveBeenCalledWith(`Tried to extend a nonexistent error message: ${nonexistentError}`);
    });
  });
});
