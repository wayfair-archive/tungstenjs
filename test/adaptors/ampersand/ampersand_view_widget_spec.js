'use strict';

var AmpersandAdaptor = require('../../../adaptors/backbone');
var AmpersandViewWidget = AmpersandAdaptor.ViewWidget;

describe('backbone_view_widget public api', function () {
  describe('type', function () {
    it('should be declared', function () {
      expect(AmpersandViewWidget.prototype.type).to.equal('Widget');
    });
  });
  describe('init', function () {
    it('should be a function', function () {
      expect(AmpersandViewWidget.prototype.init).to.be.a('function');
      expect(AmpersandViewWidget.prototype.init.length).to.equal(0);
    });
  });
  describe('update', function () {
    it('should be a function', function () {
      expect(AmpersandViewWidget.prototype.update).to.be.a('function');
      expect(AmpersandViewWidget.prototype.update.length).to.equal(2);
    });
  });
  describe('destroy', function () {
    it('should be a function', function () {
      expect(AmpersandViewWidget.prototype.destroy).to.be.a('function');
      expect(AmpersandViewWidget.prototype.destroy.length).to.equal(0);
    });
  });
  describe('attach', function () {
    it('should be a function', function () {
      expect(AmpersandViewWidget.prototype.attach).to.be.a('function');
      expect(AmpersandViewWidget.prototype.attach.length).to.equal(1);
    });
  });
  /* develblock:start */
  describe('templateToString', function () {
    it('should be a function', function () {
      expect(AmpersandViewWidget.prototype.templateToString).to.be.a('function');
      expect(AmpersandViewWidget.prototype.templateToString.length).to.equal(0);
    });
  });
  /* develblock:end */
});