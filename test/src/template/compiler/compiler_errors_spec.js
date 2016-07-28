/**
 * Tests for compiler_errors.js
 *
 * @author    Henry Morgan <hemorgan@wayfair.com>
 */
'use strict';

const compilerErrors = require('../../../../src/template/compiler/compiler_errors');
const compilerLogger = require('../../../../src/template/compiler/compiler_logger');

describe('compiler_errors.js public API', function() {
  beforeAll(() => {
    compilerLogger.setStrictMode(false);
  });

  let overrides = {};
  beforeEach(() => {
    overrides.warning = jasmine.createSpy('warn');
    overrides.exception = jasmine.createSpy('exception');
    compilerLogger.setOverrides(overrides);
  });

  describe('warnings', function() {
    describe('elementIsAVoidElementSoDoesNotNeedAClosingTag', function() {
      it('should be a function', function() {
        expect(compilerErrors.elementIsAVoidElementSoDoesNotNeedAClosingTag).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.elementIsAVoidElementSoDoesNotNeedAClosingTag('test1');
        jasmineExpect(overrides.warning).toHaveBeenCalledWith(['test1 is a void element so does not need a closing tag'], '');
      });
    });
    describe('cannotPlaceThisTagWithinAPreviousTag', function() {
      it('should be a function', function() {
        expect(compilerErrors.cannotPlaceThisTagWithinAPreviousTag).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.cannotPlaceThisTagWithinAPreviousTag('test1', 'test2', 'test3');
        jasmineExpect(overrides.warning).toHaveBeenCalledWith(['Cannot place this test1 tag within a test2 tag. test3'], '');
      });
    });
    describe('templateContainsUnclosedItems', function() {
      it('should be a function', function() {
        expect(compilerErrors.templateContainsUnclosedItems).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.templateContainsUnclosedItems({});
        jasmineExpect(overrides.warning).toHaveBeenCalledWith(['Template contains unclosed items', {}], '');
      });
    });
    describe('mustacheTokenCannotBeInAttributeNames', function() {
      it('should be a function', function() {
        expect(compilerErrors.mustacheTokenCannotBeInAttributeNames).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.mustacheTokenCannotBeInAttributeNames('test');
        jasmineExpect(overrides.warning).toHaveBeenCalledWith(['Mustache token cannot be in attribute names', 'test'], '');
      });
    });
    describe('doubleCurlyInterpolatorsCannotBeInAttributes', function() {
      it('should be a function', function() {
        expect(compilerErrors.doubleCurlyInterpolatorsCannotBeInAttributes).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.doubleCurlyInterpolatorsCannotBeInAttributes('test');
        jasmineExpect(overrides.warning).toHaveBeenCalledWith(['Double curly interpolators cannot be in attributes', 'test'], '');
      });
    });
  });

  describe('exceptions', function() {
    describe('notAllTagsWereClosedProperly', function() {
      it('should be a function', function() {
        expect(compilerErrors.notAllTagsWereClosedProperly).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.notAllTagsWereClosedProperly({});
        jasmineExpect(overrides.exception).toHaveBeenCalledWith(['Not all tags were closed properly', {}], '');
      });
    });
    describe('wrongClosingElementType', function() {
      it('should be a function', function() {
        expect(compilerErrors.wrongClosingElementType).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.wrongClosingElementType('test1', 'test2');
        jasmineExpect(overrides.exception).toHaveBeenCalledWith(['</test1> where a </test2> should be'], '');
      });
    });
    describe('closingHTMLElementWithNoPair', function() {
      it('should be a function', function() {
        expect(compilerErrors.closingHTMLElementWithNoPair).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.closingHTMLElementWithNoPair('test');
        jasmineExpect(overrides.exception).toHaveBeenCalledWith(['</test> with no paired <test>'], '');
      });
    });
    describe('closingMustacheElementWithNoPair', function() {
      it('should be a function', function() {
        expect(compilerErrors.closingMustacheElementWithNoPair).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.closingMustacheElementWithNoPair('test');
        jasmineExpect(overrides.exception).toHaveBeenCalledWith(['{{/test}} with no paired {{#test}}'], '');
      });
    });
    describe('tagIsClosedBeforeOpenTagIsCompletedCheckForUnpairedQuotes', function() {
      it('should be a function', function() {
        expect(compilerErrors.tagIsClosedBeforeOpenTagIsCompletedCheckForUnpairedQuotes).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.tagIsClosedBeforeOpenTagIsCompletedCheckForUnpairedQuotes();
        jasmineExpect(overrides.exception).toHaveBeenCalledWith(['Tag is closed before open tag is completed. Check for unpaired quotes'], '');
      });
    });
    describe('differentTagThanExpected', function() {
      it('should be a function', function() {
        expect(compilerErrors.differentTagThanExpected).to.be.a('function');
      });
      it('should log the correct error message', function() {
        compilerErrors.differentTagThanExpected('test1', 'test2');
        jasmineExpect(overrides.exception).toHaveBeenCalledWith(['test1 where a test2 should be'], '');
      });
    });
  });

  describe('extend', function() {
    it('should be a function', function() {
      expect(compilerErrors.extend).to.be.a('function');
    });

    const customHint = 'test custom hint';
    const customHint2 = 'test custom hint 2';
    let originalMessage;
    it('should extend an error message appropriately', function() {
      compilerErrors.elementIsAVoidElementSoDoesNotNeedAClosingTag('<input>');
      originalMessage = overrides.warning.calls.mostRecent().args[0][0];
      compilerErrors.extend('elementIsAVoidElementSoDoesNotNeedAClosingTag', customHint);
      compilerErrors.elementIsAVoidElementSoDoesNotNeedAClosingTag('<input>');
      jasmineExpect(overrides.warning.calls.mostRecent().args[0][0]).toEqual(`${originalMessage}. ${customHint}`);
    });
    it('should support multiple extensions of an error message', function() {
      compilerErrors.extend('elementIsAVoidElementSoDoesNotNeedAClosingTag', customHint2);
      compilerErrors.elementIsAVoidElementSoDoesNotNeedAClosingTag('<input>');
      jasmineExpect(overrides.warning.calls.mostRecent().args[0][0]).toEqual(`${originalMessage}. ${customHint}. ${customHint2}`);
    });
    it('should reject nonexistent error messages', function() {
      const nonexistentError = '___thiserrordoesnotexist___';
      spyOn(compilerLogger, 'warn');
      compilerErrors.extend(nonexistentError, customHint);
      jasmineExpect(compilerLogger.warn).toHaveBeenCalledWith(`Tried to extend a nonexistent error message: ${nonexistentError}`);
    });
    it('should support extension of an error message that passes multiple arguments to compilerLogger', function() {
      compilerErrors.notAllTagsWereClosedProperly({});
      let responseArray = overrides.exception.calls.mostRecent().args[0];
      responseArray[0] = `${responseArray[0]}. ${customHint}`;
      compilerErrors.extend('notAllTagsWereClosedProperly', customHint);
      compilerErrors.notAllTagsWereClosedProperly({});
      jasmineExpect(overrides.exception.calls.mostRecent().args[0]).toEqual(responseArray);
    });
  });
});
