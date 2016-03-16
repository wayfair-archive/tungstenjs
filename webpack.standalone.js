var webpack = require('webpack');
var webpackSettings = require('./webpack-helper');
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
var args = processArgs();

// set adaptor with --adaptor=adaptor_name
// set debug mode with --dev=true
// default is backbone
var adaptor = args['--adaptor'] || 'backbone';
var devStr = args['--dev'] ? '.debug' : '';
module.exports = webpackSettings.compileSource({
  entry: './adaptors/' + adaptor,
  output: {
    filename: './dist/tungsten.' + adaptor + devStr + '.js',
    libraryTarget: 'umd',
    library: 'tungsten'
  },
  target: 'node',
  resolve: {
    alias: {
      jquery: path.join(__dirname, './src/polyfill/jquery')
    }
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  module: {
    loaders: []
  }
});
