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
  jasmine.onComplete(require('./istanbul'));
}
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
