module.exports = {
  entry: './js/app',
  output: {
    filename: './js/app.min.js'
  },
  resolve: {
    alias: {
      'jquery': 'backbone.native',
      'featuredetect': 'browsernizr'
    }
  },
  resolveLoader: {
    modulesDirectories: ['node_modules', '../../precompile']
  },
  module: {
    loaders: [
      { test: /\.mustache$/, loader: 'tungsten_template' }
    ]
  }
};