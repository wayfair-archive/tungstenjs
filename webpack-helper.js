'use strict';
/* global process, __dirname */

var path = require('path');

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



/**
 * Extends an existing webpack config with necessary loaders for Tungsten
 *
 * @param  {Object}  config Base webpack config
 * @param  {Boolean} dev    Whether to render in Dev mode (debugger, improved errors, etc)
 *
 * @return {Object}         Updated webpack config object
 */
module.exports = function(config, dev) {
  // If dev is not explicitly set, check for the command line flag
  if (dev === undefined) {
    var args = process.argv;
    for (var i = 0; i < args.length; i++) {
      if (args[i] === '--dev') {
        dev = true;
        break;
      }
    }
  }

  config.resolveLoader = config.resolveLoader || {};
  config.resolveLoader.modulesDirectories = config.resolveLoader.modulesDirectories || [];

  config.resolveLoader.modulesDirectories.push(path.join(__dirname, 'precompile'));
  config.resolveLoader.modulesDirectories.push(path.join(__dirname, 'node_modules'));

  config.module = config.module || {};
  config.module.loaders = config.module.loaders || [];
  config.module.preLoaders = config.module.preLoaders || [];

  if (!dev) {
    ensureLoader(config.module.preLoaders, /\.js$/, 'webpack-strip-block');
  }
  ensureLoader(config.module.loaders, /\.json$/, 'json-loader');
  ensureLoader(config.module.loaders, /tungstenjs[\\\/].*\.js$/, 'babel');
  ensureLoader(config.module.loaders, /\.mustache$/, 'tungsten_template');

  return config;
};
