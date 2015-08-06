/**
 * Simple express server for static files
 * Serves to localhost:8000
 */

var express = require('express'),
  _ = require('underscore'),
  webpackDevMiddleware = require('webpack-dev-middleware'),
  webpack = require('webpack'),
  webpackConfig = require('./webpack.config.js'),
  opener = require('opener');

var compiler = webpack(webpackConfig);

var app = express();

app.use(webpackDevMiddleware(compiler, {
  watch: true,
  publicPath: '/'
}));

app.use('/', express.static(__dirname + 'index.html'))
app.use('/js/ENV.js', express.static(__dirname + '/js/ENV.js'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/css', express.static(__dirname + '/css'));

app.get('/', function(req, res) {
  res.locals = {};
  return res.sendfile('./index.html');
});

var PORT = 8000;
console.log('Listening on localhost:' + PORT + '...');
opener(
  'http://localhost:' + PORT
);

app.listen(PORT);