'use strict';
/* global process, __dirname */
var path = require('path');
var webpack = require('webpack');
function ensureLoader(loaders, test, loader) {
  for (var i = 0; i < loaders.length; i++) {
    var l = loaders[i];
    if (l.test.source === test.source && l.loader === loader) {
      return;
    }
  }
  loaders.push({
    test: test,
    loader: loader
  });
}
function processArg(arg) {
  var parts = arg.split('=');
  var data = {
    name: parts[0]
  };
  if (parts[1]) {
    data.value = parts[1];
  }
  return data;
}

function processArgs() {
  var argData = {};
  var args = process.argv;
  for (var i = 0; i < args.length; i++) {
    // Only process flags
    if (args[i] && args[i].substr(0, 1) === '-') {
      var arg = processArg(args[i]);
      argData[arg.name] = arg.value;
    }
  }
  return argData;
}

/**
 * Extends an existing webpack config with necessary loaders for Tungsten
 *
 * @param  {Object}  config Base webpack config
 * @param  {Boolean} dev    Whether to render in Dev mode (debugger, improved errors, etc)
 * @param  {Boolean} test   Whether to render in Test mode (additional exposed functionality for tests)
 *
 * @return {Object}         Updated webpack config object
 */
module.exports = function(config, dev, test) {
  var args = processArgs();
  // If dev is not explicitly set to a boolean, check for the command line flag
  if (dev !== Boolean(dev)) {
    dev = args.hasOwnProperty('--dev');
  }
  // If test is not explicitly set to a boolean, check for the command line flag
  if (test !== Boolean(test)) {
    test = args.hasOwnProperty('--test');
  }
  config.plugins = config.plugins || [];
  config.plugins.push(new webpack.DefinePlugin({
    TUNGSTENJS_VERSION: JSON.stringify(require('./package.json').version),
    TUNGSTENJS_IS_TEST: test
  }));

  config.resolveLoader = config.resolveLoader || {};
  config.resolveLoader.modulesDirectories = config.resolveLoader.modulesDirectories || [];

  config.resolveLoader.modulesDirectories.push(path.join(__dirname, 'precompile'));
  config.resolveLoader.modulesDirectories.push(path.join(__dirname, 'node_modules'));

  config.module = config.module || {};
  config.module.loaders = config.module.loaders || [];
  config.module.preLoaders = config.module.preLoaders || [];

  // Babel should be run on our code, but not node_modules
  var folders = ['adaptors', 'examples', 'precompile', 'src', 'test'];
  folders = folders.map(function(folder) {
    var fullpath = path.join(__dirname, folder + '/').replace(/\\/g, '\\\\');
    return fullpath + '.*\.js';
  });
  var babelRegexStr = '^(' + folders.join('|') + ')$';

  if (!dev) {
    ensureLoader(config.module.preLoaders, /\.js$/, 'webpack-strip-block');
  }
  ensureLoader(config.module.loaders, /\.json$/, 'json-loader');
  ensureLoader(config.module.loaders, new RegExp(babelRegexStr), 'babel');
  ensureLoader(config.module.loaders, /\.mustache$/, 'tungsten_template');

  return config;
};
