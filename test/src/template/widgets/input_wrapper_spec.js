'use strict';

var InputWrapper = require('../../../../src/template/widgets/input_wrapper.js');
var Context = require('../../../../src/template/template_context.js');
var compiler = require('../../../../src/template/compiler');

describe('input_wrapper.js public API', function() {
  it('should be a function', function() {
    expect(InputWrapper).to.be.a('function');
    expect(InputWrapper).to.have.length(5);
  });
  describe('input_wrapper prototype', function() {
    var template, context, instance;
    beforeEach(function() {
      template = compiler('<input type="text" value="{{value}}" />').template;
      context = new Context({value: 'value'});
      instance = new InputWrapper(template, null, context, null);
    });
    it('should have a property type', function() {
      expect(instance.type).to.equal('Widget');
    });
    describe('InputWrapper.init', function() {
      it('should have an init function', function() {
        expect(instance.init).to.be.a('function');
        expect(instance.init).to.have.length(0);
        expect(instance.init).to.equal(InputWrapper.prototype.init);
      });
      it('should create an input node', function() {
        var output = instance.init();
        expect(output.nodeType).to.equal(document.ELEMENT_NODE);
        expect(output.value).to.equal(context.lookup('value'));
      });
    });
    describe('InputWrapper.update', function() {
      it('should have an update function', function() {
        expect(instance.update).to.be.a('function');
        expect(instance.update).to.have.length(2);
        expect(instance.update).to.equal(InputWrapper.prototype.update);
      });
      it('should update a node', function() {
        var prevContext = new Context({value: 'old value'});
        var prev = new InputWrapper(template, null, prevContext, null);
        var elem = prev.init();
        instance.update(prev, elem);
        expect(elem.value).not.to.equal(prevContext.lookup('value'));
        expect(elem.value).to.equal(context.lookup('value'));
      });
      it('should not a node if the values match', function() {
        var prev = new InputWrapper(template, null, context, null);
        var elem = prev.init();
        instance.update(prev, elem);
        expect(elem.value).to.equal(context.lookup('value'));
      });
    });
  });
});
