/* eslint-env node */
/* eslint-disable no-console */
'use strict';

var webpack = require('webpack');
var file = require('./file');

module.exports = function() {
  var files = file.find('../examples/*/build.js');
  files.forEach(function(buildConfig) {

  });
};
