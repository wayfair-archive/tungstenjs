'use strict';
/*eslint-enable no-console */
if (!global._console) {
  var override = function(name) {
    _console[name] = console[name];
    console[name] = function() {
      _console[name].apply(_console, arguments);
    };
  };
  // Wrap Console methods so that we can spy on console calls
  global._console = {};
  var loggerMethods = ['info', 'debug', 'log', 'warn', 'error', 'trace'];
  for (var i = 0; i < loggerMethods.length; i++) {
    override(loggerMethods[i]);
  }
}

// Loads all files in this directory ending with "_spec.js"
var ctx = require.context(__dirname, true, /_spec\.js$/);
var files = ctx.keys();
for (i = 0; i < files.length; i++) {
  ctx(files[i]);
}
