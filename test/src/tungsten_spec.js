/**
 * tungsten_spec.js
 *
 * @author    Andrew Rota <anrota@wayfair.com>
 */
'use strict';

// Module to test is tungsten.js
var tungsten = require('../../src/tungsten');
var globalEvents = require('../../src/event/global_events.js');
var virtualDomImplementation = require('../../src/vdom/virtual_dom_implementation');
var vdom = virtualDomImplementation.vdom;

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
      expect(tungsten.addEventPlugin).to.have.length(1);
    });
    it('should be globalEvents.registerEventHandler', function() {
      expect(tungsten.addEventPlugin).to.equal(globalEvents.registerEventHandler);
    });
  });
  describe('bindEvent', function() {
    it('should be a function', function() {
      expect(tungsten.bindEvent).to.be.a('function');
      expect(tungsten.bindEvent).to.have.length(5);
    });
    var elem, eventName, selector, method, options;
    beforeEach(function() {
      elem = document.createElement('div');
      eventName = 'foobar';
      selector = '';
      method = function() {};
      options = {};
    });
    afterEach(function() {
      elem = undefined;
      eventName = undefined;
      selector = undefined;
      method = undefined;
      options = undefined;
    });
    it('normalizes the selector', function() {
      spyOn(globalEvents, 'bindVirtualEvent');
      tungsten.bindEvent(elem, eventName, '', method, options);
      var args = globalEvents.bindVirtualEvent.calls.mostRecent().args;
      expect(args[2]).to.equal('self');

      tungsten.bindEvent(elem, eventName, '.js-test', method, options);
      args = globalEvents.bindVirtualEvent.calls.mostRecent().args;
      expect(args[2]).to.equal('js-test');
    });
    it('should valiate and bind the event', function() {
      spyOn(globalEvents, 'validateSelector');
      spyOn(globalEvents, 'bindVirtualEvent');

      tungsten.bindEvent(elem, eventName, selector, method, options);

      jasmineExpect(globalEvents.validateSelector).toHaveBeenCalledWith(selector);
      jasmineExpect(globalEvents.bindVirtualEvent).toHaveBeenCalledWith(elem, eventName, 'self', method, options);
    });
  });
  describe('unbindEvent', function() {
    it('should be a function', function() {
      expect(tungsten.unbindEvent).to.be.a('function');
      expect(tungsten.unbindEvent).to.have.length(1);
    });
    it('should be globalEvents.unbindVirtualEvent', function() {
      expect(tungsten.unbindEvent).to.equal(globalEvents.unbindVirtualEvent);
    });
  });

  describe('parseString', function() {
    it('should be a function', function() {
      expect(tungsten.parseString).to.be.a('function');
      expect(tungsten.parseString).to.have.length(1);
    });
    // @TODO test accuracy of returned VDOM
  });
  describe('parseDOM', function() {
    it('should be a function', function() {
      expect(tungsten.parseDOM).to.be.a('function');
      expect(tungsten.parseDOM).to.have.length(1);
    });
    // @TODO test accuracy of returned VDOM
  });

  describe('toDOM', function() {
    it('should be a function', function() {
      expect(tungsten.toDOM).to.be.a('function');
      expect(tungsten.toDOM).to.have.length(1);
    });
    it('should return document fragment', function() {
      var props = {
        className: ' js-dom',
        style: {}
      };
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
      expect(tungsten.toString).to.have.length(1);
    });
    it('should return a string', function() {
      var props = {
        className: ' js-dom',
        style: {}
      };
      var children = [];
      var vNode = tungsten.createVNode('div', props, children);
      expect(typeof tungsten.toString(vNode)).to.equal('string');
    });
    it('should return a DOM string', function() {
      var props = {
        className: ' js-dom',
        style: {}
      };
      var children = [];
      var vNode = tungsten.createVNode('div', props, children);
      expect(tungsten.toString(vNode)).to.equal('<div class=" js-dom"></div>');
    });
    it('should return a DOM string with styles', function() {
      var props = {
        className: ' js-dom',
        style: {
          color: 'red'
        }
      };
      var children = [];
      var vNode = tungsten.createVNode('div', props, children);
      expect(tungsten.toString(vNode)).to.equal('<div class=" js-dom" style="color: red;"></div>');
    });
  });
  describe('createVNode', function() {
    it('should be a function', function() {
      expect(tungsten.createVNode).to.be.a('function');
      expect(tungsten.createVNode).to.have.length(3);
    });
    it('should return a vnode', function() {
      var props = {
        className: ' js-root',
        style: {}
      };
      var children = [];
      var vNode = tungsten.createVNode('div', props, children);
      expect(vNode.tagName).to.equal('div');
      expect(vNode.properties).to.deep.equal({
        className: ' js-root',
        style: {}
      });
    });
  });
  describe('updateTree', function() {
    it('should be a function', function() {
      expect(tungsten.updateTree).to.be.a('function');
      expect(tungsten.updateTree).to.have.length(3);
    });
    it('should call through to vdom functions', function() {
      var container = {};
      var initialTree = {
        recycle: jasmine.createSpy('recycle tree')
      };
      var newTree = {};
      var patch = {};
      spyOn(vdom, 'diff').and.returnValue(patch);
      spyOn(vdom, 'patch');
      var result = tungsten.updateTree(container, initialTree, newTree);

      jasmineExpect(vdom.diff).toHaveBeenCalledWith(initialTree, newTree);
      jasmineExpect(vdom.patch).toHaveBeenCalledWith(container, patch);
      jasmineExpect(initialTree.recycle).toHaveBeenCalled();
      expect(result).to.equal(newTree);
    });
  });
});
