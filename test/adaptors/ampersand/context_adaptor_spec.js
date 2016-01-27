'use strict';

var AmpersandAdaptor = require('../../../adaptors/ampersand');
var contextAdaptor = require('../../../adaptors/ampersand/context_adaptor.js');
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
      var Model = AmpersandAdaptor.Model.extend({
        props: {
          'foo': {
            'type': 'string',
            'default': 'foobar'
          }
        }
      });
      var model = new Model({});
      model.bar = {};
      expect(callLookup(model, 'foo')).to.equal(model.get('foo'));
      expect(callLookup(model, 'bar')).to.equal(model.bar);
      expect(callLookup(model, 'baz')).to.be.null;
      expect(callLookup(model, 'attributes')).to.be.null;
    });
    it('can look up from collections', function() {
      var collection = new AmpersandAdaptor.Collection([]);
      collection.foo = {};
      expect(callLookup(collection, 'foo')).to.equal(collection.foo);
      expect(callLookup(collection, 'models')).to.be.null;
      expect(callLookup(collection, 'baz')).to.be.null;
    });
  });
});
