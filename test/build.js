var webpackHelper = require('../webpack-helper.js');

var webpack = require('webpack');

/**
 * Build files use non-js extension to avoid linting
 */

var debugConfig = webpackHelper({
  entry: __dirname + '/test_target',
  output: {
    filename: __dirname + '/test.debug',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: {
      'jquery': 'backbone.native'
    }
  }
}, true);

var prodConfig = webpackHelper({
  entry: __dirname + '/test_target',
  output: {
    filename: __dirname + '/test.prod',
    libraryTarget: 'commonjs2'
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
