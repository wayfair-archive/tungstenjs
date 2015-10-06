var webpack = require('webpack');
var path = require('path');

module.exports = {
  output: {
    libraryTarget: 'var',
    library: 'tungsten'
    //
    // -- For AMD output --
    // libraryTarget: 'amd'
    // library: 'tungsten', // For named AMD, uncomment this line
    //
    // -- For UMD output --
    // libraryTarget: 'umd',
    // library: 'tungsten'
  },
  resolve: {
    alias: {
      'jquery': 'backbone.native'
    }
  },
  resolveLoader: {
    modulesDirectories: ['node_modules', path.join(__dirname, 'precompile')]
  },
  plugins: [
    new webpack.DefinePlugin({
      TUNGSTENJS_VERSION: JSON.stringify(require('./package.json').version)
    })
  ],
  module: {
    loaders: [
      {test: /\.js$/, loader: 'webpack-strip-block'},
      {test: /\.mustache$/, loader: 'tungsten_template'},
      {test: /\.json$/, loader: 'json-loader'}
    ]
  }
};
