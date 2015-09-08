/**
 * Run this file to execute tests
 */

var path = require('path');
var Config = require('istanbul/lib/config');

var mkdirp = require('mkdirp');
var Store = require('istanbul/lib/store/index.js');
Store.loadAll();
var Report = require('istanbul/lib/report/index.js');
Report.loadAll();
var Reporter = require('istanbul/lib/reporter');
var Collector = require('istanbul/lib/collector');

function getReporter(variable, dir) {
  var config = Config.loadObject({
    instrumentation: {
      variable: variable
    },
    reporting: {
      dir: dir,
      reports: ['lcov', 'text-summary']
    }
  });

  var reporter = new Reporter(config);
  var reportingDir = path.resolve(config.reporting.dir());
  mkdirp.sync(reportingDir);
  reporter.dir = reportingDir;
  reporter.addAll(config.reporting.reports());

  return function() {
    var collector = new Collector();
    collector.add(global[variable]);
    console.error('Writing coverage reports at [' + reportingDir + ']');
    reporter.write(collector, true, function() { });
    console.log('\n\n');
  };
}

var reporter = getReporter('__coverage__', path.join(__dirname, './coverage'));

module.exports = function() {
  reporter();
};
