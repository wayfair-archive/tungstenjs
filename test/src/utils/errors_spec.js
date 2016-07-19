'use strict';

const errors = require('../../../src/utils/errors');
const logger = require('../../../src/utils/logger');

describe('errors.js public API', function() {
  describe('warnings', function() {
    describe('childViewWasPassedAsObjectWithoutAScopeProperty', function() {
      beforeEach(function() {
        spyOn(logger, 'warn');
      });
      describe('childViewWasPassedAsObjectWithoutAScopeProperty', function() {
        it('should be a function', function() {
          expect(errors.childViewWasPassedAsObjectWithoutAScopeProperty).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.childViewWasPassedAsObjectWithoutAScopeProperty();
          jasmineExpect(logger.warn).toHaveBeenCalledWith('ChildView was passed as object without a scope property');
        });
      });
      describe('collectionMethodMayNotBeOverridden', function() {
        it('should be a function', function() {
          expect(errors.collectionMethodMayNotBeOverridden).to.be.a('function');
        });
        it('should log the correct error message', function() {
          let methodName = 'initialize', debugName = 'TestCollection';
          errors.collectionMethodMayNotBeOverridden(methodName);
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Collection.initialize may not be overridden');
          errors.collectionMethodMayNotBeOverridden(methodName, debugName);
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Collection.initialize may not be overridden for collection "TestCollection"');
        });
      });
      describe('collectionExpectedArrayOfObjectsButGot', function() {
        it('should be a function', function() {
          expect(errors.collectionExpectedArrayOfObjectsButGot).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.collectionExpectedArrayOfObjectsButGot('test string');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Collection expected array of objects but got: test string');
        });
      });
      describe('modelMethodMayNotBeOverridden', function() {
        it('should be a function', function() {
          expect(errors.modelMethodMayNotBeOverridden).to.be.a('function');
        });
        it('should log the correct error message', function() {
          let methodName = 'initialize', debugName = 'TestModel';
          errors.modelMethodMayNotBeOverridden(methodName);
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Model.initialize may not be overridden');
          errors.modelMethodMayNotBeOverridden(methodName, debugName);
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Model.initialize may not be overridden for model "TestModel"');
        });
      });
      describe('modelExpectedObjectOfAttributesButGot', function() {
        it('should be a function', function() {
          expect(errors.modelExpectedObjectOfAttributesButGot).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.modelExpectedObjectOfAttributesButGot('test string');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Model expected object of attributes but got: test string');
        });
      });
      describe('domDoesNotMatchVDOMForView', function() {
        it('should be a function', function() {
          expect(errors.domDoesNotMatchVDOMForView).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.domDoesNotMatchVDOMForView('TestView');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('DOM does not match VDOM for view "TestView". Use debug panel to see differences');
        });
      });
      describe('viewMethodMayNotBeOverridden', function() {
        it('should be a function', function() {
          expect(errors.viewMethodMayNotBeOverridden).to.be.a('function');
        });
        it('should log the correct error message', function() {
          let methodName = 'initialize', debugName = 'TestView';
          errors.viewMethodMayNotBeOverridden(methodName);
          jasmineExpect(logger.warn).toHaveBeenCalledWith('View.initialize may not be overridden');
          errors.viewMethodMayNotBeOverridden(methodName, debugName);
          jasmineExpect(logger.warn).toHaveBeenCalledWith('View.initialize may not be overridden for view "TestView"');
        });
      });
      describe('componentFunctionMayNotBeCalledDirectly', function() {
        it('should be a function', function() {
          expect(errors.componentFunctionMayNotBeCalledDirectly).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.componentFunctionMayNotBeCalledDirectly('initialize');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Component.initialize may not be called directly');
        });
      });
      describe('cannotOverwriteComponentMethod', function() {
        it('should be a function', function() {
          expect(errors.cannotOverwriteComponentMethod).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.cannotOverwriteComponentMethod('initialize');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Cannot overwrite component method: initialize');
        });
      });
      describe('unableToParseToAValidValueMustMatchJSONFormat', function() {
        it('should be a function', function() {
          expect(errors.unableToParseToAValidValueMustMatchJSONFormat).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.unableToParseToAValidValueMustMatchJSONFormat('test value');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Unable to parse "test value" to a valid value. Input must match JSON format');
        });
      });
      describe('widgetTypeHasNoTemplateToStringFunctionFallingBackToDOM', function() {
        it('should be a function', function() {
          expect(errors.widgetTypeHasNoTemplateToStringFunctionFallingBackToDOM).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.widgetTypeHasNoTemplateToStringFunctionFallingBackToDOM('TestWidget');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Widget type: TestWidget has no templateToString function, falling back to DOM');
        });
      });
      describe('objectDoesNotMeetExpectedEventSpec', function() {
        it('should be a function', function() {
          expect(errors.objectDoesNotMeetExpectedEventSpec).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.objectDoesNotMeetExpectedEventSpec();
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Object does not meet expected event spec');
        });
      });
      describe('warningNoPartialRegisteredWithTheName', function() {
        it('should be a function', function() {
          expect(errors.warningNoPartialRegisteredWithTheName).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.warningNoPartialRegisteredWithTheName('TestPartial');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Warning: no partial registered with the name TestPartial');
        });
      });
      describe('doubleCurlyInterpolatorsCannotBeInAttributes', function() {
        it('should be a function', function() {
          expect(errors.doubleCurlyInterpolatorsCannotBeInAttributes).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.doubleCurlyInterpolatorsCannotBeInAttributes();
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Double curly interpolators cannot be in attributes');
        });
      });
      describe('tagsImproperlyPairedClosing', function() {
        it('should be a function', function() {
          expect(errors.tagsImproperlyPairedClosing).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.tagsImproperlyPairedClosing('testDiv', 'testOpenID', 'testCloseID');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('testDiv tags improperly paired, closing testOpenID with close tag from testCloseID');
        });
      });
      describe('closingElementWhenTheStackWasEmpty', function() {
        it('should be a function', function() {
          expect(errors.closingElementWhenTheStackWasEmpty).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.closingElementWhenTheStackWasEmpty('testID');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Closing element testID when the stack was empty');
        });
      });
      describe('computedPropertiesAreNowDeprecatedPleaseChange', function() {
        it('should be a function', function() {
          expect(errors.computedPropertiesAreNowDeprecatedPleaseChange).to.be.a('function');
        });
        it('should log the correct error message', function() {
          errors.computedPropertiesAreNowDeprecatedPleaseChange('testComputedProp');
          jasmineExpect(logger.warn).toHaveBeenCalledWith('Computed properties are now deprecated and will be removed soon. Please change "testComputedProp" to a derived property');
        });
      });
    });
  });

  describe('errors', function() {
    beforeAll(function() {
      spyOn(logger, 'error');
    });
    describe('unableToLaunchDebugPanel', function() {
      it('should be a function', function() {
        expect(errors.unableToLaunchDebugPanel).to.be.a('function');
      });
      it('should log the correct error message', function() {
        errors.unableToLaunchDebugPanel();
        jasmineExpect(logger.error).toHaveBeenCalledWith('Unable to launch debug panel. You may need to allow the popup or run "window.launchDebugger()" from your console');
      });
    });
  });

  describe('extend', function() {
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
