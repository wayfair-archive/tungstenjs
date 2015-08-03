var webpack = require('webpack');
var path = require('path');

module.exports = {
  output: {
    libraryTarget: 'var',
    library: 'tungsten'
    //
    // -- For AMD output --
    // libraryTarget: 'amd'
    // library: 'tungsten', // For named AMD, uncomment this line
    //
    // -- For UMD output --
    // libraryTarget: 'umd',
    // library: 'tungsten'
  },
  resolve: {
    alias: {
      'jquery': 'backbone.native'
    }
  },
  resolveLoader: {
    modulesDirectories: ['node_modules', path.join(__dirname, 'precompile')]
  },
  module: {
    loaders: [
      // { test: /\.js$/, loader: 'webpack-strip-block' },
      { test: /\.html$/, loader: 'debug_template' },
      { test: /\.css$/, loader: 'static_file' },
      { test: /\.mustache$/, loader: 'tungsten_template' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  }
};