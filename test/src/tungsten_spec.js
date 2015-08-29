/**
 * tungsten_spec.js
 *
 * @author    Andrew Rota <anrota@wayfair.com>
 */
/* global describe, it, expect, require */
'use strict';

// Module to test is tungsten.js
var tungsten = require('../../src/tungsten');

// Start test suite
describe('tungsten.js public API', function() {
  describe('VERSION', function() {
    it('should be a numeric string', function() {
      expect(tungsten.VERSION).to.be.a('string');
      expect(tungsten.VERSION).to.match(/^\d+\.\d+\.\d+$/);
    });
  });
  describe('IS_DEV', function() {
    it('should be a boolean', function() {
      expect(tungsten.IS_DEV).to.be.a('boolean');
    });
  });
  describe('addEventPlugin', function() {
    it('should be a function', function() {
      expect(tungsten.addEventPlugin).to.be.a('function');
    });
  });
  describe('bindEvent', function() {
    it('should be a function', function() {
      expect(tungsten.bindEvent).to.be.a('function');
    });
  });
  describe('unbindEvent', function() {
    it('should be a function', function() {
      expect(tungsten.unbindEvent).to.be.a('function');
    });
  });

  describe('parseString', function() {
    it('should be a function', function() {
      expect(tungsten.parseString).to.be.a('function');
    });
    // @TODO test accuracy of returned VDOM
  });
  describe('parseDOM', function() {
    it('should be a function', function() {
      expect(tungsten.parseDOM).to.be.a('function');
    });
    // @TODO test accuracy of returned VDOM
  });

  describe('toDOM', function() {
    it('should be a function', function() {
      expect(tungsten.toDOM).to.be.a('function');
    });
    it('should return document fragment', function() {
      var props = {className: ' js-dom', style: {}};
      var children = [];
      var vNode = tungsten.createVNode('div', props, children);
      var dom = tungsten.toDOM(vNode);
      expect(dom instanceof window.Node).to.equal(true);
      // Should be document fragment (nodeType === 11)
      expect(dom.nodeType).to.equal(11);
    });
  });
  describe('toString', function() {
    it('should be a function', function() {
      expect(tungsten.toString).to.be.a('function');
    });
    it('should return a string', function() {
      var props = {className: ' js-dom', style: {}};
      var children = [];
      var vNode = tungsten.createVNode('div', props, children);
      expect(typeof tungsten.toString(vNode)).to.equal('string');
    });
    it('should return a DOM string', function() {
      var props = {className: ' js-dom', style: {}};
      var children = [];
      var vNode = tungsten.createVNode('div', props, children);
      expect(tungsten.toString(vNode)).to.equal('<div class=" js-dom" style=""></div>');
    });
    it('should return a DOM string with styles', function() {
      var props = {className: ' js-dom', style: {color: 'red'}};
      var children = [];
      var vNode = tungsten.createVNode('div', props, children);
      expect(tungsten.toString(vNode)).to.equal('<div class=" js-dom" style="color: red;"></div>');
    });
  });
  describe('createVNode', function() {
    it('should be a function', function() {
      expect(tungsten.createVNode).to.be.a('function');
    });
    it('should return a vnode', function() {
      var props = {className: ' js-root', style: {}};
      var children = [];
      var vNode = tungsten.createVNode('div', props, children);
      expect(vNode.tagName).to.equal('DIV');
      expect(vNode.properties).to.deep.equal({className: ' js-root', style: {}});
    });
  });
  describe('updateTree', function() {
    it('should be a function', function() {
      expect(tungsten.updateTree).to.be.a('function');
    });
  });
});
