'use strict';

var BackboneAdaptor = require('../../../adaptors/backbone');
var BaseCollection = BackboneAdaptor.Collection;
var Backbone = BackboneAdaptor.Backbone;
var logger = require('../../../src/utils/logger');

describe('base_collection.js public api', function() {
  describe('extend', function() {
    it('should be a function', function() {
      expect(BaseCollection.extend).to.be.a('function');
    });
    it('should accept two arguments', function() {
      expect(BaseCollection.extend.length).to.equal(2);
    });
    it('should be different than Backbone\'s', function() {
      expect(BaseCollection.extend).not.to.equal(Backbone.extend);
    });
  });
});

describe('base_collection.js static api', function() {
  describe('extend', function () {
    it('should be a function', function() {
      expect(BaseCollection.extend).to.be.a('function');
      expect(BaseCollection.extend.length).to.equal(2);
    });
    it('should call extend', function() {
      spyOn(Backbone.Collection, 'extend');
      BaseCollection.extend({}, {});
      jasmineExpect(Backbone.Collection.extend).toHaveBeenCalled();
    });
    /* develblock:start */
    it('should prevent initialize from being overwritten', function() {
      spyOn(logger, 'warn');
      spyOn(BaseCollection.prototype, 'initialize');
      var initFn = jasmine.createSpy();
      var testFn = function() {};
      var TestCollection = BaseCollection.extend({
        initialize: initFn,
        test: testFn
      });
      expect(TestCollection.prototype.initialize).not.to.equal(initFn);
      expect(TestCollection.prototype.test).to.equal(testFn);
      jasmineExpect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.calls.argsFor(0)[0]).to.contain('may not be overridden');

      var args = {};
      TestCollection.prototype.initialize(args);
      jasmineExpect(BaseCollection.prototype.initialize).toHaveBeenCalledWith(args);
      jasmineExpect(initFn).toHaveBeenCalledWith(args);
    });
    it('should error with debugName if available', function() {
      spyOn(logger, 'warn');
      var initFn = function() {};
      BaseCollection.extend({
        initialize: initFn
      }, {
        debugName: 'FOOBAR'
      });
      jasmineExpect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.calls.argsFor(0)[0]).to.contain(' for collection "FOOBAR"');
    });
    /* develblock:end */
  });
});

describe('base_collection.js constructed api', function() {
  describe('postInitialize', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.postInitialize).to.be.a('function');
      expect(BaseCollection.prototype.postInitialize.length).to.equal(0);
    });
  });
  describe('resetRelations', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.resetRelations).to.be.a('function');
      expect(BaseCollection.prototype.resetRelations.length).to.equal(1);
    });
  });
  describe('trigger', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.trigger).to.be.a('function');
      expect(BaseCollection.prototype.trigger.length).to.equal(0);
    });
  });
  describe('reset', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.reset).to.be.a('function');
      expect(BaseCollection.prototype.reset.length).to.equal(2);
    });
  });
  describe('serialize', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.serialize).to.be.a('function');
      expect(BaseCollection.prototype.serialize.length).to.equal(1);
    });
  });
  describe('doSerialize', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.doSerialize).to.be.a('function');
      expect(BaseCollection.prototype.doSerialize.length).to.equal(0);
    });
  });
  /* develblock:start */
  describe('initDebug', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.initDebug).to.be.a('function');
      expect(BaseCollection.prototype.initDebug.length).to.equal(0);
    });
  });
  describe('getDebugName', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.getDebugName).to.be.a('function');
      expect(BaseCollection.prototype.getDebugName.length).to.equal(0);
    });
    it('should return the cid if debugName is not available', function() {
      var result = BaseCollection.prototype.getDebugName.call({
        cid: 'collection1'
      });

      expect(result).to.equal('collection1');
    });
    it('should return the debugName', function() {
      var result = BaseCollection.prototype.getDebugName.call({
        cid: 'collection1',
        constructor: {
          debugName: 'FOOBAR'
        }
      });

      expect(result).to.equal('FOOBAR1');
    });
  });
  describe('getChildren', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.getChildren).to.be.a('function');
      expect(BaseCollection.prototype.getChildren.length).to.equal(0);
    });
    it('should return the collection\'s models', function() {
      var collection = {
        models: {}
      };
      expect(BaseCollection.prototype.getChildren.call(collection)).to.equal(collection.models);
    });
  });
  describe('getFunctions', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.getFunctions).to.be.a('function');
      expect(BaseCollection.prototype.getFunctions.length).to.equal(2);
    });
  });
  /* develblock:end */
});
