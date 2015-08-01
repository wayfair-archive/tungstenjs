var path = require('path');

module.exports = {
  entry: './js/app',
  output: {
    filename: './js/app.min.js'
  },
  resolve: {
    alias: {
      // Tungsten.js doesn't need jQuery, but backbone needs a subset of jQuery APIs.  Backbone.native
      // implements tha minimum subset of required functionality
      'jquery': 'backbone.native',
      //  Aliases for the current version of tungstenjs above the ./examples directory.  If
      //  examples dir is run outside of main tungstenjs repo, remove these aliases
      //  and use via normal modules directories (e.g., via NPM)
      'tungstenjs/adaptors/backbone-reflux' : path.join(__dirname, '../../adaptors/backbone-reflux'),
      'tungstenjs/src/template/template': path.join(__dirname, '../../src/template/template'),
      'tungstenjs' : '../../src'
    }
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
    modulesDirectories: ['node_modules', path.join(__dirname, '../../node_modules/'), path.join(__dirname, '../../precompile')]
  },
  devtool: '#source-map',
  module: {
    loaders: [
      { test: /\.mustache$/, loader: 'tungsten_template' },
      {test: /\.js$/, loader: 'babel?stage=0', exclude: /node_modules/},
      { test: /\.json$/, loader: 'json-loader' }
    ]
  }
};