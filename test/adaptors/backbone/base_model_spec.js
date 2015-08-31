'use strict';

var BaseModel = require('../../../adaptors/backbone/base_model');
var Backbone = require('backbone');

describe('base_model.js public api', function () {
  describe('extend', function () {
    it('should be a function', function () {
      expect(BaseModel.extend).to.be.a('function');
    });
    it('should accept two arguments', function () {
      expect(BaseModel.extend.length).to.equal(2);
    });
    it('should be different than Backbone\'s', function() {
      expect(BaseModel.extend).not.to.equal(Backbone.extend);
    });
  });
});

describe('base_model.js constructed api', function () {
  describe('tungstenModel', function () {
    it('should be set', function() {
      expect(BaseModel.prototype.tungstenModel).to.be.true;
    });
  });
  describe('set', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.set).to.be.a('function');
      expect(BaseModel.prototype.set.length).to.equal(3);
    });
  });
  describe('toJSON', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.toJSON).to.be.a('function');
      expect(BaseModel.prototype.toJSON.length).to.equal(0);
    });
  });
  describe('doSerialize', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.doSerialize).to.be.a('function');
      expect(BaseModel.prototype.doSerialize.length).to.equal(0);
    });
  });
  describe('serialize', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.serialize).to.be.a('function');
      expect(BaseModel.prototype.serialize.length).to.equal(1);
    });
  });
  describe('clone', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.clone).to.be.a('function');
      expect(BaseModel.prototype.clone.length).to.equal(0);
    });
  });
  describe('postInitialize', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.postInitialize).to.be.a('function');
      expect(BaseModel.prototype.postInitialize.length).to.equal(0);
    });
  });
  describe('getDeep', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getDeep).to.be.a('function');
      expect(BaseModel.prototype.getDeep.length).to.equal(1);
    });
  });
  describe('setRelation', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.setRelation.length).to.equal(3);
    });
  });
  describe('trigger', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.trigger).to.be.a('function');
      expect(BaseModel.prototype.trigger.length).to.equal(0);
    });
  });
  describe('reset', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.reset).to.be.a('function');
      expect(BaseModel.prototype.reset.length).to.equal(2);
    });
  });
  
  /* develblock:start */
  describe('initDebug', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.initDebug).to.be.a('function');
      expect(BaseModel.prototype.initDebug.length).to.equal(0);
    });
  });
  describe('getDebugName', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getDebugName).to.be.a('function');
      expect(BaseModel.prototype.getDebugName.length).to.equal(0);
    });
  });
  describe('getChildren', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getChildren).to.be.a('function');
      expect(BaseModel.prototype.getChildren.length).to.equal(0);
    });
  });
  describe('getFunctions', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getFunctions).to.be.a('function');
      expect(BaseModel.prototype.getFunctions.length).to.equal(2);
    });
  });
  describe('getPropertiesArray', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getPropertiesArray).to.be.a('function');
      expect(BaseModel.prototype.getPropertiesArray.length).to.equal(0);
    });
  });
  /* develblock:end */
});