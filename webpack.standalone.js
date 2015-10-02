// to build: webpack --config webpack.standalone.js --backbone
var path = require('path');
var webpack = require('webpack');
var webpackSettings = require('./webpack-helper');
var adaptorName = '';
process.argv.forEach(function (val) {
  switch(val) {
    case '--ampersand':
    case '--backbone':
      adaptorName = val.substr(2);
      break;
  }
});
if(!adaptorName) {
  throw('Must declare an adaptor option');
}
console.log('Building tungsten.js + ' + adaptorName + ' adaptor');
module.exports = webpackSettings({
  entry: {
    'adaptor': './adaptors/' + adaptorName,
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
    new webpack.optimize.CommonsChunkPlugin('./dist/tungsten.adaptor.js', './dist/tungsten.core.js')
  ]
});
