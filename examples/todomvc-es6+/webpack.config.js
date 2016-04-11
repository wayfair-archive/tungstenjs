var path = require('path');

module.exports = function(options) {
  var config = require('../base_webpack.config.js')(__dirname, options);
  config.resolveLoader.root = path.join(__dirname, 'node_modules');
  config.module.loaders.unshift({
    test: /\.js$/,
    loader: 'babel', exclude: /node_modules/
  });
  return config;
};
