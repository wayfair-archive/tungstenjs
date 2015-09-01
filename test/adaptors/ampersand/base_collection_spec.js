'use strict';

var AmpersandAdaptor = require('../../../adaptors/ampersand');
var BaseCollection = AmpersandAdaptor.Collection;
var Ampersand = AmpersandAdaptor.Ampersand;

describe('base_collection.js public api', function () {
  describe('extend', function () {
    it('should be a function', function () {
      expect(BaseCollection.extend).to.be.a('function');
    });
    it('should accept one argument', function () {
      expect(BaseCollection.extend.length).to.equal(1);
    });
    it('should be different than Ampersand\'s', function() {
      expect(BaseCollection.extend).not.to.equal(Ampersand.Collection.extend);
    });
  });
});

describe('base_collection.js constructed api', function () {
  describe('postInitialize', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.postInitialize).to.be.a('function');
      expect(BaseCollection.prototype.postInitialize.length).to.equal(0);
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
      expect(BaseCollection.prototype.serialize.length).to.equal(0);
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