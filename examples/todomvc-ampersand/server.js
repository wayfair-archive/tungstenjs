/**
 * Simple express server with mustache template rendering via hogan.
 * Serves to localhost:8000
 */

var express = require('express'),
  hoganExpress = require('hogan-express'),
  _ = require('underscore'),
  fs = require('fs'),
  data = require('./js/data.js'),
  webpackDevMiddleware = require('webpack-dev-middleware'),
  webpack = require('webpack'),
  webpackConfig = require('./webpack.config.js'),
  opener = require('opener');

var compiler = webpack(webpackConfig);

var app = express();

app.set('view engine', 'mustache');

app.set('layout', 'index');

app.use(webpackDevMiddleware(compiler, {
  watch: true,
  publicPath: '/'
}));


app.set('partials', {
  todo_app_view: 'todo_app_view'
});

var filesToServe = ['/node_modules/todomvc-app-css/index.css', '/js/app.min.js', '/js/app.min.js.map', '/js/data.js'];

filesToServe.forEach(function(fileName) {
  app.get(fileName, function(req, res) {
    res.sendfile(__dirname + fileName);
  });
});

app.engine('mustache', hoganExpress);

app.set('views', __dirname + '/templates');

var appData = _.extend(data, {
  partials: {
    todo_item_view: 'todo_item_view'
  }
});
app.get('/', function(req, res) {
  res.locals = {};
  res.locals.data = 'default data';
  return res.render('index', appData);
});
var PORT = 8000;
console.log('Listening on localhost:' + PORT + '...');
opener(
  'http://localhost:' + PORT
);

app.listen(PORT);