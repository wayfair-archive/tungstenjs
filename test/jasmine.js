/**
 * Run this file to execute tests
 */
var doCoverage = false;
var args = process.argv;
for (var i = 0; i < args.length; i++) {
  if (args[i] === '--coverage') {
    doCoverage = true;
    break;
  }
}

var Jasmine = require('jasmine');
var jasmine = new Jasmine();
if (doCoverage) {
  var istanbulRunReports = require('./istanbul');
  jasmine.onComplete(function() {
    // Restore console functions so reports work
    for (var name in global.console) {
      console[name] = _console[name];
    }
    istanbulRunReports();
  });
}

// Override console methods as spies
// Allows test to run without output getting into test output
global._console = {};
for (var name in global.console) {
  _console[name] = console[name].bind(console);
  console[name] = jasmine.jasmine.createSpy('console.' + name);
}

// Include event simulator to install global.triggerEvent
require('./event_simulator.js');

jasmine.loadConfig({
  'spec_dir': 'test',
  'spec_files': [
    './testbuild.prod.js',
    './testbuild.debug.js'
  ],
  'helpers': [
    'environment.js',
    '../precompile/tungsten_template/inline.js'
  ]
});
jasmine.execute();