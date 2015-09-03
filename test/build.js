var webpackHelper = require('../webpack-helper.js');

var webpack = require('webpack');
/**
 * Build files use non-js extension to avoid linting
 */

var doCoverage = false;
var args = process.argv;
for (var i = 0; i < args.length; i++) {
  if (args[i] === '--coverage') {
    doCoverage = true;
    break;
  }
}

function getLoader(variable) {
  if (doCoverage) {
    return [{
      test: /\.js(on)?$/,
      loader: 'istanbul-instrumenter?coverageVar=' + variable
    }];
  } else {
    return [];
  }
}

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
    loaders: getLoader('__coverage_debug__')
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
  module: {
    loaders: getLoader('__coverage_prod__')
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
