'use strict';

/* eslint-env node */
module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
  this.cacheable();
  var request = 'require(' + JSON.stringify(remainingRequest) + ')';

  if (this.query === '?fn') {
    return 'var cached;' +
      'module.exports = function() {' +
        'if (!cached) { cached = ' + request + '; }' +
        'var args = new Array(arguments.length);' +
        'for (var i = 0; i < args.length; i++) {' +
            'args[i] = arguments[i];' +
        '}' +
        'switch (args.length) {' +
          'case 0: return cached.call(this);' +
          'case 1: return cached.call(this, args[0]);' +
          'case 2: return cached.call(this, args[0], args[1]);' +
          'case 3: return cached.call(this, args[0], args[1], args[2]);' +
          'case 4: return cached.call(this, args[0], args[1], args[2], args[3]);' +
          'default: return cached.apply(this, args);' +
        '}' +
      '};';
  } else {
    return 'var cached;' +
      'module.exports = function() {' +
        'if (!cached) { cached = ' + request + '; }' +
        'return cached;' +
      '};';
  }
};
