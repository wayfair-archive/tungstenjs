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
  devtool: '#eval-source-map',
  resolveLoader: {
    modulesDirectories: ['node_modules', path.join(__dirname, 'precompile')]
  },
  module: {
    preLoaders: [
      {test: /\.js$/, loader: 'webpack-strip-block'}
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {test: /\.mustache$/, loader: 'tungsten_template'},
      {test: /\.json$/, loader: 'json-loader'}
    ]
  }
};
