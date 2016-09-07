'use strict';

var BackboneAdaptor = require('../../../adaptors/backbone');
var BaseView = BackboneAdaptor.View;
var Backbone = BackboneAdaptor.Backbone;
var tungsten = require('../../../src/tungsten');
var _ = require('underscore');
var logger = require('../../../src/utils/logger');
var compiler = require('../../../precompile/tungsten_template/inline');

describe('base_view.js public api', function() {
  describe('extend', function() {
    it('should be a function', function() {
      expect(BaseView.extend).to.be.a('function');
    });
    it('should accept two arguments', function() {
      expect(BaseView.extend).to.have.length(2);
    });
    it('should be different than Backbone\'s', function() {
      expect(BaseView.extend).not.to.equal(Backbone.extend);
    });
    it('should validate the childView array', function() {
      var validate = require('../../../adaptors/shared/validate');
      spyOn(validate, 'childViews');
      var data = {
        childViews: {}
      };
      BaseView.extend(data);
      jasmineExpect(validate.childViews).toHaveBeenCalledWith(data.childViews);
    });
    if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
      it('should prevent initialize from being overwritten', function() {
        spyOn(logger, 'warn');
        spyOn(BaseView.prototype, 'initialize');
        spyOn(BaseView.prototype, 'render');
        spyOn(BaseView.prototype, 'delegateEvents');
        spyOn(BaseView.prototype, 'undelegateEvents');
        var initFn = jasmine.createSpy('initFn');
        var renderFn = jasmine.createSpy('renderFn');
        var delegateFn = jasmine.createSpy('delegateFn');
        var undelegateFn = jasmine.createSpy('undelegateFn');
        var testFn = function() {};
        var TestModel = BaseView.extend({
          initialize: initFn,
          render: renderFn,
          delegateEvents: delegateFn,
          undelegateEvents: undelegateFn,
          test: testFn
        });
        expect(TestModel.prototype.initialize).not.to.equal(initFn);
        expect(TestModel.prototype.test).to.equal(testFn);
        jasmineExpect(logger.warn).toHaveBeenCalled();
        expect(logger.warn.calls.count()).to.equal(4);
        expect(logger.warn.calls.argsFor(0)[0]).to.contain('View.initialize may not be overridden');
        expect(logger.warn.calls.argsFor(1)[0]).to.contain('View.render may not be overridden');
        expect(logger.warn.calls.argsFor(2)[0]).to.contain('View.delegateEvents may not be overridden');
        expect(logger.warn.calls.argsFor(3)[0]).to.contain('View.undelegateEvents may not be overridden');

        var args = {};
        TestModel.prototype.initialize(args);
        jasmineExpect(BaseView.prototype.initialize).toHaveBeenCalledWith(args);
        jasmineExpect(initFn).toHaveBeenCalledWith(args);

        TestModel.prototype.render(args);
        jasmineExpect(BaseView.prototype.render).toHaveBeenCalledWith(args);
        jasmineExpect(renderFn).toHaveBeenCalledWith(args);

        TestModel.prototype.delegateEvents(args);
        jasmineExpect(BaseView.prototype.delegateEvents).toHaveBeenCalledWith(args);
        jasmineExpect(delegateFn).toHaveBeenCalledWith(args);

        TestModel.prototype.undelegateEvents(args);
        jasmineExpect(BaseView.prototype.undelegateEvents).toHaveBeenCalledWith(args);
        jasmineExpect(undelegateFn).toHaveBeenCalledWith(args);
      });
      it('should error with debugName if available', function() {
        spyOn(logger, 'warn');
        var initFn = function() {};
        BaseView.extend({
          initialize: initFn
        }, {
          debugName: 'FOOBAR'
        });
        jasmineExpect(logger.warn).toHaveBeenCalled();
        expect(logger.warn.calls.argsFor(0)[0]).to.contain(' for view "FOOBAR"');
      });
    }
  });

  describe('tungstenView', function() {
    it('should be set', function() {
      expect(BaseView.tungstenView).to.be.true;
    });
  });
});

describe('base_view.js constructed api', function() {
  describe('tungstenViewInstance', function() {
    it('should be set', function() {
      expect(BaseView.prototype.tungstenViewInstance).to.be.true;
    });
  });
  describe('initializeRenderListener', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.initializeRenderListener).to.be.a('function');
      expect(BaseView.prototype.initializeRenderListener).to.have.length(1);
    });
    it('should bind to render for top level views', function(done) {
      var renderQueue = require('../../../adaptors/shared/render_queue');
      spyOn(renderQueue, 'queue').and.callFake(function(obj, fn) {
        fn();
      });
      spyOn(_, 'bind').and.callFake(function(fn) {
        return fn;
      });
      var ctx = {
        render: jasmine.createSpy('render'),
        listenTo: jasmine.createSpy('listenTo')
      };
      var dataItem = {
        tungstenModel: true
      };
      BaseView.prototype.initializeRenderListener.call(ctx, dataItem);
      jasmineExpect(_.bind).toHaveBeenCalledWith(ctx.render, ctx);
      jasmineExpect(ctx.listenTo).toHaveBeenCalled();
      var args = ctx.listenTo.calls.mostRecent().args;
      expect(args[0]).to.equal(dataItem);

      // Invoke listened to function
      args[2]();
      setTimeout(function() {
        jasmineExpect(renderQueue.queue).toHaveBeenCalledWith(ctx, ctx.render);
        jasmineExpect(ctx.render).toHaveBeenCalled();
        done();
      }, 100);
    });
    it('should bind to bubble for non-top level views with detached models', function(done) {
      var ctx = {
        parentView: {
          model: {
            trigger: jasmine.createSpy('parentModelTrigger')
          }
        },
        render: function() {},
        listenTo: jasmine.createSpy('listenTo')
      };
      var dataItem = {
        tungstenModel: true
      };
      BaseView.prototype.initializeRenderListener.call(ctx, dataItem);
      jasmineExpect(ctx.listenTo).toHaveBeenCalled();
      var args = ctx.listenTo.calls.mostRecent().args;
      expect(args[0]).to.equal(dataItem);

      // Invoke listened to function
      args[2]();
      setTimeout(function() {
        jasmineExpect(ctx.parentView.model.trigger).toHaveBeenCalledWith('render');
        done();
      }, 100);
    });
    it('should not bind if the model has a parent', function() {
      var ctx = {
        parentView: {},
        listenTo: jasmine.createSpy('listenTo')
      };
      var dataItem = {
        parentProp: 'model',
        tungstenModel: true
      };
      BaseView.prototype.initializeRenderListener.call(ctx, dataItem);
      jasmineExpect(ctx.listenTo).not.toHaveBeenCalled();
    });
    it('should not bind if the model is in a collection', function() {
      var ctx = {
        parentView: {},
        listenTo: jasmine.createSpy('listenTo')
      };
      var dataItem = {
        collection: [],
        tungstenModel: true
      };
      BaseView.prototype.initializeRenderListener.call(ctx, dataItem);
      jasmineExpect(ctx.listenTo).not.toHaveBeenCalled();
    });
  });
  describe('postInitialize', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.postInitialize).to.be.a('function');
      expect(BaseView.prototype.postInitialize).to.have.length(0);
    });
    it('should invoke in an expected order', function(done) {
      // Views will initialize top to bottom for each level
      // A parent view is not initialized until all child views are
      var templateStr = `<div class="js-child-1" data-order="6">
        <div class="js-child-2" data-order="1"></div>
        <div class="js-child-2" data-order="3">
          <div class="js-child-3" data-order="2"></div>
        </div>
        <div class="js-child-2" data-order="5">
          <div class="js-child-3" data-order="4"></div>
        </div>
      </div>`;

      var template = compiler(templateStr, {});
      var initialized = 0;

      var elem = document.createElement('div');

      function checkChild() {
        initialized = initialized + 1;
        var orderStr = this.el.getAttribute('data-order');
        expect(orderStr).to.be.a('string');
        var order = parseInt(orderStr, 10);
        expect(order).to.equal(initialized);
      }

      var FourthView = BaseView.extend({
        postInitialize: checkChild
      });
      var ThirdView = BaseView.extend({
        postInitialize: checkChild,
        childViews: {
          'js-child-3': FourthView
        }
      });

      var SecondView = BaseView.extend({
        postInitialize: checkChild,
        childViews: {
          'js-child-2': ThirdView
        }
      });

      var MainView = BaseView.extend({
        postInitialize: function() {
          expect(initialized).to.equal(6);
          done();
        },
        childViews: {
          'js-child-1': SecondView
        }
      });

      new MainView({
        template: template,
        el: elem,
        dynamicInitialize: true
      });
    });
  });
  describe('validateVdom', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.validateVdom).to.be.a('function');
      expect(BaseView.prototype.validateVdom).to.have.length(0);
    });
  });
  describe('serialize', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.serialize).to.be.a('function');
      expect(BaseView.prototype.serialize).to.have.length(0);
    });
  });
  describe('delegateEvents', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.delegateEvents).to.be.a('function');
      expect(BaseView.prototype.delegateEvents).to.have.length(1);
    });
  });
  describe('undelegateEvents', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.undelegateEvents).to.be.a('function');
      expect(BaseView.prototype.undelegateEvents).to.have.length(0);
    });
  });
  describe('render', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.render).to.be.a('function');
      expect(BaseView.prototype.render).to.have.length(0);
    });
    it('should do nothing without a template', function() {
      var view = {};
      expect(BaseView.prototype.render.call(view)).to.equal(undefined);
    });
    it('should invoke rendering', function() {
      var newVdom = {};
      var serialized = {};
      var vtree = {
        recycle: jasmine.createSpy('recycle')
      };
      var view = {
        compiledTemplate: {
          toVdom: jasmine.createSpy('toVdom').and.returnValue(newVdom)
        },
        vtree: vtree,
        serialize: jasmine.createSpy('serialize').and.returnValue(serialized),
        trigger: jasmine.createSpy('trigger'),
        postRender: jasmine.createSpy('postRender')
      };
      expect(BaseView.prototype.render.call(view)).to.equal(view);
      jasmineExpect(view.serialize).toHaveBeenCalled();
      jasmineExpect(view.compiledTemplate.toVdom).toHaveBeenCalledWith(serialized);
      jasmineExpect(vtree.recycle).toHaveBeenCalled();
      jasmineExpect(view.trigger).toHaveBeenCalledWith('rendered');
      jasmineExpect(view.postRender).toHaveBeenCalled();
      spyOn(tungsten, 'updateTree');
    });
    it('should use passed context over serialize if passed', function() {
      var newVdom = {};
      var serialized = {};
      var context = {};
      var vtree = {
        recycle: jasmine.createSpy('recycle')
      };
      var view = {
        compiledTemplate: {
          toVdom: jasmine.createSpy('toVdom').and.returnValue(newVdom)
        },
        vtree: vtree,
        context: context,
        serialize: jasmine.createSpy('serialize').and.returnValue(serialized),
        trigger: jasmine.createSpy('trigger'),
        postRender: jasmine.createSpy('postRender')
      };
      expect(BaseView.prototype.render.call(view)).to.equal(view);
      jasmineExpect(view.serialize).not.toHaveBeenCalled();
      jasmineExpect(view.compiledTemplate.toVdom).toHaveBeenCalledWith(context);
      jasmineExpect(vtree.recycle).toHaveBeenCalled();
      jasmineExpect(view.trigger).toHaveBeenCalledWith('rendered');
      jasmineExpect(view.postRender).toHaveBeenCalled();
      // Context should be cleared for next render
      expect(view.context).to.be.null;
      spyOn(tungsten, 'updateTree');
    });
    it('should create an initial vtree if one is not passed', function() {
      var newVdom = {};
      var serialized = {};
      var vtree = {
        recycle: jasmine.createSpy('recycle')
      };
      var view = {
        compiledTemplate: {
          toVdom: jasmine.createSpy('toVdom').and.callFake(function(data, firstRender) {
            if (firstRender) {
              return vtree;
            } else {
              return newVdom;
            }
          })
        },
        serialize: jasmine.createSpy('serialize').and.returnValue(serialized),
        trigger: jasmine.createSpy('trigger'),
        postRender: jasmine.createSpy('postRender')
      };
      expect(BaseView.prototype.render.call(view)).to.equal(view);
      jasmineExpect(view.serialize).toHaveBeenCalled();
      jasmineExpect(view.compiledTemplate.toVdom).toHaveBeenCalledWith(serialized, true);
      jasmineExpect(view.compiledTemplate.toVdom).toHaveBeenCalledWith(serialized);
      jasmineExpect(vtree.recycle).toHaveBeenCalled();
      jasmineExpect(view.trigger).toHaveBeenCalledWith('rendered');
      jasmineExpect(view.postRender).toHaveBeenCalled();
      spyOn(tungsten, 'updateTree');
    });
  });
  describe('postRender', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.postRender).to.be.a('function');
      expect(BaseView.prototype.postRender).to.have.length(0);
    });
  });
  describe('update', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.update).to.be.a('function');
      expect(BaseView.prototype.update).to.have.length(1);
    });
    it('should always call render', function() {
      var view = {
        render: jasmine.createSpy('render'),
        model: {}
      };
      BaseView.prototype.update.call(view, view.model);
      jasmineExpect(view.render).toHaveBeenCalled();
    });
    it('should change listeners if model is different', function() {
      var oldModel = {};
      var newModel = {};
      var view = {
        initializeRenderListener: jasmine.createSpy('initializeRenderListener'),
        stopListening: jasmine.createSpy('stopListening'),
        render: jasmine.createSpy('render'),
        model: oldModel
      };
      BaseView.prototype.update.call(view, newModel);
      jasmineExpect(view.stopListening).toHaveBeenCalledWith(oldModel);
      jasmineExpect(view.initializeRenderListener).toHaveBeenCalledWith(newModel);
      jasmineExpect(view.render).toHaveBeenCalled();
      expect(view.model).to.equal(newModel);
      expect(view.model).not.to.equal(oldModel);
    });
  });
  describe('getChildViews', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.getChildViews).to.be.a('function');
      expect(BaseView.prototype.getChildViews).to.have.length(0);
    });
  });
  describe('attachChildViews', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.attachChildViews).to.be.a('function');
      expect(BaseView.prototype.attachChildViews).to.have.length(1);
    });
    it('should invoke postInitialize in the expected order', function(done) {
      // Views will initialize top to bottom for each level
      // A parent view is not initialized until all child views are
      var templateStr = `<div class="js-child-1" data-order="6">
        <div class="js-child-2" data-order="1"></div>
        <div class="js-child-2" data-order="3">
          <div class="js-child-3" data-order="2"></div>
        </div>
        <div class="js-child-2" data-order="5">
          <div class="js-child-3" data-order="4"></div>
        </div>
      </div>`;

      var template = compiler(templateStr, {});
      var initialized = 0;

      var elem = document.createElement('div');
      elem.innerHTML = templateStr;

      function checkChild() {
        initialized = initialized + 1;
        var orderStr = this.el.getAttribute('data-order');
        expect(orderStr).to.be.a('string');
        var order = parseInt(orderStr, 10);
        expect(order).to.equal(initialized);
      }

      var FourthView = BaseView.extend({
        postInitialize: checkChild
      });
      var ThirdView = BaseView.extend({
        postInitialize: checkChild,
        childViews: {
          'js-child-3': FourthView
        }
      });

      var SecondView = BaseView.extend({
        postInitialize: checkChild,
        childViews: {
          'js-child-2': ThirdView
        }
      });

      var MainView = BaseView.extend({
        postInitialize: function() {
          expect(initialized).to.equal(6);
          done();
        },
        childViews: {
          'js-child-1': SecondView
        }
      });

      new MainView({
        template: template,
        el: elem
      });
    });
  });
  describe('destroy', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.destroy).to.be.a('function');
      expect(BaseView.prototype.destroy).to.have.length(0);
    });
    it('should break down the view', function() {
      var childView = {
        destroy: jasmine.createSpy('childDestroy')
      };
      var view = {
        debouncer: {},
        stopListening: jasmine.createSpy('stopListening'),
        undelegateEvents: jasmine.createSpy('undelegateEvents'),
        getChildViews: jasmine.createSpy('getChildViews').and.returnValue([childView])
      };
      spyOn(global, 'clearTimeout');
      BaseView.prototype.destroy.call(view);
      jasmineExpect(global.clearTimeout).toHaveBeenCalledWith(view.debouncer);
      jasmineExpect(view.stopListening).toHaveBeenCalled();
      jasmineExpect(view.undelegateEvents).toHaveBeenCalled();
      jasmineExpect(view.getChildViews).toHaveBeenCalled();
      jasmineExpect(childView.destroy).toHaveBeenCalled();
    });
  });

  if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {

  // Debug methods:
    describe('initDebug', function() {
      it('should be a function', function() {
        expect(BaseView.prototype.initDebug).to.be.a('function');
        expect(BaseView.prototype.initDebug).to.have.length(0);
      });
    });
    describe('getFunctions', function() {
      it('should be a function', function() {
        expect(BaseView.prototype.getFunctions).to.be.a('function');
        expect(BaseView.prototype.getFunctions).to.have.length(2);
      });
    });
    describe('_setElement', function() {
      it('should be a function', function() {
        expect(BaseView.prototype._setElement).to.be.a('function');
        expect(BaseView.prototype._setElement).to.have.length(1);
      });
      var dataset = require('data-set');
      it('should update the element and set data', function() {
        spyOn(Backbone.View.prototype, '_setElement').and.callThrough();
        var el = document.createElement('div');
        var view = {};
        BaseView.prototype._setElement.call(view, el);
        jasmineExpect(Backbone.View.prototype._setElement).toHaveBeenCalledWith(el);
        expect(view.el).to.equal(el);
        expect(dataset(el).view).to.equal(view);
      });
      it('should unset from an existing element', function() {
        var el = document.createElement('div');
        var oldEl = document.createElement('div');
        var view = {
          el: oldEl
        };
        dataset(view.el).view = view;
        BaseView.prototype._setElement.call(view, el);
        expect(view.el).not.to.equal(oldEl);
        expect(dataset(oldEl).view).to.be.null;
      });
    });
    describe('getState', function() {
      it('should be a function', function() {
        expect(BaseView.prototype.getState).to.be.a('function');
        expect(BaseView.prototype.getState).to.have.length(0);
      });
      it('should return the view\'s data object', function() {
        var dataObj = {};
        var view = {
          serialize: function() {
            return dataObj;
          }
        };
        expect(BaseView.prototype.getState.call(view)).to.equal(dataObj);
      });
      it('should serialize the data object', function() {
        var serializedData = {};
        var dataObj = {
          doSerialize: jasmine.createSpy('doSerialize').and.returnValue(serializedData)
        };
        var view = {
          serialize: function() {
            return dataObj;
          }
        };
        expect(BaseView.prototype.getState.call(view)).to.equal(serializedData);
        jasmineExpect(dataObj.doSerialize).toHaveBeenCalled();
      });
    });
    describe('setState', function() {
      it('should be a function', function() {
        expect(BaseView.prototype.setState).to.be.a('function');
        expect(BaseView.prototype.setState).to.have.length(1);
      });
      it('should return the data it was given', function() {
        var dataObj = {};
        var view = {
          serialize: jasmine.createSpy('serialize').and.returnValue(dataObj)
        };
        var data = {};
        expect(BaseView.prototype.setState.call(view, data)).to.equal(data);
      });
      it('should call reset where available', function() {
        var dataObj = {
          reset: jasmine.createSpy('reset')
        };
        var view = {
          serialize: jasmine.createSpy('serialize').and.returnValue(dataObj)
        };
        var data = {};
        expect(BaseView.prototype.setState.call(view, data)).to.equal(data);
        jasmineExpect(dataObj.reset).toHaveBeenCalledWith(data);
      });
      it('should call set where available', function() {
        var dataObj = {
          set: jasmine.createSpy('set')
        };
        var view = {
          serialize: jasmine.createSpy('serialize').and.returnValue(dataObj)
        };
        var data = {};
        expect(BaseView.prototype.setState.call(view, data)).to.equal(data);
        jasmineExpect(dataObj.set).toHaveBeenCalledWith(data, {reset: true});
      });
      it('should prefer reset', function() {
        var dataObj = {
          reset: jasmine.createSpy('reset'),
          set: jasmine.createSpy('set')
        };
        var view = {
          serialize: jasmine.createSpy('serialize').and.returnValue(dataObj)
        };
        var data = {};
        expect(BaseView.prototype.setState.call(view, data)).to.equal(data);
        jasmineExpect(dataObj.reset).toHaveBeenCalledWith(data);
        jasmineExpect(dataObj.set).not.toHaveBeenCalled();
      });
    });
    describe('getEvents', function() {
      it('should be a function', function() {
        expect(BaseView.prototype.getEvents).to.be.a('function');
        expect(BaseView.prototype.getEvents).to.have.length(0);
      });
      it('should return a map of events', function() {
        var view = {
          events: {
            'click': 'click',
            'click .js-sub': 'subClick'
          },
          click: function() {},
          subClick: function() {}
        };
        var output = BaseView.prototype.getEvents.call(view);
        expect(output).to.have.length(2);

        var expectedOutput = [{
          selector: 'click',
          name: 'click',
          fn: view.click
        }, {
          selector: 'click .js-sub',
          name: 'subClick',
          fn: view.subClick
        }];

        output = _.sortBy(output, 'selector');
        expectedOutput = _.sortBy(expectedOutput, 'selector');

        expect(output).to.eql(expectedOutput);
      });
    });
    describe('getVdomTemplate', function() {
      it('should be a function', function() {
        expect(BaseView.prototype.getVdomTemplate).to.be.a('function');
        expect(BaseView.prototype.getVdomTemplate).to.have.length(0);
      });
      var vtreeString = 'FOO';
      beforeEach(function() {
        spyOn(tungsten.debug, 'vtreeToString').and.returnValue(vtreeString);
      });
      it('should pass the vtree to vtreeToString', function() {
        var view = {
          parentView: true,
          vtree: {}
        };
        var output = BaseView.prototype.getVdomTemplate.call(view);
        jasmineExpect(tungsten.debug.vtreeToString).toHaveBeenCalledWith(view.vtree, true);
        expect(output).to.equal(vtreeString);
      });
      it('should ignore the wrapper element for top level views', function() {
        var view = {
          vtree: {
            children: []
          }
        };
        var output = BaseView.prototype.getVdomTemplate.call(view);
        jasmineExpect(tungsten.debug.vtreeToString).toHaveBeenCalledWith(view.vtree.children, true);
        expect(output).to.equal(vtreeString);
      });
    });
    describe('getTemplateDiff', function() {
      it('should be a function', function() {
        expect(BaseView.prototype.getTemplateDiff).to.be.a('function');
        expect(BaseView.prototype.getTemplateDiff).to.have.length(0);
      });
    });
    describe('getChildren', function() {
      it('should be a function', function() {
        expect(BaseView.prototype.getChildren).to.be.a('function');
        expect(BaseView.prototype.getChildren).to.have.length(0);
      });
      it('should pass through to getChildViews', function() {
        var children = [];
        var view = {
          getChildViews: jasmine.createSpy('getChildViews').and.returnValue(children)
        };
        var output = BaseView.prototype.getChildren.call(view);
        expect(output).to.equal(children);
        jasmineExpect(view.getChildViews).toHaveBeenCalled();
      });
      it('should bypass debug wrapping getChildViews', function() {
        var children = [];
        var view = {
          getChildViews: jasmine.createSpy('wrappedGetChildViews').and.returnValue(children)
        };
        view.getChildViews.original = jasmine.createSpy('getChildViews').and.returnValue(children);
        var output = BaseView.prototype.getChildren.call(view);
        expect(output).to.equal(children);
        jasmineExpect(view.getChildViews).not.toHaveBeenCalled();
        jasmineExpect(view.getChildViews.original).toHaveBeenCalled();
      });
    });
    describe('getDebugName', function() {
      it('should be a function', function() {
        expect(BaseView.prototype.getDebugName).to.be.a('function');
        expect(BaseView.prototype.getDebugName).to.have.length(0);
      });
      it('should return the cid if debugName is not available', function() {
        var result = BaseView.prototype.getDebugName.call({
          cid: 'view1'
        });

        expect(result).to.equal('view1');
      });
      it('should return the debugName', function() {
        var result = BaseView.prototype.getDebugName.call({
          cid: 'view1',
          constructor: {
            debugName: 'FOOBAR'
          }
        });

        expect(result).to.equal('FOOBAR1');
      });
    });
  }

  /**
   * Some backbone view specs modified from backbone.js:
   *    @author Jeremy Ashkenas, @license MIT
   *    Copyright (c) 2010-2015 Jeremy Ashkenas, DocumentCloud
   *    Permission is hereby granted, free of charge, to any person
   *    obtaining a copy of this software and associated documentation
   *    files (the "Software"), to deal in the Software without
   *    restriction, including without limitation the rights to use,
   *    copy, modify, merge, publish, distribute, sublicense, and/or sell
   *    copies of the Software, and to permit persons to whom the
   *    Software is furnished to do so, subject to the following
   *    conditions:
   *    The above copyright notice and this permission notice shall be
   *    included in all copies or substantial portions of the Software.
   *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
   *    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
   *    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   *    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
   *    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
   *    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
   *    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
   *    OTHER DEALINGS IN THE SOFTWARE.
   */

  describe('base_view.js backbone functionality', function() {
    var view;
    beforeEach(function() {
      view = new BaseView({
        id: 'test-view',
        className: 'test-view',
        other: 'non-special-option'
      });
    });
    afterEach(function() {
      view = undefined;
    });
    it('should render when called with dynamic initialize', function() {
      var template = {
        toVdom: function() {},
        attachView: function() {}
      };
      var spy = jasmine.createSpy('spy');
      var RenderStubBaseView = BaseView.extend({
        render: spy
      });
      view = new RenderStubBaseView({
        template: template,
        vtree: {},
        dynamicInitialize: true
      });
      jasmineExpect(spy).toHaveBeenCalled();
    });
    it('should not render when deferRender is set', function(done) {
      var template = {
        toVdom: function() {},
        attachView: function() {}
      };
      var spy = jasmine.createSpy('spy');
      var RenderStubBaseView = BaseView.extend({
        render: spy
      });
      view = new RenderStubBaseView({
        template: template,
        deferRender: true
      });
      setTimeout(function() {
        jasmineExpect(spy).not.toHaveBeenCalled();
        done();
      }, 1);
    });
    it('should call constructor', function() {
      expect(view.el.id).to.equal('test-view');
      expect(view.el.className).to.equal('test-view');
      expect(view.el.other).to.equal(void 0);
    });
    it('should set compiled template', function() {
      var noop = function() {};
      view = new BaseView({
        template: noop
      });
      expect(view.compiledTemplate).to.equal(noop);
    });
    it('should set context', function() {
      var context = {};
      view = new BaseView({
        context: context
      });
      expect(view.context).to.equal(context);
    });
    it('should set vtree', function() {
      var vtree = {};
      view = new BaseView({
        vtree: vtree
      });
      expect(view.vtree).to.equal(vtree);
    });
    it('should set parentView', function() {
      var parentView = {};
      view = new BaseView({
        parentView: parentView
      });
      expect(view.parentView).to.equal(parentView);
    });
    it('should set router', function() {
      var router = {
        view: {}
      };
      view = new BaseView({
        router: router
      });
      expect(view.router).to.equal(router);
    });
    it('should delegateEvents', function(done) {
      spyOn(tungsten, 'bindEvent');
      var view = new BaseView();
      view.handleClick = function() {};
      var events = {'click': 'handleClick'};

      view.delegateEvents(events);
      // delegateEvents fn uses a 1ms setTimeout
      window.setTimeout(function() {
        jasmineExpect(tungsten.bindEvent).toHaveBeenCalledWith(view.el, 'click', '', jasmine.any(Function), undefined);
        done();
      }, 1);
    });
    it('should undelegateEvents', function(done) {
      spyOn(tungsten, 'unbindEvent');
      var view = new BaseView();
      view.handleClick = function() {};
      var events = {'click': 'handleClick'};
      // delegateEvents fn uses a 1ms setTimeout
      view.delegateEvents(events);
      window.setTimeout(function() {
        view.undelegateEvents();
        jasmineExpect(tungsten.unbindEvent).toHaveBeenCalled();
        done();
      }, 1);
    });
    describe('updateVtree', function() {
      var model, template, view;
      beforeEach(function() {
        model = {};
        template = {
          toVdom: jasmine.createSpy('toVdom')
        };
        view = {
          compiledTemplate: template,
          serialize: function() {
            return model;
          }
        };
      });
      afterEach(function() {
        model = template = view = null;
      });

      it('should be allowed to call with no childViews', function() {
        expect(function() {
          BaseView.prototype.updateVtree.call(view);
        }).not.to.throw();
        jasmineExpect(template.toVdom).toHaveBeenCalledWith(model);
      });

      it('should be allowed to call with an empty childViews', function() {
        view.childViews = {};
        expect(function() {
          BaseView.prototype.updateVtree.call(view);
        }).not.to.throw();
        jasmineExpect(template.toVdom).toHaveBeenCalledWith(model);
      });

      it('should not be allowed to call with a populated childViews', function() {
        view.childViews = {
          'js-foo': _.noop
        };
        expect(function() {
          BaseView.prototype.updateVtree.call(view);
        }).to.throw();
        jasmineExpect(template.toVdom).not.toHaveBeenCalled();
      });
    });
  });

});
