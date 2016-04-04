/* eslint-env node */
/* eslint-disable no-console */
'use strict';

var Q = require('q');
var _ = require('underscore');
var path = require('path');
var webpack = require('webpack');
var file = require('./file');
var compiledTemplates = require('./get_mustache_templates');

function getErrorString(err, stats) {
  var errStr = err;
  if (!err && stats.compilation.errors.length) {
    errStr = stats.compilation.errors.map(function (err) {
      return err.message;
    }).join('\n');
  }

  return errStr || 'No errors';
}

module.exports = function(bundleMap) {
  var examplesToBuild = global.config.examples;
  var here = path.resolve('.');
  var examples = [];
  var promises = [];

  var debuggerButton = '<button ' +
    'onclick="window._launchDebuggerFromEvent()" ' +
    'style="width:100%;background:#8D4377;color:#fff;padding:7px 0;margin-bottom:15px;cursor:pointer;border:none">' +
    'Launch Debugger' +
  '</button>';

  var assetPattern = /(?:<link [^>]*?href="(.*?)">|<script [^>]*?src="(.*?)")/g;
  _.each(examplesToBuild, function(folder, name) {
    var exampleFolder = path.resolve(path.join(__dirname, '../../examples', folder));
    var exampleOutputFolder = 'examples' + path.sep + folder;

    var indexHtml = path.join(exampleFolder, 'index.html');
    if (!file.exists(indexHtml)) {
      throw 'No index.html at "' + indexHtml + '"';
    }
    var htmlContent = file.read(indexHtml);
    var matches = htmlContent.match(assetPattern) || [];
    var files = [];
    matches.forEach(function(match) {
      var matchItem = assetPattern.exec(match);
      var file = matchItem[1] || matchItem[2];
      assetPattern.lastIndex = 0;
      if (file !== 'js/app.min.js') {
        files.push(file);
      }
    });
    htmlContent = htmlContent.replace(/<body>/, '<body>' + debuggerButton);

    var webpackConfigPath = path.join(exampleFolder, 'webpack.config.js');
    if (!file.exists(webpackConfigPath)) {
      throw 'No webpack.config.js at "' + webpackConfigPath + '"';
    }
    var webpackConfig = require(webpackConfigPath);
    var webpackEntry = path.join(exampleFolder, webpackConfig.entry);
    webpackConfig.entry = path.relative(here, webpackEntry);
    webpackConfig.output.path = file.outputPath(exampleOutputFolder);
    // Force tungsten alias to the Debug build
    webpackConfig.resolve.alias.tungstenjs = webpackConfig.resolve.alias.tungstenjs.replace('tungsten.backbone.web.js', 'tungsten.backbone.debug.web.js');

    var pageData = {
      name: name,
      url_name: 'examples__' + folder + '.html',
      iframe: exampleOutputFolder + path.sep + 'index.html'
    };
    examples.push(pageData);

    var promise = Q.defer();
    promises.push(promise.promise);
    webpack(webpackConfig, function(err, stats) {
      console.log(name + ' built: ' + getErrorString(err, stats));
      file.write(path.join(exampleOutputFolder, 'index.html'), htmlContent);
      files.forEach(function(filePath) {
        file.write(path.join(exampleOutputFolder, filePath), file.read(path.join(exampleFolder, filePath)));
      });
      promise.resolve();
    });
  });

  return Q.allSettled(promises).then(function() {
    global.config.pageData.examples = examples;
    var baseData = _.extend({}, global.config.pageData, {
      css: bundleMap['css/all.css'],
      js: bundleMap['js/all.js'],
      pageClass: 'example_page'
    });
    var template = compiledTemplates[global.config.pageTemplate];

    examples.forEach(function(example, i) {
      var data = _.extend(baseData, {
        content: '<iframe src="' + example.iframe + '" frameborder="0"></iframe>'
      });
      file.writeHtml(example.url_name, template.toString(data));
      if (i === 0) {
        file.writeHtml('examples.html', template.toString(data));
      }
    });

    console.log('all Examples built!');
  });
};
