/* eslint-env node */
'use strict';

/*
 * Parser for Markdown templates
 * Based on Marked - https://github.com/chjj/Marked
 */
var Marked = require('marked');
var hljs = require('highlight.js');
hljs.registerLanguage('mustache', require('./mustache_syntax'));

var renderer = new Marked.Renderer();

var syntaxes = {
  'javascript': 'javascript',
  'html': 'mustache'
};

renderer.code = function (code, lang) {
  var syntax = syntaxes[lang];
  if (!syntax) {
    return code;
  }
  return '<pre><code class="hljs">' + hljs.highlight(syntax, code).value + '</code></pre>';
};

var markedOptions = {
  gfm: true,
  pedantic: false,
  sanitize: false,
  renderer: renderer
};
Marked.setOptions(markedOptions);

module.exports = function(input, callback) {
  return Marked.parse(input.toString());
};
