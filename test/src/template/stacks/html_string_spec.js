var compiler = require('../../../../src/template/compiler/index');
var HtmlStringStack = require('../../../../src/template/stacks/html_string');
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

describe('attribute values spec', function() {
  it('should output attribute values', function() {
    var compiledTemplate = compiler('<div data-test="{{foo}}"></div>');
    var stack = new HtmlStringStack();
    compiledTemplate.template._iterate(null, {foo: 'test'}, null, null, stack);
    var output = stack.getOutput();
    expect(output).to.equal('<div data-test="test"></div>');
  });
  it('should escape quotes in attribute values', function() {
    var compiledTemplate = compiler('<div data-test="{{foo}}"></div>');
    var stack = new HtmlStringStack();
    compiledTemplate.template._iterate(null, {foo: '{"test":1}'}, null, null, stack);
    var output = stack.getOutput();
    expect(output).to.equal('<div data-test="{&quot;test&quot;:1}"></div>');
  });

  it('should output property values', function() {
    var compiledTemplate = compiler('<input value="{{foo}}">');
    var stack = new HtmlStringStack();
    compiledTemplate.template._iterate(null, {foo: 'test'}, null, null, stack);
    var output = stack.getOutput();
    expect(output).to.equal('<input value="test">');
  });
  it('should escape quotes in property values', function() {
    var compiledTemplate = compiler('<input value="{{foo}}">');
    var stack = new HtmlStringStack();
    compiledTemplate.template._iterate(null, {foo: '{"test":1}'}, null, null, stack);
    var output = stack.getOutput();
    expect(output).to.equal('<input value="{&quot;test&quot;:1}">');
  });

  it('should escape quotes in loose text', function() {
    var compiledTemplate = compiler('<div>{{foo}}</div>');
    var stack = new HtmlStringStack();
    compiledTemplate.template._iterate(null, {foo: '{"test":1}'}, null, null, stack);
    var output = stack.getOutput();
    expect(output).to.equal('<div>{&quot;test&quot;:1}</div>');
  });
});
