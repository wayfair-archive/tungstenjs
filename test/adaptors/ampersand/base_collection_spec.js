'use strict';

var AmpersandAdaptor = require('../../../adaptors/ampersand');
var BaseCollection = AmpersandAdaptor.Collection;
var Ampersand = AmpersandAdaptor.Ampersand;
var logger = require('../../../src/utils/logger');

describe('base_collection.js public api', function() {
  describe('extend', function() {
    it('should be a function', function() {
      expect(BaseCollection.extend).to.be.a('function');
    });
    it('should accept one argument', function() {
      expect(BaseCollection.extend).to.have.length(1);
    });
    it('should be different than Ampersand\'s', function() {
      expect(BaseCollection.extend).not.to.equal(Ampersand.Collection.extend);
    });
  });
});

describe('base_collection.js static api', function() {
  describe('extend', function () {
    it('should be a function', function() {
      expect(BaseCollection.extend).to.be.a('function');
      expect(BaseCollection.extend).to.have.length(1);
    });
    it('should call extend', function() {
      spyOn(Ampersand.Collection, 'extend');
      BaseCollection.extend({});
      jasmineExpect(Ampersand.Collection.extend).toHaveBeenCalled();
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
        initialize: initFn,
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
      expect(BaseCollection.prototype.postInitialize).to.have.length(0);
    });
  });
  describe('trigger', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.trigger).to.be.a('function');
      expect(BaseCollection.prototype.trigger).to.have.length(0);
    });
  });
  describe('reset', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.reset).to.be.a('function');
      expect(BaseCollection.prototype.reset).to.have.length(2);
    });
  });
  describe('serialize', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.serialize).to.be.a('function');
      expect(BaseCollection.prototype.serialize).to.have.length(0);
    });
  });
  /* develblock:start */
  describe('initDebug', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.initDebug).to.be.a('function');
      expect(BaseCollection.prototype.initDebug).to.have.length(0);
    });
  });
  describe('getDebugName', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.getDebugName).to.be.a('function');
      expect(BaseCollection.prototype.getDebugName).to.have.length(0);
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
      expect(BaseCollection.prototype.getChildren).to.have.length(0);
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
      expect(BaseCollection.prototype.getFunctions).to.have.length(2);
    });
  });
  /* develblock:end */
});
