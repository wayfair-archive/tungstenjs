/* eslint-env node */
var path = require('path');

function processArg(arg) {
  var parts = arg.split('=');
  var data = {
    name: parts[0]
  };
  if (parts[1]) {
    data.value = parts[1];
  }
  return data;
}

function processArgs() {
  var argData = {};
  var args = process.argv;
  for (var i = 0; i < args.length; i++) {
    // Only process flags
    if (args[i] && args[i].substr(0, 1) === '-') {
      var arg = processArg(args[i]);
      argData[arg.name] = arg.value;
    }
  }
  return argData;
}

module.exports = function (root) {
  'use strict';
  var args = processArgs();
  var tungstenPath = '../dist/tungsten.backbone.web.js';
  if (args.hasOwnProperty('--dev')) {
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
    resolveLoader: {
      modulesDirectories: [path.join(root, 'node_modules')]
    },
    module: {
      loaders: [{
        test: /\.mustache$/,
        loader: path.join(__dirname, '../precompile/tungsten_template')
      }]
    }
  };
};
