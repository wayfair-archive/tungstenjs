/*
 * Parser for Markdown templates
 * Based on Marked - https://github.com/chjj/Marked
 */
var Marked = require('marked');
var _ = require('underscore');
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

module.exports = {

  markedOptions: {},

  supportedExtensions: ['.markdown', '.md'],

  parse: function(input, callback) {
    var self = this;
    var output, err;

    Marked.setOptions(self.markedOptions);

    try {
      output = Marked.parse(input.toString());
    } catch (error) {
      err = error;
    }

    return callback(err, output);
  },

  setup: function(config) {
    var self = this;
    var defaultMarkedOptions = {
      gfm: true,
      pedantic: false,
      sanitize: false,
      renderer: renderer
    };

    if (config.parser) {
      self.markedOptions = _.extend(defaultMarkedOptions, config.parser.markdown);
    } else {
      self.markedOptions = defaultMarkedOptions;
    }
  }

};
