/* eslint-env node */
'use strict';

var path = require('path');

module.exports = function (root, options) {
  'use strict';

  var tungstenPath = '../dist/tungsten.backbone.web.js';
  if (options && options.dev) {
    tungstenPath = '../dist/tungsten.backbone.debug.web.js';
  }

  return {
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
        'tungstenjs': path.join(__dirname, tungstenPath)
      }
    },
    module: {
      loaders: [
        {test: /\.mustache$/, loader: path.join(__dirname, '../precompile/tungsten_template')},
        {test: /\.js$/, loader: 'babel', exclude: /node_modules/}
      ]
    }
  };
};
