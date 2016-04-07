var webpackHelper = require('../webpack-helper.js');
var path = require('path');
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

function getLoader(extension) {
  if (doCoverage) {
    return [{
      test: /\.js(on)?$/,
      loader: 'istanbul-instrumenter?extension=' + extension
    }];
  } else {
    return [];
  }
}

var debugConfig = webpackHelper.compileSource({
  entry: path.join(__dirname, '/test_target'),
  output: {
    filename: path.join(__dirname, '/testbuild.debug.js'),
    libraryTarget: 'commonjs2'
  },
  resolveLoader: {
    modules: [
      path.join(__dirname, './_loaders')
    ]
  },
  module: {
    loaders: getLoader('.js')
  },
  resolve: {
    alias: {
      'jquery': path.join(__dirname, '../src/polyfill/jquery')
    }
  }
}, true, true);

var prodConfig = webpackHelper.compileSource({
  entry: path.join(__dirname, '/test_target'),
  output: {
    filename: path.join(__dirname, '/testbuild.prod.js'),
    libraryTarget: 'commonjs2'
  },
  resolveLoader: {
    modules: [
      path.join(__dirname, './_loaders')
    ]
  },
  module: {
    loaders: getLoader('.prod.js')
  },
  resolve: {
    alias: {
      'jquery': path.join(__dirname, '../src/polyfill/jquery')
    }
  }
}, false, true);

function getErrorString(err, stats) {
  var errStr = err;
  if (!err && stats.compilation.errors.length) {
    errStr = stats.compilation.errors.map(function (err) {
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
