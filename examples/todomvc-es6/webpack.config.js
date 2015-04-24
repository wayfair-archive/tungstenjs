module.exports = {
  entry: './js/app',
  output: {
    filename: './js/app.min.js'
  },
  resolve: {
    alias: {
      'jquery': 'backbone.native'
    }
  },
  resolveLoader: {
    modulesDirectories: ['node_modules', 'node_modules/tungstenjs/precompile']
  },
  devtool: '#source-map',
  module: {
    loaders: [
      {test: /\.mustache$/, loader: 'tungsten_template'},
      {test: /\.js$/, loader: 'babel-loader?stage=0', exclude: /node_modules/}
    ]
  }
};