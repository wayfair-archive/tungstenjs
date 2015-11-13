var path = require('path');
var webpack = require('webpack');
var webpackSettings = require('./webpack-helper');

module.exports = webpackSettings({
  entry: {
    'backbone': path.join(__dirname, './adaptors/backbone'),
    'ampersand': path.join(__dirname, './adaptors/ampersand'),
    'core': path.join(__dirname, './tungsten'),
    'template': [path.join(__dirname, './src/template/template.js')]
  },
  output: {
    filename: path.join(__dirname, './dist/tungsten.[name].js'),
    libraryTarget: 'umd',
    library: ['tungsten', '[name]']
  },
  resolve: {
    alias: {
      jquery: 'backbone.native'
    }
  },
  externals: [
    {underscore: 'var window._'},
    {lodash: 'var window._'}
  ],
  resolveLoader: {
    modulesDirectories: [path.join(__dirname, 'node_modules')]
  },
  module: {
    loaders: []
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(path.join(__dirname, './dist/tungsten.core.js'))
  ]
});
