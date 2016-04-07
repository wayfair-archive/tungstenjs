/**
 * Simple express server for static files
 * Serves to localhost:8000
 */
'use strict';

var _ = require('underscore');
var express = require('express');
var hoganExpress = require('hogan-express');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpack = require('webpack');
var path = require('path');
var openerFn = require('opener');
var fs = require('fs');

var exampleRoot;
var args = process.argv;
for (var i = 0; i < args.length; i++) {
  if (args[i].substr(0, 10) === '--example=') {
    exampleRoot = path.join(__dirname, args[i].substr(10));
    break;
  }
}
if (!exampleRoot) {
  process.exit(1);
}
var webpackConfig = require(path.join(exampleRoot, './webpack.config.js'));


var compiler = webpack(webpackConfig());

var app = express();

app.engine('mustache', hoganExpress);
app.set('views', path.join(exampleRoot, './templates'));
app.set('view engine', 'mustache');

app.use(webpackDevMiddleware(compiler, {
  watch: true,
  publicPath: '/'
}));

app.use('/', express.static(exampleRoot + 'index.html'));
app.use('/js', express.static(exampleRoot + '/js'));
app.use('/node_modules', express.static(exampleRoot + '/node_modules'));
app.use('/vendor', express.static(exampleRoot + '/vendor'));

app.use('/css', express.static(exampleRoot + '/css'));

var partials = {};
var nullPartials = {};
_.forEach(fs.readdirSync('templates'), function(fileName) {
  var name = fileName.substr(0, fileName.indexOf('.mustache'));
  partials[name] = name;
  nullPartials[name] = null;
});

var appData = {};
var dataPath = path.join(exampleRoot, './js/data.js');
if (fs.existsSync(dataPath)) {
  appData = require(dataPath);
}
var appDataPartials = _.extend({
  partials: partials
}, appData);

app.get('/', function(req, res) {
  if (partials.index) {
    // Prefer server-render where available
    if (req.query.raw !== undefined) {
      // raw renders with no partials so we can test dynamicInitialize
      res.render('index', appData);
    } else {
      res.render('index', appDataPartials);
    }
  } else if (fs.existsSync('./index.html')) {
    // Fall back to index.html
    res.sendFile(path.join(exampleRoot, './index.html'));
  } else {
    // No clue
    res.send('Unable to find root page');
  }
});

var PORT = 8000;
console.log('Listening on localhost:' + PORT + '...');
openerFn(
  'http://localhost:' + PORT
);

app.listen(PORT);
