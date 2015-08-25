var webpackHelper = require('./webpack-helper.js');

module.exports = webpackHelper({
  output: {
    libraryTarget: 'commonjs2'
  }
});
