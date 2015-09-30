'use strict';

var BackboneAdaptor = require('../../../adaptors/backbone');
var logger = require('../../../src/utils/logger.js');
var BackboneViewWidget = BackboneAdaptor.ViewWidget;

describe('backbone_view_widget public api', function() {
  describe('constructor', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget).to.be.a('function');
      expect(BackboneViewWidget).to.have.length(4);
    });
    it('should assign properties as passed in', function() {
      var template = {};
      var childView = {
        tungstenView: true
      };
      var context = {};
      var parentView = {};
      var obj = new BackboneViewWidget(template, childView, context, parentView);
      expect(obj.template).to.equal(template);
      expect(obj.context).to.equal(context);
      expect(obj.parentView).to.equal(parentView);
      expect(obj.ViewConstructor).to.equal(childView);
    });
    describe('assigning model', function() {
      it('should use context.lastModel by default', function() {
        var childView = {
          tungstenView: true
        };
        var context = {
          lastModel: {}
        };
        var obj = new BackboneViewWidget(null, childView, context, null);
        expect(obj.ViewConstructor).to.equal(childView);
        expect(obj.model).to.equal(context.lastModel);
      });
      it('should treat __TEMPLATE__ as default', function() {
        var childView = {
          view: {
            tungstenView: true
          },
          scope: '__TEMPLATE__'
        };
        var context = {
          lastModel: {}
        };
        var obj = new BackboneViewWidget(null, childView, context, null);
        expect(obj.ViewConstructor).to.equal(childView.view);
        expect(obj.model).to.equal(context.lastModel);
      });
      it('should use parent\'s model for __PARENT__', function() {
        var childView = {
          view: {
            tungstenView: true
          },
          scope: '__PARENT__'
        };
        var parentView = {
          model: {}
        };
        var obj = new BackboneViewWidget(null, childView, null, parentView);
        expect(obj.ViewConstructor).to.equal(childView.view);
        expect(obj.model).to.equal(parentView.model);
      });
      it('should use any other value as a lookup in parent\'s model', function() {
        var childView = {
          view: {
            tungstenView: true
          },
          scope: 'foo'
        };
        var model = {};
        var parentView = {
          model: {
            getDeep: jasmine.createSpy('getDeep').and.returnValue(model)
          }
        };
        var obj = new BackboneViewWidget(null, childView, null, parentView);
        expect(obj.ViewConstructor).to.equal(childView.view);
        jasmineExpect(parentView.model.getDeep).toHaveBeenCalledWith('foo');
        expect(obj.model).to.equal(model);
      });
      it('should warn if scope is missing', function() {
        var childView = {
          view: {
            tungstenView: true
          }
        };
        spyOn(logger, 'warn');
        var obj = new BackboneViewWidget(null, childView, null, null);
        expect(obj.ViewConstructor).to.equal(childView.view);
        jasmineExpect(logger.warn).toHaveBeenCalledWith('ChildView was passed as object without a scope property');
      });
    });
  });
  describe('type', function() {
    it('should be declared', function() {
      expect(BackboneViewWidget.prototype.type).to.equal('Widget');
    });
  });
  describe('init', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget.prototype.init).to.be.a('function');
      expect(BackboneViewWidget.prototype.init).to.have.length(0);
    });
    it('should construct from the template\'s DOM and return the element', function() {
      // template.toDom returns a documentFragment
      var elem = {
        childNodes: [{}]
      };
      var template = {
        toDom: jasmine.createSpy('toDom').and.returnValue(elem)
      };
      var expectedView;
      var ViewConstructor = jasmine.createSpy('ViewConstructor').and.callFake(function (args) {
        expectedView = args;
        return args;
      });
      var ctx = {
        ViewConstructor: ViewConstructor,
        context: {},
        template: template
      };
      var result = BackboneViewWidget.prototype.init.call(ctx);
      expect(result).to.equal(elem.childNodes[0]);
      jasmineExpect(template.toDom).toHaveBeenCalledWith(ctx.context);
      jasmineExpect(ViewConstructor).toHaveBeenCalled();
      expect(ctx.view).to.equal(expectedView);
    });
  });
  describe('update', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget.prototype.update).to.be.a('function');
      expect(BackboneViewWidget.prototype.update).to.have.length(2);
    });
    it('should create a view if one is not provided', function() {
      var prev = {};
      var elem = document.createElement('div');
      var view = {};
      var widget = {
        ViewConstructor: jasmine.createSpy('ViewConstructor').and.returnValue(view),
        parentView: {},
        model: {},
        template: {},
        context: {}
      };
      BackboneViewWidget.prototype.update.call(widget, prev, elem);

      expect(widget.view).to.equal(view);
      jasmineExpect(widget.ViewConstructor).toHaveBeenCalled();
      var args = widget.ViewConstructor.calls.mostRecent().args;
      expect(args).to.have.length(1);
      expect(args[0]).to.have.keys('el', 'model', 'parentView', 'context', 'vtree', 'template');
      expect(args[0].el).to.equal(elem);
      expect(args[0].model).to.equal(widget.model);
      expect(args[0].parentView).to.equal(widget.parentView);
      expect(args[0].context).to.equal(widget.context);
      expect(args[0].vtree).to.be.null;
      expect(args[0].template).to.equal(widget.template);
    });
    it('should recycle a view if one is provided', function() {
      var ViewConstructor = {};
      var oldParentView = {};
      var compiledTemplate = {};
      var prev = {
        ViewConstructor: ViewConstructor,
        view: {
          setElement: jasmine.createSpy('setElement'),
          update: jasmine.createSpy('update')
        },
        parentView: oldParentView
      };
      var elem = document.createElement('div');
      var widget = {
        ViewConstructor: ViewConstructor,
        parentView: {},
        model: {},
        template: {
          attachView: jasmine.createSpy('attachView').and.returnValue(compiledTemplate)
        },
        context: {}
      };
      BackboneViewWidget.prototype.update.call(widget, prev, elem);

      expect(widget.view).to.equal(prev.view);
      jasmineExpect(widget.view.setElement).toHaveBeenCalledWith(elem);
      expect(widget.view.parentView).not.to.equal(oldParentView);
      expect(widget.view.parentView).to.equal(widget.parentView);
      jasmineExpect(widget.template.attachView).toHaveBeenCalledWith(widget.view, BackboneViewWidget);
      expect(widget.view.compiledTemplate).to.equal(compiledTemplate);
      jasmineExpect(widget.view.update).toHaveBeenCalledWith(widget.model);
    });
    it('should create a view if an unmatched one is provided', function() {
      var prev = {
        ViewConstructor: {},
        destroy: jasmine.createSpy('destroy'),
        view: {
          vtree: {}
        }
      };
      var elem = document.createElement('div');
      var view = {};
      var widget = {
        ViewConstructor: jasmine.createSpy('ViewConstructor').and.returnValue(view),
        parentView: {},
        model: {},
        template: {},
        context: {}
      };
      BackboneViewWidget.prototype.update.call(widget, prev, elem);

      jasmineExpect(prev.destroy).toHaveBeenCalled();
      expect(widget.view).to.equal(view);
      jasmineExpect(widget.ViewConstructor).toHaveBeenCalled();
      var args = widget.ViewConstructor.calls.mostRecent().args;
      expect(args).to.have.length(1);
      expect(args[0]).to.have.keys('el', 'model', 'parentView', 'context', 'vtree', 'template');
      expect(args[0].el).to.equal(elem);
      expect(args[0].model).to.equal(widget.model);
      expect(args[0].parentView).to.equal(widget.parentView);
      expect(args[0].context).to.equal(widget.context);
      expect(args[0].vtree).to.equal(prev.view.vtree);
      expect(args[0].template).to.equal(widget.template);
    });
  });
  describe('destroy', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget.prototype.destroy).to.be.a('function');
      expect(BackboneViewWidget.prototype.destroy).to.have.length(0);
    });
    it('should call view\'s destroy', function() {
      var view = {
        destroy: jasmine.createSpy('destroy')
      };
      BackboneViewWidget.prototype.destroy.call({
        view: view
      });
      jasmineExpect(view.destroy).toHaveBeenCalled();
    });
    it('should handle view.destroy not being set', function() {
      expect(function() {
        BackboneViewWidget.prototype.destroy.call({
          view: {}
        });
      }).not.to.throw();
      expect(function() {
        BackboneViewWidget.prototype.destroy.call({});
      }).not.to.throw();
    });
  });
  describe('attach', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget.prototype.attach).to.be.a('function');
      expect(BackboneViewWidget.prototype.attach).to.have.length(1);
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
      BackboneViewWidget.prototype.attach.call(ctx, elem);
      jasmineExpect(ViewConstructor).toHaveBeenCalled();
      expect(ctx.view).to.equal(expectedView);
    });
  });
  /* develblock:start */
  describe('templateToString', function() {
    it('should be a function', function() {
      expect(BackboneViewWidget.prototype.templateToString).to.be.a('function');
      expect(BackboneViewWidget.prototype.templateToString).to.have.length(0);
    });
    it('should return nothing if view is not set', function() {
      var output = BackboneViewWidget.prototype.templateToString.call({});
      expect(output).to.be.undefined;
    });
    it('should return a string with the debug name', function() {
      var debugName = 'FOOBAR';
      var view = {
        getDebugName: jasmine.createSpy('getDebugName').and.returnValue(debugName)
      };
      var widget = {
        view: view
      };
      var output = BackboneViewWidget.prototype.templateToString.call(widget);
      expect(output).to.be.a('string');
      expect(output).to.contain(debugName);
      jasmineExpect(view.getDebugName).toHaveBeenCalled();
    });
  });
  /* develblock:end */
});
