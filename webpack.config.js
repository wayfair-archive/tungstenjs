var webpack = require('webpack');
var path = require('path');

module.exports = function(options) {
  return {
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
        'jquery': path.join(__dirname, './src/polyfill/jquery')
      }
    },
    devtool: '#source-map',
    resolveLoader: {
      modules: [path.join(__dirname, 'node_modules'), path.join(__dirname, 'precompile')]
    },
    plugins: [
      new webpack.DefinePlugin({
        TUNGSTENJS_VERSION: JSON.stringify(require('./package.json').version),
        TUNGSTENJS_DEBUG_MODE: options.dev,
        TUNGSTENJS_IS_TEST: options.test
      })
    ],
    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel',
          exclude: /node_modules/
        },
        {test: /\.mustache$/, loader: 'tungsten_template'},
        {test: /\.json$/, loader: 'json-loader'}
      ]
    }
  }
};
