var path = require('path');

var config = require('../base_webpack.config.js')(__dirname);
config.resolveLoader.root = path.join(__dirname, 'node_modules');
config.module.loaders.unshift({
  test: /\.js$/,
  loader: 'babel', exclude: /node_modules/
});

module.exports = config;


