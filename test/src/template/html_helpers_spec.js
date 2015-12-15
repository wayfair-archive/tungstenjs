'use strict';

var htmlHelpers = require('../../../src/template/html_helpers');

describe('html_helpers.js public API', function() {
  describe('isValidChild', function() {
    it('should be a function', function() {
      expect(htmlHelpers.validation.isValidChild).to.be.a('function');
    });
    it('should check for a valid child', function() {
      expect(htmlHelpers.validation.isValidChild('li', 'li')).to.be.a('string');
    });
    it('should check for an invalid child', function() {
      expect(htmlHelpers.validation.isValidChild('li', 'ul')).to.equal(true);
    });
    it('should return the opposite of impliedCloseTag', function() {
      var isValidChild = htmlHelpers.validation.isValidChild('li', 'ul');
      var impliedCloseTag = htmlHelpers.validation.impliedCloseTag('li', 'ul');
      expect(isValidChild).to.equal(!impliedCloseTag);
    });
  });
  describe('impliedCloseTag', function() {
    it('should be a function', function() {
      expect(htmlHelpers.validation.impliedCloseTag).to.be.a('function');
    });
    it('should check correctly for valid omission of a close tag', function() {
      expect(htmlHelpers.validation.impliedCloseTag('li', 'li')).to.equal(true);
    });
    it('should check correctly for invalid omission of a close tag', function() {
      expect(htmlHelpers.validation.impliedCloseTag('li', 'ul')).to.equal(false);
    });
  });
});
