/* eslint-env node */
/* eslint-disable no-console */
var fs = require('fs');
var path = require('path');
var flags = require('./build/flags');
var _ = require('underscore');
var chokidar = require('chokidar');


readConfig();

function doBuild(logSeparator) {
  if (logSeparator === true) {
    console.log('-----------------------------------------');
  }
  var s = Date.now();
  console.log('Starting build...');
  var bundleMap = require('./build/build_bundles')();
  // require('./build/build_pages')(bundleMap);
  require('./build/build_examples')(bundleMap);
  console.log('Completed build: ' + (Date.now() - s) + 'ms');
}

var config;
function readConfig() {
  try {
    config = global.config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json')));
  } catch (ex) {
    console.error('Config file unable to be parsed: ' + ex.message);
  }
}

var watcher;
function getWatcher() {
  if (watcher) {
    watcher.close();
  }
  var filesToWatch = {};
  filesToWatch[path.join(__dirname, './templates')] = true;
  _.each(config.bundles, function(contents) {
    for (var i = 0; i < contents.length; i++) {
      filesToWatch[path.join(__dirname, contents[i])] = true;
    }
  });
  _.each(config.pages, function(page) {
    if (page.src) {
      filesToWatch[path.join(__dirname, page.src)] = true;
    }
  });
  watcher = chokidar.watch(_.keys(filesToWatch));
  watcher.on('change', doBuild.bind(null, true));
}

if (flags.watch) {
  getWatcher();
  chokidar.watch(path.join(__dirname, './config.json')).on('change', function() {
    getWatcher();
    doBuild(true);
  });
}
doBuild();
