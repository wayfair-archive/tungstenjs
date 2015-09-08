'use strict';

var AmpersandAdaptor = require('../../../adaptors/ampersand');
var logger = require('../../../src/utils/logger.js');
var AmpersandViewWidget = AmpersandAdaptor.ViewWidget;

describe('ampersand_view_widget public api', function() {
  describe('constructor', function() {
    it('should be a function', function() {
      expect(AmpersandViewWidget).to.be.a('function');
      expect(AmpersandViewWidget).to.have.length(4);
    });
    it('should assign properties as passed in', function() {
      var template = {};
      var childView = {
        tungstenView: true
      };
      var context = {};
      var parentView = {};
      var obj = new AmpersandViewWidget(template, childView, context, parentView);
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
        var obj = new AmpersandViewWidget(null, childView, context, null);
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
        var obj = new AmpersandViewWidget(null, childView, context, null);
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
        var obj = new AmpersandViewWidget(null, childView, null, parentView);
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
        var obj = new AmpersandViewWidget(null, childView, null, parentView);
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
        var obj = new AmpersandViewWidget(null, childView, null, null);
        expect(obj.ViewConstructor).to.equal(childView.view);
        jasmineExpect(logger.warn).toHaveBeenCalledWith('ChildView was passed as object without a scope property');
      });
    });
  });
  describe('type', function() {
    it('should be declared', function() {
      expect(AmpersandViewWidget.prototype.type).to.equal('Widget');
    });
  });
  describe('init', function() {
    it('should be a function', function() {
      expect(AmpersandViewWidget.prototype.init).to.be.a('function');
      expect(AmpersandViewWidget.prototype.init.length).to.equal(0);
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
      var result = AmpersandViewWidget.prototype.init.call(ctx);
      expect(result).to.equal(elem.childNodes[0]);
      jasmineExpect(template.toDom).toHaveBeenCalledWith(ctx.context);
      jasmineExpect(ViewConstructor).toHaveBeenCalled();
      expect(ctx.view).to.equal(expectedView);
    });
  });
  describe('update', function() {
    it('should be a function', function() {
      expect(AmpersandViewWidget.prototype.update).to.be.a('function');
      expect(AmpersandViewWidget.prototype.update.length).to.equal(2);
    });
  });
  describe('destroy', function() {
    it('should be a function', function() {
      expect(AmpersandViewWidget.prototype.destroy).to.be.a('function');
      expect(AmpersandViewWidget.prototype.destroy.length).to.equal(0);
    });
    it('should call view\'s destroy', function() {
      var view = {
        destroy: jasmine.createSpy('destroy')
      };
      AmpersandViewWidget.prototype.destroy.call({
        view: view
      });
      jasmineExpect(view.destroy).toHaveBeenCalled();
    });
    it('should handle view.destroy not being set', function() {
      expect(function() {
        AmpersandViewWidget.prototype.destroy.call({
          view: {}
        });
      }).not.to.throw();
      expect(function() {
        AmpersandViewWidget.prototype.destroy.call({});
      }).not.to.throw();
    });
  });
  describe('attach', function() {
    it('should be a function', function() {
      expect(AmpersandViewWidget.prototype.attach).to.be.a('function');
      expect(AmpersandViewWidget.prototype.attach.length).to.equal(1);
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
      AmpersandViewWidget.prototype.attach.call(ctx, elem);
      jasmineExpect(ViewConstructor).toHaveBeenCalled();
      expect(ctx.view).to.equal(expectedView);
    });
  });
  /* develblock:start */
  describe('templateToString', function() {
    it('should be a function', function() {
      expect(AmpersandViewWidget.prototype.templateToString).to.be.a('function');
      expect(AmpersandViewWidget.prototype.templateToString.length).to.equal(0);
    });
  });
  /* develblock:end */
});
