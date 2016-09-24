'use strict';

var BackboneAdaptor = require('../../../adaptors/backbone');
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
    it('should map certain functions to the model', function() {
      var template = {};
      var fnsToCheck = ['get', 'set', 'trigger'];
      var model = {};
      var i, fn;
      for (i = 0; i < fnsToCheck.length; i++) {
        fn = fnsToCheck[i];
        model[fn] = jasmine.createSpy('model.' + fn);
      }
      var ViewConstructor = function() {};

      var obj = new ComponentWidget(ViewConstructor, model, template);
      var params = {};
      for (i = 0; i < fnsToCheck.length; i++) {
        fn = fnsToCheck[i];
        expect(obj[fn]).to.be.a.function;
        expect(obj[fn]).not.to.equal(model[fn]);
        obj[fn](params);
        jasmineExpect(model[fn]).toHaveBeenCalledWith(params);
      }
    });
    it('should allow collection to be passed', function() {
      var collection = {};
      var obj = new ComponentWidget({}, {}, {}, {collection: collection});
      expect(obj.collection).to.equal(collection);
    });
  });
  describe('model.destroy', function() {
    describe('should pass up the model\'s destroy event', function() {
      it('for nothing', function() {
        var modelDestroy = jasmine.createSpy('model.destroy');
        var model = {
          destroy: modelDestroy
        };

        var obj = new ComponentWidget({}, model, {});
        expect(obj.model.destroy).not.to.equal(modelDestroy);
        var opts = {};
        obj.model.destroy(opts);
        jasmineExpect(modelDestroy).toHaveBeenCalledWith(opts);
      });
      it('for collections', function() {
        var modelDestroy = jasmine.createSpy('model.destroy');
        var model = {
          destroy: modelDestroy
        };
        var collection = {
          remove: jasmine.createSpy('collection.remove')
        };

        var obj = new ComponentWidget({}, model, {}, {
          collection: collection
        });
        expect(obj.model.destroy).not.to.equal(modelDestroy);
        var opts = {};
        obj.model.destroy(opts);
        jasmineExpect(collection.remove).toHaveBeenCalledWith(obj);
        jasmineExpect(modelDestroy).toHaveBeenCalledWith(opts);
      });
      it('for models', function() {
        var modelDestroy = jasmine.createSpy('model.destroy');
        var model = {
          destroy: modelDestroy
        };
        var parent = {
          unset: jasmine.createSpy('parent.unset')
        };

        var obj = new ComponentWidget({}, model, {});
        obj.parent = parent;
        obj.parentProp = 'foo';
        expect(obj.model.destroy).not.to.equal(modelDestroy);
        var opts = {};
        obj.model.destroy(opts);
        jasmineExpect(parent.unset).toHaveBeenCalledWith(obj.parentProp);
        jasmineExpect(modelDestroy).toHaveBeenCalledWith(opts);
      });
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
    it('should construct the view', function() {
      var template = {};
      var model = {};

      var view = {
        el: {}
      };
      var ViewConstructor = jasmine.createSpy('ViewConstructor').and.callFake(function(options) {
        view.options = options;
        return view;
      });
      var obj = new ComponentWidget(ViewConstructor, model, template);

      var elem = obj.init();
      expect(elem).to.equal(view.el);
      expect(view.options).to.include.keys(['template', 'model', 'dynamicInitialize']);
      expect(view.options.template).to.equal(template);
      expect(view.options.model).to.equal(model);
      expect(view.options.dynamicInitialize).to.equal(true);
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
  describe('errors', function() {
    it('should warn when invoking its .on() method', function() {
      const errors = require('../../../src/utils/errors');
      const Model = require('../../../adaptors/backbone/base_model');
      spyOn(errors, 'componentFunctionMayNotBeCalledDirectly');
      var ViewConstructor = function() {};
      var model = new Model({});
      var component = new ComponentWidget(ViewConstructor, model);
      component.on('all', function() {});
      jasmineExpect(errors.componentFunctionMayNotBeCalledDirectly).toHaveBeenCalled();
    });
    it('should not warn when its .on() method is invoked by a Collection', function() {
      const errors = require('../../../src/utils/errors');
      const Model = require('../../../adaptors/backbone/base_model');
      const Collection = require('../../../adaptors/backbone/base_collection');
      spyOn(errors, 'componentFunctionMayNotBeCalledDirectly');
      var ViewConstructor = function() {};
      var model = new Model({});
      var component = new ComponentWidget(ViewConstructor, model);
      var collection = new Collection([]);
      collection.add(component);
      collection.remove(component);
      jasmineExpect(errors.componentFunctionMayNotBeCalledDirectly).not.toHaveBeenCalled();
    });
  });
});
