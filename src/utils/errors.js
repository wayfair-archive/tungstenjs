/**
 * Container for generic error messages that can be extended based on needs
 *
 * @author    Henry Morgan <hemorgan@wayfair.com>
 */
'use strict';

const logger = require('./logger');

module.exports = {
  extend: extend
};

// Error messages, categorized by type. (logger.warn, logger.error, etc...)
var messages = {
  warn: {
    childViewWasPassedAsObjectWithoutAScopeProperty: () => 'ChildView was passed as object without a scope property',
    collectionMethodMayNotBeOverridden: function(methodName, debugName) {
      return `Collection.${methodName} may not be overridden` + (debugName ? ` for collection "${debugName}"` : '');
    },
    collectionExpectedArrayOfObjectsButGot: (initialStr) => `Collection expected array of objects but got: ${initialStr}`,
    modelMethodMayNotBeOverridden: function(methodName, debugName) {
      return `Model.${methodName} may not be overridden` + (debugName ? ` for model "${debugName}"` : '');
    },
    modelExpectedObjectOfAttributesButGot: (initialStr) => `Model expected object of attributes but got: ${initialStr}`,
    domDoesNotMatchVDOMForView: (debugName) => `DOM does not match VDOM for view "${debugName}". Use debug panel to see differences`,
    viewMethodMayNotBeOverridden: function(methodName, debugName) {
      return `View.${methodName} may not be overridden` + (debugName ? ` for view "${debugName}"` : '');
    },
    componentFunctionMayNotBeCalledDirectly: (fn) => `Component.${fn} may not be called directly`,
    cannotOverwriteComponentMethod: (fn) => `Cannot overwrite component method: ${fn}`,
    unableToParseToAValidValueMustMatchJSONFormat: (value) => `Unable to parse "${value}" to a valid value. Input must match JSON format`,
    widgetTypeHasNoTemplateToStringFunctionFallingBackToDOM: (name) => `Widget type: ${name} has no templateToString function, falling back to DOM`,
    objectDoesNotMeetExpectedEventSpec: () => 'Object does not meet expected event spec',
    warningNoPartialRegisteredWithTheName: (partialName) => `Warning: no partial registered with the name ${partialName}`,
    elementIsAVoidElementSoDoesNotNeedAClosingTag: (name) => `${name} is a void element so does not need a closing tag`,
    cannotPlaceThisTagWithinAPreviousTag: (value, prevTagName, isValid) => `Cannot place this ${value} tag within a ${prevTagName} tag. ${isValid}`,
    templateContainsUnclosedItems: () => 'Template contains unclosed items',
    mustacheTokenCannotBeInAttributeNames: () => 'Mustache token cannot be in attribute names',
    doubleCurlyInterpolatorsCannotBeInAttributes: () => 'Double curly interpolators cannot be in attributes',
    tagsImproperlyPairedClosing: (tagName, openID, id) => `${tagName} tags improperly paired, closing ${openID} with close tag from ${id}`,
    closingElementWhenTheStackWasEmpty: (id) => `Closing element ${id} when the stack was empty`,
    computedPropertiesAreNowDeprecatedPleaseChange: (name) => `Computed properties are now deprecated and will be removed soon. Please change "${name}" to a derived property`
  },
  error: {
    unableToLaunchDebugPanel: () => 'Unable to launch debug panel. You may need to allow the popup or run "window.launchDebugger()" from your console'
  },
  exception: {
    notAllTagsWereClosedProperly: () => 'Not all tags were closed properly',
    wrongClosingElementType: (name, current) => `</${name}> where a </${current}> should be`,
    tagIsClosedBeforeOpenTagIsCompletedCheckForUnpairedQuotes: () => 'Tag is closed before open tag is completed. Check for unpaired quotes',
    differentTagThanExpected: (actualTag, expectedTag) => `${actualTag} where a ${expectedTag} should be`,
    closingHTMLElementWithNoPair: (closingElemTagName) => `</${closingElemTagName}> with no paired <${closingElemTagName}>`,
    closingMustacheElementWithNoPair: (closingElemValue) => `{{/${closingElemValue}}} with no paired {{#${closingElemValue}}}`
  }
};
// For each log type, loggerize each message and add it to module.exports
for (let type in messages) {
  if (messages.hasOwnProperty(type)) {
    for (let msgName in messages[type]) {
      if (messages[type].hasOwnProperty(msgName)) {
        module.exports[msgName] = loggerize(messages[type][msgName], type);
      }
    }
  }
}

/**
 * Extends a generic error message with custom information (i.e. implementation-specific hints)
 * and then adds the loggerized version of the extended message to module.exports.
 * @param  {string} errorName The name of the error function to extend
 * @param  {string} customMsg The custom message to append to the generic error message.
 */
function extend(errorName, customMsg) {

  // Find our error message
  for (let type in messages) {
    if (messages[type].hasOwnProperty(errorName)) {
      // Extend the error message
      let origError = messages[type][errorName];
      messages[type][errorName] = function() {
        return `${origError.apply(origError, arguments)}. ${customMsg}`;
      };
      // Loggerize the message and add it to module.exports.
      module.exports[errorName] = loggerize(messages[type][errorName], type);
      return;
    }
  }

  // No error was found matching the name provided.
  logger.warn(`Tried to extend a nonexistent error message: ${errorName}`);
}

/**
 * Returns a logger call with the provided message and type
 * @param  {function} msg  function that returns our message
 * @param  {string} type The type of log to make (warning, error, exception, etc...)
 * @return {function}      Function that calls logger with the provided message and type
 */
function loggerize(msg, type) {
  return function() {
    logger[type](msg());
    // Return the message in case it's needed. (I.E. for utils.alert)
    return msg();
  };
}
