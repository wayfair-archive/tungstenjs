// to build: webpack --config webpack.dist.js --backbone
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
    adaptor: './adaptors/' + adaptorName,
    tungsten: './tungsten'
  },
  output: {
    filename: './dist/[name].js',
    libraryTarget: 'var',
    library: 'tungsten'
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
    new webpack.optimize.CommonsChunkPlugin('./dist/adaptor.js', './dist/tungsten.js')
  ]
});
