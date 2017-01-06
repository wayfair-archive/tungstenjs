/* eslint-env node */

/*
 * Package plugins in UMD modules.
 */

'use strict';

var webpackSettings = require('./webpack-helper');

var entryPoints = {
  'all': ['./plugins/tungsten-event-all'],
  'document': ['./plugins/tungsten-event-document'],
  'focus': ['./plugins/tungsten-event-focus'],
  'intent': ['./plugins/tungsten-event-intent'],
  'mouseenter': ['./plugins/tungsten-event-mouseenter'],
  'outside': ['./plugins/tungsten-event-outside'],
  'submit-data': ['./plugins/tungsten-event-submit-data'],
  'touch': ['./plugins/tungsten-event-touch']
};

module.exports = webpackSettings.compileSource({
  entry: entryPoints,
  output: {
    filename: 'tungsten.event.[name].js',
    libraryTarget: 'umd',
    library: ['tungsten', 'plugins', 'event', '[name]'],
    path: __dirname + '/dist'
  },
  devtool: 'source-map'
});
