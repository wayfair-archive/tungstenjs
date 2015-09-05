'use strict';

var BackboneAdaptor = require('../../../adaptors/backbone');
var BaseView = BackboneAdaptor.View;
var Backbone = BackboneAdaptor.Backbone;
var tungsten = require('../../../src/tungsten');

describe('base_view.js public api', function() {
  describe('extend', function() {
    it('should be a function', function() {
      expect(BaseView.extend).to.be.a('function');
    });
    it('should accept two arguments', function() {
      expect(BaseView.extend.length).to.equal(2);
    });
    it('should be different than Backbone\'s', function() {
      expect(BaseView.extend).not.to.equal(Backbone.extend);
    });
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
      expect(BaseView.prototype.initializeRenderListener.length).to.equal(1);
    });
  });
  describe('postInitialize', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.postInitialize).to.be.a('function');
      expect(BaseView.prototype.postInitialize.length).to.equal(0);
    });
  });
  describe('validateVdom', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.validateVdom).to.be.a('function');
      expect(BaseView.prototype.validateVdom.length).to.equal(0);
    });
  });
  describe('serialize', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.serialize).to.be.a('function');
      expect(BaseView.prototype.serialize.length).to.equal(0);
    });
  });
  describe('delegateEvents', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.delegateEvents).to.be.a('function');
      expect(BaseView.prototype.delegateEvents.length).to.equal(1);
    });
  });
  describe('undelegateEvents', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.undelegateEvents).to.be.a('function');
      expect(BaseView.prototype.undelegateEvents.length).to.equal(0);
    });
  });
  describe('render', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.render).to.be.a('function');
      expect(BaseView.prototype.render.length).to.equal(0);
    });
  });
  describe('postRender', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.postRender).to.be.a('function');
      expect(BaseView.prototype.postRender.length).to.equal(0);
    });
  });
  describe('update', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.update).to.be.a('function');
      expect(BaseView.prototype.update.length).to.equal(1);
    });
  });
  describe('getChildViews', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.getChildViews).to.be.a('function');
      expect(BaseView.prototype.getChildViews.length).to.equal(0);
    });
  });
  describe('attachChildViews', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.attachChildViews).to.be.a('function');
      expect(BaseView.prototype.attachChildViews.length).to.equal(0);
    });
  });
  describe('destroy', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.destroy).to.be.a('function');
      expect(BaseView.prototype.destroy.length).to.equal(0);
    });
  });

  /* develblock:start */

  // Debug methods:
  describe('initDebug', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.initDebug).to.be.a('function');
      expect(BaseView.prototype.initDebug.length).to.equal(0);
    });
  });
  describe('getFunctions', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.getFunctions).to.be.a('function');
      expect(BaseView.prototype.getFunctions.length).to.equal(2);
    });
  });
  describe('_setElement', function() {
    it('should be a function', function() {
      expect(BaseView.prototype._setElement).to.be.a('function');
      expect(BaseView.prototype._setElement.length).to.equal(1);
    });
  });
  describe('getState', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.getState).to.be.a('function');
      expect(BaseView.prototype.getState.length).to.equal(0);
    });
  });
  describe('setState', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.setState).to.be.a('function');
      expect(BaseView.prototype.setState.length).to.equal(1);
    });
  });
  describe('getEvents', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.getEvents).to.be.a('function');
      expect(BaseView.prototype.getEvents.length).to.equal(0);
    });
  });
  describe('getVdomTemplate', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.getVdomTemplate).to.be.a('function');
      expect(BaseView.prototype.getVdomTemplate.length).to.equal(0);
    });
  });
  describe('getTemplateDiff', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.getTemplateDiff).to.be.a('function');
      expect(BaseView.prototype.getTemplateDiff.length).to.equal(0);
    });
  });
  describe('getChildren', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.getChildren).to.be.a('function');
      expect(BaseView.prototype.getChildren.length).to.equal(0);
    });
  });
  describe('getDebugName', function() {
    it('should be a function', function() {
      expect(BaseView.prototype.getDebugName).to.be.a('function');
      expect(BaseView.prototype.getDebugName.length).to.equal(0);
    });
  });
  /* develblock:end */

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
  });

});
