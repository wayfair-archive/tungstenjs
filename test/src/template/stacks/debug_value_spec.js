var compiler = require('../../../../src/template/compiler/index');
var DebugValueStack = require('../../../../src/template/stacks/debug_value');
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
  it('should return the raw unrendered value', function() {
    var compiledTemplate = compiler('{{{foo.bar}}}');
    var data = {
      foo: {
        bar: {}
      }
    };
    var output = compiledTemplate.template._render(null, data, null, null, new DebugValueStack());
    expect(output).to.equal(data.foo.bar);
  });
  it('can handle null lookups', function() {
    var compiledTemplate = compiler('');
    var output = compiledTemplate.template._render(null, {}, null, null, new DebugValueStack());
    expect(output).to.be.null;
  });
  it('can handle multiple lookups', function() {
    var compiledTemplate = compiler('{{{foo}}}{{{foo.bar}}}');
    var data = {
      foo: {
        bar: {}
      }
    };
    var output = compiledTemplate.template._render(null, data, null, null, new DebugValueStack());
    expect(output).to.be.an('array');
    expect(output).to.have.length(2);
    expect(output[0]).to.equal(data.foo);
    expect(output[1]).to.equal(data.foo.bar);
  });
});
