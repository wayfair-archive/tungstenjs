'use strict';

var BackboneAdaptor = require('../../../adaptors/backbone');
var BaseCollection = BackboneAdaptor.Collection;
var Backbone = BackboneAdaptor.Backbone;

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
  });
  describe('getChildren', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.getChildren).to.be.a('function');
      expect(BaseCollection.prototype.getChildren.length).to.equal(0);
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
