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

var partials = {}, name = '';
_.forEach(fs.readdirSync('templates'), function(fileName) {
  name = fileName.substr(0, fileName.indexOf('.mustache'));
  partials[name] = name;
});
app.set('partials', partials);

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/js', express.static(__dirname + '/js'));

app.engine('mustache', hoganExpress);

app.set('views', __dirname + '/templates');

var appData = _.extend(data, {
  partials: partials
});

app.get('/', function(req, res) {
  res.locals = {};
  return res.render('index', appData);
});

var PORT = 8000;
console.log('Listening on localhost:' + PORT + '...');
opener(
  'http://localhost:' + PORT
);

app.listen(PORT);