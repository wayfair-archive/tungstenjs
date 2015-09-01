'use strict';

var BackboneAdaptor = require('../../../adaptors/backbone');
var BackboneViewWidget = BackboneAdaptor.ViewWidget;

describe('backbone_view_widget public api', function() {
  describe('type', function() {
    it('should be declared', function() {
      expect(BackboneViewWidget.prototype.type).to.equal('Widget');
    });
  });
  describe('init', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget.prototype.init).to.be.a('function');
      expect(BackboneViewWidget.prototype.init.length).to.equal(0);
    });
  });
  describe('update', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget.prototype.update).to.be.a('function');
      expect(BackboneViewWidget.prototype.update.length).to.equal(2);
    });
  });
  describe('destroy', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget.prototype.destroy).to.be.a('function');
      expect(BackboneViewWidget.prototype.destroy.length).to.equal(0);
    });
  });
  describe('attach', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget.prototype.attach).to.be.a('function');
      expect(BackboneViewWidget.prototype.attach.length).to.equal(1);
    });
  });
  /* develblock:start */
  describe('templateToString', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget.prototype.templateToString).to.be.a('function');
      expect(BackboneViewWidget.prototype.templateToString.length).to.equal(0);
    });
  });
  /* develblock:end */
});
