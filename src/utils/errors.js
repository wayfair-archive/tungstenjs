/**
 * Container for generic error messages that can be extended based on needs
 *
 * @author    Henry Morgan <hemorgan@wayfair.com>
 */
'use strict';

const logger = require('./logger');

/**
 * Extends a generic error message with custom information, i.e. implementation-specific hints
 * @param  {string} error The name of the error function to extend
 * @param  {string} customMsg The custom message to append to the generic error message.
 */
function extend(error, customMsg) {
  if (!this.hasOwnProperty(error)) {
    logger.warn(`Tried to extend a nonexistent error message: ${error}`);
    return;
  }
  let origError = this[error];
  this[error] = function() {
    return `${origError.apply(origError, arguments)}. ${customMsg}`;
  };
}

module.exports = {
  extend: extend,

  childViewWasPassedAsObjectWithoutAScopeProperty: () => 'ChildView was passed as object without a scope property',
  collectionMethodMayNotBeOverridden: function(methodName, debugName = null) {
    return `Collection.${methodName} may not be overridden` + (debugName ? ` for collection "${debugName}"` : '');
  },
  collectionExpectedArrayOfObjectsButGot: (initialStr) => `Collection expected array of objects but got: ${initialStr}`,
  modelMethodMayNotBeOverridden: function(methodName, debugName = null) {
    return `Model.${methodName} may not be overridden` + (debugName ? ` for model "${debugName}"` : '');
  },
  modelExpectedObjectOfAttributesButGot: (initialStr) => `Model expected object of attributes but got: ${initialStr}`,
  domDoesNotMatchVDOMForView: (debugName) => `DOM does not match VDOM for view "${debugName}". Use debug panel to see differences`,
  viewMethodMayNotBeOverridden: function(methodName, debugName = null) {
    return `View.${methodName} may not be overridden` + (debugName ? ` for view "${debugName}"` : '');
  },
  componentFunctionMayNotBeCalledDirectly: (fn) => `Component.${fn} may not be called directly`,
  cannotOverwriteComponentMethod: (fn) => `Cannot overwrite component method: ${fn}`,
  unableToParseToAValidValueMustMatchJSONFormat: (value) => `Unable to parse "${value}" to a valid value. Input must match JSON format`,
  widgetTypeHasNoTemplateToStringFunctionFallingBackToDOM: (name) => `Widget type: ${name} has no templateToString function, falling back to DOM`,
  unableToLaunchDebugPanel: () => 'Unable to launch debug panel. You may need to allow the popup or run "window.launchDebugger()" from your console',
  objectDoesNotMeetExpectedEventSpec: () => 'Object does not meet expected event spec',
  warningNoPartialRegisteredWithTheName: (partialName) => `Warning: no partial registered with the name ${partialName}`,
  notAllTagsWereClosedProperly: () => 'Not all tags were closed properly',
  elementIsAVoidElementSoDoesNotNeedAClosingTag: (name) => `${name} is a void element so does not need a closing tag`,
  wrongClosingElementType: (name, current) => `</${name}> where a </${current}> should be`,
  cannotPlaceThisTagWithinAPreviousTag: (value, prevTagName, isValid) => `Cannot place this ${value} tag within a ${prevTagName} tag. ${isValid}`,
  tagIsClosedBeforeOpenTagIsCompletedCheckForUnpairedQuotes: () => 'Tag is closed before open tag is completed. Check for unpaired quotes',
  differentTagThanExpected: (actualTag, expectedTag) => `${actualTag} where a ${expectedTag} should be`,
  closingHTMLElementWithNoPair: (closingElemTagName) => `</${closingElemTagName}> with no paired <${closingElemTagName}>`,
  closingMustacheElementWithNoPair: (closingElemValue) => `{{/${closingElemValue}}} with no paired {{#${closingElemValue}}}`,
  templateContainsUnclosedItems: () => 'Template contains unclosed items',
  mustacheTokenCannotBeInAttributeNames: () => 'Mustache token cannot be in attribute names',
  doubleCurlyInterpolatorsCannotBeInAttributes: () => 'Double curly interpolators cannot be in attributes',
  tagsImproperlyPairedClosing: (tagName, openID, id) => `${tagName} tags improperly paired, closing ${openID} with close tag from ${id}`,
  closingElementWhenTheStackWasEmpty: (id) => `Closing element ${id} when the stack was empty`,
  computedPropertiesAreNowDeprecatedPleaseChange: (name) => `Computed properties are now deprecated and will be removed soon. Please change "${name}" to a derived property`
};
