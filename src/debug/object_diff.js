'use strict';

import _ from 'underscore';

/**
 * Naive function to check if the input is a plain object
 * @param  {Any}  obj Object to check
 * @return {Boolean}  Whether it is a plain object
 */
function isPlainObject(obj) {
  return obj && obj.constructor === Object;
}

function diffValues(diff, key, start, end) {
  if (start == null) {
    diff[key] = end;
  } else if (_.isArray(end) && _.isArray(start)) {
    var result = {};
    var isDifferent = false;
    if (start.length !== end.length) {
      isDifferent = true;
      result.length = end.length;
    }
    for (var j = 0; j < end.length; j++) {
      result[j] = objectDiff(start[j], end[j]);
      isDifferent = isDifferent || (_.size(result[j]) > 0);
    }

    if (isDifferent) {
      diff[key] = result;
    }
  } else if (isPlainObject(end) && isPlainObject(start)) {
    diff[key] = objectDiff(start, end);
  } else if (end !== start) {
    diff[key] = end;
  }
}

function objectDiff(start, end) {
  var diff = {};
  var keys;
  var key;

  if (end == null) {
    return end;
  }

  keys = _.keys(end);
  var handledKeys = {};
  for (var i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    handledKeys[key] = true;
    diffValues(diff, key, start && start[key], end && end[key]);
  }

  keys = _.keys(start);
  for (i = 0, l = keys.length; i < l; i++) {
    key = keys[i];
    // Handle and keys that were removed
    if (!handledKeys[key]) {
      diffValues(diff, key, start && start[key], end && end[key]);
    }
  }

  return diff;
}

function applyPatch(obj, patch) {
  if (obj == null) {
    return patch;
  } else if (patch != null) {
    var keys = _.keys(patch);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      var start = obj[key];
      var end = patch[key];
      if (end == null) {
        obj[key] = end;
      } else if (_.isArray(start)) {
        if (end.length !== undefined) {
          obj[key].length = end.length;
        }
        for (var j = 0, k = obj[key].length; j < k; j++) {
          obj[key][j] = applyPatch(obj[key][j], end[j]);
        }
      } else if (isPlainObject(start)) {
        obj[key] = applyPatch(start, end);
      } else {
        obj[key] = end;
      }
    }
  }
  return obj;
}

function cloneDeep(obj) {
  var r = _.clone(obj);
  _.each(r, function(val, key) {
    if (_.isArray(val)) {
      r[key] = _.map(val, cloneDeep);
    } else if (isPlainObject(val)) {
      r[key] = cloneDeep(val);
    }
  });

  return r;
}

function patchObject(start, patches) {
  var result = cloneDeep(start);
  for (var i = 0; i < patches.length; i++) {
    applyPatch(result, patches[i]);
  }
  return result;
}

module.exports = {
  diff: objectDiff,
  patch: patchObject
};
