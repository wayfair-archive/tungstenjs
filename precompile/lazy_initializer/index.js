'use strict';

const querystring = require('querystring');

/* eslint-env node */
module.exports = function() {};
module.exports.pitch = function() {
  this.cacheable();

  var query = querystring.parse(this.query.substr(1));
  var request = 'require(' + JSON.stringify(query.request) + ')';

  if (query.constructorFn) {
    return 'var cached;' +
      'module.exports = function() {' +
        'if (!cached) { cached = ' + request + '; }' +
        'var args = new Array(arguments.length);' +
        'for (var i = 0; i < args.length; i++) {' +
            'args[i] = arguments[i];' +
        '}' +
        'switch (args.length) {' +
          'case 0: return new cached();' +
          'case 1: return new cached(args[0]);' +
          'case 2: return new cached(args[0], args[1]);' +
          'case 3: return new cached(args[0], args[1], args[2]);' +
          'case 4: return new cached(args[0], args[1], args[2], args[3]);' +
          'default: console.error("lazyRequireConstructor cannot handle more than four parameters");' +
        '}' +
      '};';
  } else if (query.fn) {
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
