/**
 * Adaptor specific code for context lookups
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */

'use strict';

/**
 * Lookup value from given context view
 * @param  {Object} view Context to lookup values from
 * @param  {String} name String value to check
 * @return {Any?}        Value from view or null
 */
var lookupValue = function(view, name) {
  var value = null;
  if (view[name] != null) {
    value = view[name];
  }

  if (typeof value === 'function') {
    value = value.call(view);
  }
  return value;
};

module.exports = {
  lookupValue: lookupValue
};