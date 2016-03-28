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
  var files = file.find('../examples/*/build.js');
  var here = path.resolve('.');
  var examples = [];
  var promises = [];

  files.forEach(function(buildConfigFile) {
    var buildConfig = require(buildConfigFile);
    var exampleFolder = path.dirname(buildConfigFile);
    var exampleFolderName = path.basename(exampleFolder);
    var exampleOutputFolder = 'examples' + path.sep + exampleFolderName;
    var webpackEntry = path.join(exampleFolder, buildConfig.config.entry);
    buildConfig.config.entry = path.relative(here, webpackEntry);
    buildConfig.config.output.path = file.outputPath(exampleOutputFolder);
    if (!buildConfig.files) {
      buildConfig.files = [];
    }
    buildConfig.files.push('./index.html');

    var pageData = {
      name: buildConfig.name,
      url_name: 'examples__' + exampleFolderName + '.html',
      iframe: exampleOutputFolder + path.sep + 'index.html'
    };
    examples.push(pageData);

    var promise = Q.defer();
    promises.push(promise.promise);
    webpack(buildConfig.config, function(err, stats) {
      console.log(buildConfig.name + ' built: ' + getErrorString(err, stats));
      buildConfig.files.forEach(function(filePath) {
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



    // var data = _.extend({}, global.config.pageData, page, {
    //   content: content,
    //   js: bundleMap[page.js],
    //   css: bundleMap[page.css]
    // });
    // file.writeHtml('examples.html', compiledTemplates[global.config.pageTemplate].toString(data));

    console.log('all Examples built!');
  });
};
