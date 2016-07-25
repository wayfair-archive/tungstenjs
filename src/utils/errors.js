/**
 * Container for generic error messages that can be extended based on needs
 *
 * @author    Henry Morgan <hemorgan@wayfair.com>
 */
'use strict';

const logger = require('./logger');
const _ = require('underscore');

module.exports = {};

// Error messages, categorized by type. (logger.warn, logger.error, etc...)
// First element in any returned array should be a string.
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
    objectDoesNotMeetExpectedEventSpec: (evt) => ['Object does not meet expected event spec', evt],
    warningNoPartialRegisteredWithTheName: (partialName) => `Warning: no partial registered with the name ${partialName}`,
    doubleCurlyInterpolatorsCannotBeInAttributes: () => 'Double curly interpolators cannot be in attributes',
    tagsImproperlyPairedClosing: (tagName, openID, id) => `${tagName} tags improperly paired, closing ${openID} with close tag from ${id}`,
    closingElementWhenTheStackWasEmpty: (id) => `Closing element ${id} when the stack was empty`,
    computedPropertiesAreNowDeprecatedPleaseChange: (name) => `Computed properties are now deprecated and will be removed soon. Please change "${name}" to a derived property`
  },
  error: {
    unableToLaunchDebugPanel: () => 'Unable to launch debug panel. You may need to allow the popup or run "window.launchDebugger()" from your console'
  },
  exception: {
  }
};

/**
 * Returns a logger call with the provided message and type
 * @param  {function} message  function that returns a string, or an array containing
 *                             a string and additional arguments for logger.
 * @param  {string} type The type of log to make (warning, error, exception, etc...)
 * @return {function}      Function that calls logger with the provided message and type
 */
function loggerize(message, type) {
  return function() {
    let output = message.apply(message, arguments);
    if (_.isArray(output)) {
      logger[type].apply(logger, output);
    } else {
      logger[type](output);
    }
    // Return the message in case it's needed. (I.E. for utils.alert)
    return output;
  };
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
    if (messages[type][errorName]) {
      // Extend the error message
      let origError = messages[type][errorName];
      // If origError returns multiple arguments, access the first (the error message) and append to it.
      if (_.isArray(origError())) {
        messages[type][errorName] = function() {
          let errorMessage = origError.apply(origError, arguments);
          errorMessage[0] = `${errorMessage[0]}. ${customMsg}`;
          return errorMessage;
        };
      } else {
        // Otherwise, simply append to the message.
        messages[type][errorName] = function() {
          return `${origError.apply(origError, arguments)}. ${customMsg}`;
        };
      }
      // Loggerize the message and add it to module.exports.
      module.exports[errorName] = loggerize(messages[type][errorName], type);
      return;
    }
  }

  // No error was found matching the name provided.
  logger.warn(`Tried to extend a nonexistent error message: ${errorName}`);
}

module.exports.extend = extend;

// For each log type, loggerize each message and add it to module.exports
for (let type in messages) {
  if (messages[type]) {
    for (let msgName in messages[type]) {
      if (messages[type].hasOwnProperty(msgName)) {
        module.exports[msgName] = loggerize(messages[type][msgName], type);
      }
    }
  }
}

