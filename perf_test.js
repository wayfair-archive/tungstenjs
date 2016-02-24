'use strict';

var _ = require('underscore');
require('./test/environment');
var Context = require('./src/template/template_context');
var compiler = require('./precompile/tungsten_template/inline');
var Timer = require('./src/debug/timer');

// Using simplified lookup functions
Context.setAdapterFunctions({
  initialize: function(view, parentContext) {
    if (view == null) {
      view = {};
    }
    this.parent = parentContext;
  },
  lookupValue: function(view, name) {
    var value = null;
    if (view && view[name] != null) {
      value = view[name];
    }
    return value;
  }
});

function getTemplate(templateStr, partials) {
  return compiler(templateStr || '', partials || {});
}

// Sample template with most Mustache features
// Section - Array
// Partial
// Static attribute
// Dynamic attribute
// Escaped text
// Unescaped text with HTML
var template = function() {
  return getTemplate('<select>\r\n{{#options}}  {{> option}}{{/options}}</select>', {
    option: '<option value="{{index}}" {{#even}}class="even"{{/even}} {{^even}}class="odd "{{/even}}>{{text}} {{nothing}} {{{raw_html}}} {{{raw_text}}}</option>\r\n'
  });
};
var data = {
  raw_html: '<b>test &amp;</b>',
  raw_text: 'test',
  nothing: undefined,
  options: _.map(new Array(1000), function(v, i) {
    return {
      index: i,
      text: '"' + i + '"',
      even: i % 2 === 0
    };
  })
};

// Average render time over ten runs
// Using timer to grab any other timer data that is set
var t1 = new Timer('perf_run');
for (let i = 0; i < 10; i++) {
  template();
  t1.log('compiled');
}

// Average render time over ten runs
// Using timer to grab any other timer data that is set
var templateObj = template();
var t2 = new Timer('perf_run');
for (let i = 0; i < 10; i++) {
  templateObj.toVdom(data);
  t2.log('rendered');
}
