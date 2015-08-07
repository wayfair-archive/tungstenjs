'use strict';
var _ = require('underscore');
module.exports = function(originalExtend) {
  return function(options, classOptions) {
    var proto = this.prototype;
    var keys = _.intersection(_.keys(proto), _.keys(options));
    _.each(keys, function(key) {
      if (_.isObject(options[key]) && _.isObject(proto[key])) {
        _.extend(options[key], proto[key]);
      }
    });
    return originalExtend.call(this, options, classOptions);
  };
};
