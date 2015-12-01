'use strict';

var contextAdaptor = require('../../../adaptors/backbone/context_adaptor.js');
var Context = require('../../../src/template/template_context.js');

describe('template_context.js public api', function() {
  describe('lookup', function() {
    beforeEach(function() {
      Context.setAdapterFunctions(contextAdaptor);
    });
    it('can execute functions', function() {
      var _foo = {
        bar: {}
      };
      var data = {
        foo: function() {
          return _foo;
        }
      };
      var view = new Context(data);
      expect(view.lookup('foo')).to.equal(_foo);
      expect(view.lookup('foo.bar')).to.equal(_foo.bar);
    });
    it('can take a function to invoke functions with', function() {
      var _foo = {
        bar: {}
      };
      var data = {
        foo: function() {
          return _foo;
        }
      };
      var view = new Context(data);
      var handled = false;
      var handle = function(fn, ctx) {
        handled = true;
        expect(fn).to.equal(data.foo);
        expect(ctx).to.equal(data);
        return _foo.bar;
      };
      expect(view.lookup('foo', handle)).to.equal(_foo.bar);
      expect(handled).to.be.true;
    });
  });
});
