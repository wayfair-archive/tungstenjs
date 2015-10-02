var path = require('path');
var webpack = require('webpack');
var webpackSettings = require('./webpack-helper');

module.exports = webpackSettings({
  entry: {
    'backbone': './adaptors/backbone',
    'ampersand': './adaptors/ampersand',
    'core': './tungsten',
    'template': ['./src/template/template.js']
  },
  output: {
    filename: './dist/tungsten.[name].js',
    libraryTarget: 'umd',
    library: ['tungsten', '[name]']
  },
  resolve: {
    alias: {
      'jquery': 'backbone.native',
      'lodash': 'underscore'
    }
  },
  resolveLoader: {
    modulesDirectories: [path.join(__dirname, 'node_modules')]
  },
  devtool: '#eval-source-map',
  module: {
    loaders: []
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('./dist/tungsten.core.js')
  ]
});
