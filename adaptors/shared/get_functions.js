'use strict';
module.exports = function(trackedFunctions, getTrackableFunction, obj, parentPrototype, blacklist) {
  var result = [];
  for (var key in obj) {
    if (typeof obj[key] === 'function' && blacklist[key] !== true) {
      result.push({
        name: key,
        fn: obj[key],
        inherited: (obj[key] === parentPrototype[key])
      });
      obj[key] = getTrackableFunction(obj, key, trackedFunctions);
    }
  }
  // Support for non-enumerable methods...such as methods in es6 transpiled classes
  if (typeof Object.getOwnPropertyNames === 'function' && obj.constructor && obj.constructor.prototype) {
    var allProps = Object.getOwnPropertyNames(obj.constructor.prototype);
    for (var i = 0; i < allProps.length; i++) {
      if (!(obj.propertyIsEnumerable(allProps[i])) && typeof obj[allProps[i]] === 'function' && blacklist[allProps[i]] !== true) {
        result.push({
          name: allProps[i],
          fn: obj[allProps[i]],
          inherited: (allProps[i] in parentPrototype)
        });
        obj[allProps[i]] = getTrackableFunction(obj, allProps[i], trackedFunctions);
      }
    }
  }
  return result;
};
