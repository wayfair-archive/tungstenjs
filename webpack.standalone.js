/* eslint-env node */

'use strict';

var webpackSettings = require('./webpack-helper');
var path = require('path');

module.exports = function(options) {
  // set adaptor with --adaptor=adaptor_name
  // set debug mode with --dev=true
  // default is backbone
  var adaptor = options.adaptor || 'backbone';
  var devStr = options.dev ? '.debug' : '';

  // Target environment (eg: web browsers, nodejs)
  // https://webpack.github.io/docs/configuration.html#target
  var envStr = options.env || 'web';
  return webpackSettings.compileSource({
    entry: './adaptors/' + adaptor,
    output: {
      filename: './dist/tungsten.' + adaptor + devStr + '.' + envStr + '.js',
      libraryTarget: 'umd',
      library: 'tungsten'
    },
    target: envStr,
    resolve: {
      alias: {
        jquery: path.join(__dirname, './src/polyfill/jquery')
      }
    },
    resolveLoader: {
      modules: [path.join(__dirname, 'node_modules')]
    },
    module: {
      preLoaders: [
        { test: /\.js$/, loader: 'source-map-loader' }
      ],
      loaders: []
    },
    devtool: 'source-map'
  }, options.dev, options.test);
};
