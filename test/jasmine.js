/**
 * Run this file to execute tests
 */
var Jasmine = require('jasmine');

var jasmine = new Jasmine();
jasmine.onComplete(function() {
  require('istanbul').Report.create('text-summary');
});
jasmine.loadConfigFile('./test/jasmine.json');
jasmine.execute();
