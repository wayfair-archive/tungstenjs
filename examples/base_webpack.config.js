var path = require('path');
var webpackSettings = require('../webpack-helper');

module.exports = function (root) {
  'use strict';
  return webpackSettings.compileSource({
    entry: './js/app',
    output: {
      filename: './js/app.min.js',
      path: path.resolve('.')
    },
    resolve: {
      alias: {
        // Tungsten.js doesn't need jQuery, but backbone needs a subset of jQuery APIs.  Backbone.native
        // implements tha minimum subset of required functionality
        'jquery': path.join(__dirname, '../src/polyfill/jquery'),
        //  Aliases for the current version of tungstenjs above the ./examples directory.  If
        //  examples dir is run outside of main tungstenjs repo, remove these aliases
        //  and use via normal modules directories (e.g., via NPM)
        'tungstenjs': path.join(__dirname, '..')
      }
    },
    resolveLoader: {
      modulesDirectories: [path.join(root, 'node_modules')]
    },
    module: {
      loaders: []
    }
  });
};
