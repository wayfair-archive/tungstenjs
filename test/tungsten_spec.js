/**
 * tungsten_spec.js
 *
 * @author    Andrew Rota <anrota@wayfair.com>
 */
/* global describe, it, require */
'use strict';

// Include Chai assertion library
var expect = require('chai').expect;

// Module to test is tungsten.js
var tungsten = require('../src/tungsten.js');

// VNode required for instanceof checks
var VNode = require('virtual-dom/vnode/vnode');

// Start test suite
describe('tungsten.js public API', function() {
  describe('bindEvent', function() {
    it('should be a function', function() {
      expect(typeof tungsten.bindEvent).to.equal('function');
    });
  });
  describe('unbindEvent', function() {
    it('should be a function', function() {
      expect(typeof tungsten.unbindEvent).to.equal('function');
    });
  });
  describe('toDOM', function() {
    it('should be a function', function() {
      expect(typeof tungsten.toDOM).to.equal('function');
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
      expect(typeof tungsten.toString).to.equal('function');
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
      expect(typeof tungsten.createVNode).to.equal('function');
    });
    it('should return a vnode', function() {
      var props = {className: ' js-root', style: {}};
      var children = [];
      var vNode = tungsten.createVNode('div', props, children);
      expect(vNode.tagName).to.equal('DIV');
      expect(vNode.properties).to.deep.equal({className: ' js-root', style: {}});
      expect(vNode instanceof VNode).to.equal(true);
    });
  });
  describe('updateTree', function() {
    it('should be a function', function() {
      expect(typeof tungsten.updateTree).to.equal('function');
    });
  });
});
