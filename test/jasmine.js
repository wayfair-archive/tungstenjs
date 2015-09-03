/**
 * Run this file to execute tests
 */
var args = process.argv;
var specVersion = 'all';
for (var i = 0; i < args.length; i++) {
  if (args[i].substr(0, 10) === '--testenv=') {
    specVersion = args[i].substr(10);
    break;
  }
}

var specFiles = [];
if (specVersion != 'debug') {
  specFiles.push('./testbuild.prod.js');
}
if (specVersion != 'prod') {
  specFiles.push('./testbuild.debug.js');
}

var Jasmine = require('jasmine');

var jasmine = new Jasmine();
jasmine.onComplete(function() {
  require('istanbul').Report.create('text-summary');
});
jasmine.loadConfig({
  'spec_dir': 'test',
  'spec_files': specFiles,
  'helpers': [
    'environment.js',
    '../precompile/tungsten_template/inline.js'
  ]
});
jasmine.execute();
