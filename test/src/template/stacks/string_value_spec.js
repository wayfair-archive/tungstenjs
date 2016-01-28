var compiler = require('../../../../src/template/compiler/index');
var StringStack = require('../../../../src/template/stacks/string');
var Context = require('../../../../src/template/template_context');

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

describe('debug_value spec', function() {
  it('should error if an element is encountered', function() {
    var compiledTemplate = compiler('<div></div>');
    var fn = function() {
      compiledTemplate.template._iterate(null, {}, null, null, new StringStack());
    };
    expect(fn).to.throw();
  });
  it('should error if a comment is encountered', function() {
    var compiledTemplate = compiler('<!-- foo -->');
    var fn = function() {
      compiledTemplate.template._iterate(null, {}, null, null, new StringStack());
    };
    expect(fn).to.throw();
  });
  it('should error if a html is encountered inside a unescaped interpolator', function() {
    var compiledTemplate = compiler('{{{ foo }}}');
    var data = {
      foo: '<div></div>'
    };
    var fn = function() {
      compiledTemplate.template._iterate(null, data, null, null, new StringStack());
    };
    expect(fn).to.throw();
  });
  it('should not error if a html is not encountered inside a unescaped interpolator', function() {
    var compiledTemplate = compiler('{{{ foo }}} & {{{ bar }}}');
    var data = {
      foo: 'bar < foo',
      bar: 'foo < bar'
    };
    var fn = function() {
      compiledTemplate.template._iterate(null, data, null, null, new StringStack());
    };
    expect(fn).not.to.throw();
  });
});
