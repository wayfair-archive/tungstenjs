var jsdom = require('jsdom');

var document = jsdom.jsdom('<html><head></head><body></body></html>');
global.document = document;
global.window = document.defaultView;
global.navigator = window.navigator;
global.Element = window.Element;

// Leaving Jasmine expect available for spies
global.jasmineExpect = global.expect;
// Include Chai assertion library
global.expect = require('chai').expect;

module.exports = window;

// Assign variables that webpack would normally build
var packageJson = require('../package.json');
global.TUNGSTENJS_VERSION = 'unbuilt-' + packageJson.version;
global.TUNGSTENJS_IS_TEST = false;
global.TUNGSTENJS_DEBUG_MODE = false;

global.lazyRequire = function(requiring) {
  return function() {
    return require(requiring);
  };
};

global.lazyRequireFn = function(requiring) {
  var cached;
  return function() {
    if (!cached) {
      cached = require(requiring);
    }
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    switch (args.length) {
      case 0:
        return cached.call(this);
      case 1:
        return cached.call(this, args[0]);
      case 2:
        return cached.call(this, args[0], args[1]);
      case 3:
        return cached.call(this, args[0], args[1], args[2]);
      case 4:
        return cached.call(this, args[0], args[1], args[2], args[3]);
      default:
        return cached.apply(this, args);
    }
  };
};

global.lazyRequireConstructor = function(requiring) {
  var Ctor;
  return function() {
    if (!Ctor) {
      Ctor = require(requiring);
    }
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    switch (args.length) {
      case 0:
        return new Ctor();
      case 1:
        return new Ctor(args[0]);
      case 2:
        return new Ctor(args[0], args[1]);
      case 3:
        return new Ctor(args[0], args[1], args[2]);
      case 4:
        return new Ctor(args[0], args[1], args[2], args[3]);
      default:
        console.error('lazyRequireConstructor cannot handle more than four parameters');
    }
  };
};
