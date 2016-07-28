/**
 * Container for generic compiler error messages that can be extended based on needs
 *
 * @author    Henry Morgan <hemorgan@wayfair.com>
 */
'use strict';

const compilerLogger = require('./compiler_logger');
const _ = require('underscore');

module.exports = {};

/**
 * Compiler error messages, categorized by type.
 * Each message must be in a function. This function must return either a string, or an array whose first element is a string
 * @type {Object}
 */
var messages = {
  warn: {
    elementIsAVoidElementSoDoesNotNeedAClosingTag: (name) => `${name} is a void element so does not need a closing tag`,
    cannotPlaceThisTagWithinAPreviousTag: (value, prevTagName, isValid) => `Cannot place this ${value} tag within a ${prevTagName} tag. ${isValid}`,
    templateContainsUnclosedItems: (stack) => ['Template contains unclosed items', stack],
    mustacheTokenCannotBeInAttributeNames: (token) => ['Mustache token cannot be in attribute names', token],
    doubleCurlyInterpolatorsCannotBeInAttributes: (itemValue) => ['Double curly interpolators cannot be in attributes', itemValue]
  },
  exception: {
    notAllTagsWereClosedProperly: (stack) => ['Not all tags were closed properly', stack],
    wrongClosingElementType: (name, current) => `</${name}> where a </${current}> should be`,
    closingHTMLElementWithNoPair: (closingElemTagName) => `</${closingElemTagName}> with no paired <${closingElemTagName}>`,
    closingMustacheElementWithNoPair: (closingElemValue) => `{{/${closingElemValue}}} with no paired {{#${closingElemValue}}}`,
    tagIsClosedBeforeOpenTagIsCompletedCheckForUnpairedQuotes: () => 'Tag is closed before open tag is completed. Check for unpaired quotes',
    differentTagThanExpected: (actualTag, expectedTag) => `${actualTag} where a ${expectedTag} should be`
  }
};

/**
 * Returns a compilerLogger call with the provided message and type
 * @param  {function} message  function that returns an array containing the message and any additional arguments
 * @param  {string} type The type of log to make (warning or exception)
 * @return {function}      Function that calls compilerLogger with the provided message and type
 */
function compilerLoggerize(message, type) {
  return function() {
    let output = message.apply(message, arguments);

    // Make output always be an array.
    // (compilerLogger expects a series of arguments. For apply to work correctly we must provide an array.)
    if (!_.isArray(output)) {
      output = [output];
    }
    compilerLogger[type].apply(compilerLogger, output);

    // Return the message in case it's needed. (I.E. for utils.alert)
    return output;
  };
}

/**
 * Extends a generic error message with custom information (i.e. implementation-specific hints)
 * and then adds the compilerLoggerized version of the extended message to module.exports.
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
      // compilerLoggerize the message and add it to module.exports.
      module.exports[errorName] = compilerLoggerize(messages[type][errorName], type);
      return;
    }
  }

  // No error was found matching the name provided.
  compilerLogger.warn(`Tried to extend a nonexistent error message: ${errorName}`);
}

module.exports.extend = extend;

// For each log type, loggerize each message and add it to module.exports
for (let type in messages) {
  for (let msgName in messages[type]) {
    module.exports[msgName] = compilerLoggerize(messages[type][msgName], type);
  }
}
