var path = require('path');

var loaders = [
  { test: /\.mustache$/, loader: 'tungsten_template' },
  { test: /\.json$/, loader: 'json-loader' }
];

var isDev = false;
for (var i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--dev') {
    isDev = true;
    break;
  }
}

if (!isDev) {
  loaders.push({ test: /\.js$/, loader: 'webpack-strip-block' });
}

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
      'tungstenjs/adaptors/backbone' : path.join(__dirname, '../../adaptors/backbone'),
      'tungstenjs/src/template/template': path.join(__dirname, '../../src/template/template'),
      'tungstenjs' : '../../src'
    }
  },
  resolveLoader: {
    modulesDirectories: ['node_modules', path.join(__dirname, '../../node_modules/'), path.join(__dirname, '../../precompile')]
  },
  module: {
    loaders: loaders
  }
};
