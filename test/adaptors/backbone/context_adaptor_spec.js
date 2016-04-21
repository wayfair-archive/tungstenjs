'use strict';

var BackboneAdaptor = require('../../../adaptors/backbone');
var contextAdaptor = require('../../../adaptors/backbone/context_adaptor.js');
var Context = require('../../../src/template/template_context.js');

describe('context_adaptor.js public api', function() {
  describe('initialize', function() {
    it('should be a function', function() {
      expect(contextAdaptor.initialize).to.be.a('function');
      expect(contextAdaptor.initialize).to.have.length(2);
    });
    it('should accept a parent context', function() {
      var ctx = {};
      var parent = {};
      contextAdaptor.initialize.call(ctx, null, parent);
      expect(ctx.parent).to.equal(parent);
    });
    it('should use a view\'s parent', function() {
      var ctx = {};
      var view = {
        parent: {}
      };
      contextAdaptor.initialize.call(ctx, view);
      expect(ctx.parent).to.be.instanceof(Context);
      expect(ctx.parent.view).to.equal(view.parent);
    });
    it('should use a view\'s collection', function() {
      var ctx = {};
      var view = {
        collection: {}
      };
      contextAdaptor.initialize.call(ctx, view);
      expect(ctx.parent).to.be.instanceof(Context);
      expect(ctx.parent.view).to.equal(view.collection);
    });
  });
  describe('lookupValue', function() {
    var ctx, callLookup;
    beforeEach(function() {
      ctx = new Context({});
      callLookup = function(view, key) {
        return contextAdaptor.lookupValue.call(ctx, view, key);
      };
    });
    afterEach(function() {
      ctx = callLookup = undefined;
    });
    it('can look up from models', function() {
      var model = new BackboneAdaptor.Model({
        foo: {}
      });
      model.bar = {};
      expect(callLookup(model, 'foo')).to.equal(model.get('foo'));
      expect(callLookup(model, 'bar')).to.equal(model.bar);
      expect(callLookup(model, 'baz')).to.be.null;
      expect(callLookup(model, 'attributes')).to.be.null;
    });
    it('can look up from collections', function() {
      var collection = new BackboneAdaptor.Collection([]);
      collection.foo = {};
      expect(callLookup(collection, 'foo')).to.equal(collection.foo);
      expect(callLookup(collection, 'model')).to.be.null;
      expect(callLookup(collection, 'baz')).to.be.null;
    });
  });
  describe('registerLambda', function() {
    it('should be a function', function() {
      expect(Context.registerLambda).to.be.a('function');
      expect(Context.registerLambda).to.have.length(2);
    });
    it('validates its inputs', function() {
      function invalidName() {
        Context.registerLambda(5, function(text) {
          text += 'foo';
        });
      }
      function invalidFunction1() {
        Context.registerLambda('baz', 'bar');
      }
      function invalidFunction2() {
        Context.registerLambda('baz', function() {});
      }
      function validFunction() {
        Context.registerLambda('baz', function(text) {
          return text + '';
        });
      }
      expect(invalidName).to.throw();
      expect(invalidFunction1).to.throw();
      expect(invalidFunction2).to.throw();
      expect(validFunction).not.to.throw();
    });
    it('can registerLambdas', function() {
      var ctx = new Context({});
      var actual = null;
      ctx.lookup('foo', function(value) {
        actual = value;
      });
      expect(actual).to.be.null;
      // At least one argument must be set to be a lambda vs computed property
      var fooFunction = function(text) {
        // using text to avoid sniffs
        text += 'foo';
      };
      Context.registerLambda('foo', fooFunction);
      // Creating a new context to avoid cache
      ctx = new Context({});
      actual = null;
      ctx.lookup('foo', function(value) {
        actual = value;
      });
      expect(actual).to.equal(fooFunction);
    });
  });
});
