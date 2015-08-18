var path = require('path');
var webpackSettings = require('../../webpack-helper');

module.exports = webpackSettings({
  entry: './js/app',
  output: {
    filename: './js/app.min.js',
    path: path.resolve('./js')
  },
  resolve: {
    alias: {
      // Tungsten.js doesn't need jQuery, but backbone needs a subset of jQuery APIs.  Backbone.native
      // implements tha minimum subset of required functionality
      'jquery': 'backbone.native',
      //  Aliases for the current version of tungstenjs above the ./examples directory.  If
      //  examples dir is run outside of main tungstenjs repo, remove these aliases
      //  and use via normal modules directories (e.g., via NPM)
      'tungstenjs/adaptors/ampersand' : path.join(__dirname, '../../adaptors/ampersand'),
      'tungstenjs/src/template/template': path.join(__dirname, '../../src/template/template'),
      'tungstenjs' : '../../src'
    }
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  }
});
