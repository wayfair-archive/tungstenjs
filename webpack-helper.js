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


/**
 * Extends an existing webpack config with necessary loaders for Tungsten
 *
 * @param  {Object}  config Base webpack config
 * @param  {Boolean} dev    Whether to render in Dev mode (debugger, improved errors, etc)
 * @param  {Boolean} test   Whether to render in Test mode (additional exposed functionality for tests)
 * @param  {String} modulesProp the webpack config prop for 'modules' (determined
 *                              by whether to use the webpack 1.x config style)
 *
 * @return {Object}         Updated webpack config object
 */
module.exports = function(config, dev, test, modulesProp) {
  modulesProp = modulesProp || 'modules';
  config.resolveLoader = config.resolveLoader || {};
  config.resolveLoader[modulesProp] = config.resolveLoader[modulesProp] || [];

  config.resolveLoader[modulesProp].push(path.join(__dirname, 'precompile'));

  config.module = config.module || {};
  config.module.loaders = config.module.loaders || [];
  config.module.preLoaders = config.module.preLoaders || [];

  ensureLoader(config.module.loaders, /\.json$/, 'json-loader');
  ensureLoader(config.module.loaders, /\.mustache$/, 'tungsten_template');

  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};
  config.resolve.alias.entities = path.join(__dirname, './node_modules/entities');
  config.resolve.alias.global = path.join(__dirname, './node_modules/global');

  return config;
};

module.exports.compileSource = function(config, dev, test, legacyWebpack) {
  var modulesProp = 'modules';
  if (legacyWebpack) {
    modulesProp = 'modulesDirectories';
  }
  config = module.exports(config, dev, test, modulesProp);

  config.resolveLoader = config.resolveLoader || {};
  config.resolveLoader[modulesProp].push(path.join(__dirname, 'node_modules'));
  config.plugins = config.plugins || [];
  if (!dev) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      mangle: false
    }));
  }
  config.plugins.push(new webpack.DefinePlugin({
    TUNGSTENJS_VERSION: JSON.stringify(require('./package.json').version),
    TUNGSTENJS_IS_TEST: test,
    TUNGSTENJS_DEBUG_MODE: dev || undefined
  }));

  // Babel should be run on our code, but not node_modules
  var folders = ['adaptors', 'examples', 'precompile', 'src', 'test'];
  folders = folders.map(function(folder) {
    var fullpath = path.join(__dirname, folder + '/').replace(/\\/g, '\\\\');
    return fullpath + '.*\.js';
  });
  var babelRegexStr = '^(' + folders.join('|') + ')$';
  ensureLoader(config.module.loaders, new RegExp(babelRegexStr), 'babel');


  return config;
};
