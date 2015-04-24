/**
 * tungsten_spec.js
 *
 * @author    Andrew Rota <anrota@wayfair.com>
 */
(function() {
  /* global describe, it, expect, require */
  'use strict';

  // Environment pulls in window and document references from jsdom
  require('./environment.js');

  // Module to test is tungsten.js
  var tungsten = require('../src/tungsten.js');

  // VNode required for instanceof checks
  var VNode = require('virtual-dom/vnode/vnode');

  // Start test suite
  describe('tungsten.js public API', function() {
    describe('parseDOM', function() {
      it('should be a function', function() {
        expect(typeof tungsten.parseDOM).toEqual('function');
      });
      it('should return vnode', function() {
        var el = window.document.createElement('div');
        el.className = el.className.concat(' js-root');
        el.innerHTML = '<div class="js-bar"></div>';
        var rootVEl = tungsten.parseDOM(el, true);
        expect(rootVEl.tagName).toEqual('DIV');
        expect(rootVEl.properties).toEqual({className: ' js-root', style: {}});
        expect(rootVEl.count).toEqual(1);
        expect(rootVEl instanceof VNode).toBe(true);
        el = null;
      });
    });
    describe('bindEvent', function() {
      it('should be a function', function() {
        expect(typeof tungsten.bindEvent).toEqual('function');
      });
    });
    describe('unbindEvents', function() {
      it('should be a function', function() {
        expect(typeof tungsten.unbindEvents).toEqual('function');
      });
    });
    describe('toDOM', function() {
      it('should be a function', function() {
        expect(typeof tungsten.toDOM).toEqual('function');
      });
      it('should return document fragment', function() {
        var props = {className: ' js-dom', style: {}};
        var children = [];
        var vNode = tungsten.createVNode('div', props, children);
        var dom = tungsten.toDOM(vNode);
        expect(dom instanceof window.Node).toBe(true);
        // Should be document fragment (nodeType === 11)
        expect(dom.nodeType).toEqual(11);
      });
    });
    describe('toString', function() {
      it('should be a function', function() {
        expect(typeof tungsten.toString).toEqual('function');
      });
      it('should return a string', function() {
        var props = {className: ' js-dom', style: {}};
        var children = [];
        var vNode = tungsten.createVNode('div', props, children);
        expect(typeof tungsten.toString(vNode)).toEqual('string');
      });
      it('should return a DOM string', function() {
        var props = {className: ' js-dom', style: {}};
        var children = [];
        var vNode = tungsten.createVNode('div', props, children);
        expect(tungsten.toString(vNode)).toEqual('<div class=" js-dom" style=""></div>');
      });
      it('should return a DOM string with styles', function() {
        var props = {className: ' js-dom', style: {color: 'red'}};
        var children = [];
        var vNode = tungsten.createVNode('div', props, children);
        expect(tungsten.toString(vNode)).toEqual('<div class=" js-dom" style="color: red;"></div>');
      });
    });
    describe('createVNode', function() {
      it('should be a function', function() {
        expect(typeof tungsten.createVNode).toEqual('function');
      });
      it('should return a vnode', function() {
        var props = {className: ' js-root', style: {}};
        var children = [];
        var vNode = tungsten.createVNode('div', props, children);
        expect(vNode.tagName).toEqual('DIV');
        expect(vNode.properties).toEqual({className: ' js-root', style: {}});
        expect(vNode instanceof VNode).toBe(true);
      });
    });
    describe('updateTree', function() {
      it('should be a function', function() {
        expect(typeof tungsten.updateTree).toEqual('function');
      });
    });
  });

}());