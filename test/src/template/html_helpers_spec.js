'use strict';

var htmlHelpers = require('../../../src/template/html_helpers');

/**
 * Helper function to create a similar structure built during rendering
 * @param  {string} tagName  DOM tag
 * @param  {Array?} children Array of child tags
 * @return {Object}
 */
function tag(tagName, children) {
  children = children || [];
  var childTags = {};
  for (var i = 0; i < children.length; i++) {
    if (children[i].tagName) {
      childTags[children[i].tagName] = true;
    }
  }
  return {
    tagName: tagName,
    children: children,
    childTags: childTags
  };
}

describe('html_helpers.js public API', function() {
  describe('isValidChild', function() {
    it('should be a function', function() {
      expect(htmlHelpers.validation.isValidChild).to.be.a('function');
    });
    it('should check for a valid child', function() {
      expect(htmlHelpers.validation.isValidChild(tag('li'), 'li', true)).to.be.a('string');
    });
    it('should check for an invalid child', function() {
      expect(htmlHelpers.validation.isValidChild(tag('li'), 'ul', true)).to.equal(true);
    });
    it('should check for implicit tags created by browser in non-strict mode', function() {
      expect(htmlHelpers.validation.isValidChild(tag('tr'), 'table')).to.equal(true);
    });
    it('should return the opposite of impliedCloseTag', function() {
      var isValidChild = htmlHelpers.validation.isValidChild(tag('li'), 'ul');
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
  describe('specific strict validation rules', function() {
    describe('caption', function() {
      it('must be in a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('div'), 'caption', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('span'), 'caption', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('p'), 'caption', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('table'), 'caption', 'strict')).to.equal(true);
      });
      it('should be allowed as the first child element of a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('table', []), 'caption', 'strict')).to.equal(true);
        expect(htmlHelpers.validation.isValidChild(tag('table', ['  ']), 'caption', 'strict')).to.equal(true);
      });
      it('should not be allowed as a later child of a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('table', [tag('thead')]), 'caption', 'strict')).to.be.a('string');
      });
    });
    describe('colgroup', function() {
      it('must be in a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('div'), 'colgroup', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('span'), 'colgroup', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('p'), 'colgroup', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('table'), 'colgroup', 'strict')).to.equal(true);
      });
      it('should be allowed as the first child element of a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('table', []), 'colgroup', 'strict')).to.equal(true);
        expect(htmlHelpers.validation.isValidChild(tag('table', ['  ']), 'colgroup', 'strict')).to.equal(true);
      });
      it('should not be allowed as a later child of a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('table', [tag('thead')]), 'colgroup', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('table', [tag('tbody')]), 'colgroup', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('table', [tag('tfoot')]), 'colgroup', 'strict')).to.be.a('string');
      });
    });
    describe('thead', function() {
      it('must be in a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('div'), 'thead', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('span'), 'thead', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('p'), 'thead', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('table'), 'thead', 'strict')).to.equal(true);
      });
      it('should be allowed as the first child of a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('table', []), 'thead', 'strict')).to.equal(true);
      });
      it('should not be allowed as a later child of a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('table', [tag('thead')]), 'thead', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('table', [tag('tbody')]), 'thead', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('table', [tag('tfoot')]), 'thead', 'strict')).to.be.a('string');
      });
    });
    describe('tfoot', function() {
      it('must be in a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('div'), 'tfoot', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('span'), 'tfoot', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('p'), 'tfoot', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('table'), 'tfoot', 'strict')).to.equal(true);
      });
      it('may not appear multiple times in a table', function() {
        expect(htmlHelpers.validation.isValidChild(tag('table', [tag('tfoot')]), 'tfoot', 'strict')).to.be.a('string');
      });
    });
    describe('legend', function() {
      it('must be in a fieldset', function() {
        expect(htmlHelpers.validation.isValidChild(tag('div'), 'legend', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('span'), 'legend', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('p'), 'legend', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('table'), 'legend', 'strict')).to.be.a('string');
        expect(htmlHelpers.validation.isValidChild(tag('fieldset'), 'legend', 'strict')).to.equal(true);
      });
      it('should be allowed as the first child of a fieldset', function() {
        expect(htmlHelpers.validation.isValidChild(tag('fieldset', []), 'legend', 'strict')).to.equal(true);
      });
      it('should not be allowed as a later child of a fieldset', function() {
        expect(htmlHelpers.validation.isValidChild(tag('fieldset', [tag('input')]), 'legend', 'strict')).to.be.a('string');
      });
    });
  });
});
