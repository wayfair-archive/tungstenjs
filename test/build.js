var webpackHelper = require('../webpack-helper.js');

var webpack = require('webpack');
/**
 * Build files use non-js extension to avoid linting
 */

var debugConfig = webpackHelper({
  entry: __dirname + '\\test_target',
  output: {
    filename: __dirname + '/testbuild.debug.js',
    libraryTarget: 'commonjs2'
  },
  resolveLoader: {
    modulesDirectories: ['test/_loaders']
  },
  module: {
    loaders: [{
      test: /\.js(on)?$/,
      loader: 'istanbul-instrumenter?coverageVar=__coverage_debug__'
    }]
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
    filename: __dirname + '/testbuild.prod.js',
    libraryTarget: 'commonjs2'
  },
  resolveLoader: {
    modulesDirectories: ['test/_loaders']
  },
  node: {
    fs: 'empty'
  },
  module: {
    loaders: [{
      test: /\.js(on)?$/,
      loader: 'istanbul-instrumenter?coverageVar=__coverage_prod__'
    }]
  },
  resolve: {
    alias: {
      'jquery': 'backbone.native'
    }
  }
}, false);

function getErrorString(err, stats) {
  var errStr = err;
  if (!err && stats.compilation.errors.length) {
    err = stats.compilation.errors.map(function (err) {
      return err.message;
    }).join('\n');
  }

  return errStr || 'No errors';
}

webpack(debugConfig, function(err, stats) {
  console.log('Debug built:\n', getErrorString(err, stats));
  webpack(prodConfig, function(err, stats) {
    console.log('Prod built:\n', getErrorString(err, stats));
  });
});
