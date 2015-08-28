/* global describe, it, require */
'use strict';

var virtualDomImplementation = require('../../../src/vdom/virtual_dom_implementation');

describe('virtual_dom_implementation public API', function() {
  var node, text, widget, hook1, hook2, hook3;
  beforeEach(function() {
    // VNodes are an object created with the VNode constructor
    node = new virtualDomImplementation.VNode('div', {}, []);
    // VTexts are an object created with the VText constructor
    text = new virtualDomImplementation.VText('text');
    widget = {type: 'Widget'};
    // Hooks are objects with a prototype property named hook and/or unhook
    hook1 = Object.create({hook: function() {}});
    hook2 = Object.create({unhook: function() {}});
    hook3 = Object.create({hook: function() {}, unhook: function() {}});
  });
  describe('VNode', function() {
    it('should be a function', function() {
      expect(virtualDomImplementation.VNode).to.be.a('function');
    });
  });
  describe('VText', function() {
    it('should be a function', function() {
      expect(virtualDomImplementation.VText).to.be.a('function');
    });
  });
  describe('isVNode', function() {
    it('should be a function', function() {
      expect(virtualDomImplementation.isVNode).to.be.a('function');
    });
    it('should detect VNodes', function() {
      expect(virtualDomImplementation.isVNode(node)).to.be.true;
      expect(virtualDomImplementation.isVNode(text)).to.be.false;
      expect(virtualDomImplementation.isVNode(widget)).to.be.false;
      expect(virtualDomImplementation.isVNode(hook1)).to.be.false;
      expect(virtualDomImplementation.isVNode(hook2)).to.be.false;
      expect(virtualDomImplementation.isVNode(hook3)).to.be.false;
    });
  });
  describe('isVText', function() {
    it('should be a function', function() {
      expect(virtualDomImplementation.isVText).to.be.a('function');
    });
    it('should detect VTexts', function() {
      expect(virtualDomImplementation.isVText(node)).to.be.false;
      expect(virtualDomImplementation.isVText(text)).to.be.true;
      expect(virtualDomImplementation.isVText(widget)).to.be.false;
      expect(virtualDomImplementation.isVText(hook1)).to.be.false;
      expect(virtualDomImplementation.isVText(hook2)).to.be.false;
      expect(virtualDomImplementation.isVText(hook3)).to.be.false;
    });
  });
  describe('isWidget', function() {
    it('should be a function', function() {
      expect(virtualDomImplementation.isWidget).to.be.a('function');
    });
    it('should detect Widgets', function() {
      expect(virtualDomImplementation.isWidget(node)).to.be.false;
      expect(virtualDomImplementation.isWidget(text)).to.be.false;
      expect(virtualDomImplementation.isWidget(widget)).to.be.true;
      expect(virtualDomImplementation.isWidget(hook1)).to.be.false;
      expect(virtualDomImplementation.isWidget(hook2)).to.be.false;
      expect(virtualDomImplementation.isWidget(hook3)).to.be.false;
    });
  });
  describe('isHook', function() {
    it('should be a function', function() {
      expect(virtualDomImplementation.isHook).to.be.a('function');
    });
    it('should detect Hooks', function() {
      expect(virtualDomImplementation.isHook(node)).to.be.false;
      expect(virtualDomImplementation.isHook(text)).to.be.false;
      expect(virtualDomImplementation.isHook(widget)).to.be.false;
      expect(virtualDomImplementation.isHook(hook1)).to.be.true;
      expect(virtualDomImplementation.isHook(hook2)).to.be.true;
      expect(virtualDomImplementation.isHook(hook3)).to.be.true;
    });
  });
});
