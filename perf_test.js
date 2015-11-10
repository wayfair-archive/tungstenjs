// Pre-abstraction 2591ee60e614f3059ba346fe66c1ad54c4e2bc18
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

    if (typeof value === 'function') {
      value = value.call(view);
    }
    return value;
  }
});

function getTemplate(templateStr, partials) {
  return compiler(templateStr || '', partials || {});
}

var template = getTemplate('<select>{{#options}}<option value="{{index}}" {{#even}}class="even"{{/even}} {{^even}}class="odd"{{/even}}>{{index}}</options> {{/option}}');
var data = {
  options: _.map(new Array(1000), function(v, i) {
    return {
      index: i,
      even: i % 2 === 0
    };
  })
};

for (var i = 0; i < 10; i++) {
  var t = new Timer('run');
  template.toVdom(data);
  t.check('done');
}

