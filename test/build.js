var webpackHelper = require('../webpack-helper.js');

var webpack = require('webpack');
var path = require('path');
/**
 * Build files use non-js extension to avoid linting
 */

var debugConfig = webpackHelper({
  entry: __dirname + '/test_target',
  output: {
    filename: __dirname + '/testbuild.debug.js',
    libraryTarget: 'commonjs2'
  },
  resolveLoader: {
    modulesDirectories: ['test/_loaders']
  },
//  module: {
//    loaders: [
//      {
//        test: /node_modules|test/,
//        loader: 'istanbul-ignore'
//      }
//    ]
//  },
//
  resolve: {
    alias: {
      'jquery': 'backbone.native'
    }
  }
}, true);

var prodConfig = webpackHelper({
  entry: __dirname + '/test_target',
  output: {
    filename: __dirname + '/testbuild.prod.js',
    libraryTarget: 'commonjs2'
  },
  resolveLoader: {
    modulesDirectories: ['test/_loaders']
  },
  module: {
    loaders: [
      {
        test: /node_modules|test/,
        loader: 'istanbul-ignore'
      }
    ]
  },
  resolve: {
    alias: {
      'jquery': 'backbone.native'
    }
  }
}, false);

webpack(debugConfig, function(err) {
  console.log('Debug built', err || 'No errors');
  webpack(prodConfig, function(err) {
    console.log('Prod built', err || 'No errors');
  });
});
