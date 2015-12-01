'use strict';

var BackboneAdaptor = require('../../../adaptors/backbone');
var logger = require('../../../src/utils/logger.js');
var ComponentWidget = BackboneAdaptor.ComponentWidget;
var _ = require('underscore');

describe('component_widget public api', function() {
  describe('constructor', function() {
    it('should be a function', function() {
      expect(ComponentWidget).to.be.a('function');
      expect(ComponentWidget).to.have.length(5);
    });
    it('should assign properties as passed in', function() {
      var template = {};
      var model = new BackboneAdaptor.Model();
      var options = {};
      var key = _.uniqueId('view');
      var ViewConstructor = function() {};
      var obj = new ComponentWidget(ViewConstructor, model, template, options, key);
      expect(obj.template).to.equal(template);
      expect(obj.model).to.equal(model);
      expect(obj.key).to.equal(key);
      expect(obj.ViewConstructor).to.equal(ViewConstructor);
    });
  });
  describe('type', function() {
    it('should be declared', function() {
      expect(ComponentWidget.prototype.type).to.equal('Widget');
    });
  });
  describe('init', function() {
    it('should be a function', function() {
      expect(ComponentWidget.prototype.init).to.be.a('function');
      expect(ComponentWidget.prototype.init).to.have.length(0);
    });
  });
  describe('nested_content', function() {
    it('should be a function', function() {
      expect(ComponentWidget.prototype.nested_content).to.be.a('function');
      expect(ComponentWidget.prototype.nested_content).to.have.length(0);
    });
  });
  describe('update', function() {
    it('should be a noop function', function() {
      expect(ComponentWidget.prototype.update).to.be.a('function');
      expect(ComponentWidget.prototype.update).to.equal(_.noop);
    });

  });
  describe('isComponent', function() {
    it('should be a function', function() {
      expect(ComponentWidget.isComponent).to.be.a('function');
      expect(ComponentWidget.isComponent).to.have.length(1);
    });
    it('should return true if object is component with model', function() {
      var template = {};
      var model = new BackboneAdaptor.Model();
      var options = {};
      var key = _.uniqueId('view');
      var ViewConstructor = function() {};
      var obj = new ComponentWidget(ViewConstructor, model, template, options, key);
      expect(ComponentWidget.isComponent(obj)).to.equal(true);
      obj = null;
    });
    it('should return false if object is not a component', function() {
      var obj = {};
      expect(ComponentWidget.isComponent(obj)).to.equal(false);
      obj = null;
    });
  });
  describe('destroy', function() {
    it('should be a function', function() {
      expect(ComponentWidget.prototype.destroy).to.be.a('function');
      expect(ComponentWidget.prototype.destroy).to.have.length(0);
    });
    it('should call view\'s destroy', function() {
      var view = {
        destroy: jasmine.createSpy('destroy')
      };
      ComponentWidget.prototype.destroy.call({
        view: view
      });
      jasmineExpect(view.destroy).toHaveBeenCalled();
    });
    it('should handle view.destroy not being set', function() {
      expect(function() {
        ComponentWidget.prototype.destroy.call({
          view: {}
        });
      }).not.to.throw();
      expect(function() {
        ComponentWidget.prototype.destroy.call({});
      }).not.to.throw();
    });
  });
  describe('attach', function() {
    it('should be a function', function() {
      expect(ComponentWidget.prototype.attach).to.be.a('function');
      expect(ComponentWidget.prototype.attach).to.have.length(1);
    });
    it('should construct a view for the given element', function() {
      var expectedView;
      var ViewConstructor = jasmine.createSpy('ViewConstructor').and.callFake(function (args) {
        expectedView = args;
        return args;
      });
      var ctx = {
        ViewConstructor: ViewConstructor
      };
      var elem = {};
      ComponentWidget.prototype.attach.call(ctx, elem);
      jasmineExpect(ViewConstructor).toHaveBeenCalled();
      expect(ctx.view).to.equal(expectedView);
    });
  });
});
