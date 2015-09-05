'use strict';

var AmpersandAdaptor = require('../../../adaptors/ampersand');
var BaseView = AmpersandAdaptor.View;
var Ampersand = AmpersandAdaptor.Ampersand;
var tungsten = require('../../../src/tungsten');

describe('base_view.js public api', function() {
  describe('extend', function() {
    it('should be a function', function() {
      expect(BaseView.extend).to.be.a('function');
    });
    it('should accept one argument', function() {
      expect(BaseView.extend.length).to.equal(1);
    });
    it('should be different than Ampersand\'s', function() {
      expect(BaseView.extend).not.to.equal(Ampersand.View.extend);
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
});

/**
 * Some unit tests modified from ampersand-view and backbone
 *
 *    @license MIT
 *    Copyright © 2014 &yet, LLC and AmpersandJS contributors
 *
 *    @author Jeremy Ashkenas, @license MIT
 *    Copyright (c) 2010-2015 Jeremy Ashkenas, DocumentCloud
 *    https://github.com/AmpersandJS/ampersand-view/blob/master/test/main.js
 *
 *    Permission is hereby granted, free of charge, to any person obtaining a
 *    copy of this software and associated documentation files (the
 *    "Software"), to deal in the Software without restriction, including
 *    without limitation the rights to use, copy, modify, merge, publish,
 *    distribute, sublicense, and/or sell copies of the Software, and to
 *    permit persons to whom the Software is furnished to do so, subject to
 *    the following conditions:
 *    The above copyright notice and this permission notice shall be included
 *    in all copies or substantial portions of the Software.*
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 *    OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 *    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 *    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

describe('base_view.js ampersand functionality', function() {
  var view;
  beforeEach(function() {
    view = new BaseView({
      el: document.createElement('div'),
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
      el: document.createElement('div'),
      template: template,
      vtree: {},
      dynamicInitialize: true
    });
    jasmineExpect(spy).toHaveBeenCalled();
  });
  it('should set context', function() {
    var context = {};
    view = new BaseView({
      el: document.createElement('div'),
      context: context
    });
    expect(view.context).to.equal(context);
  });
  it('should set vtree', function() {
    var vtree = {};
    view = new BaseView({
      el: document.createElement('div'),
      vtree: vtree
    });
    expect(view.vtree).to.equal(vtree);
  });
  it('should set parentView', function() {
    var parentView = {};
    view = new BaseView({
      el: document.createElement('div'),
      parentView: parentView
    });
    expect(view.parentView).to.equal(parentView);
  });
  it('should delegateEvents', function() {
    spyOn(tungsten, 'bindEvent');
    var view = new BaseView({el: document.createElement('div')});
    view.handleClick = function() {};
    var events = {'click': 'handleClick'};

    view.delegateEvents(events);
    // delegateEvents fn uses a 1ms setTimeout
    jasmineExpect(tungsten.bindEvent).toHaveBeenCalledWith(view.el, 'click', '', jasmine.any(Function), undefined);
  });
  it('should undelegateEvents', function() {
    spyOn(tungsten, 'unbindEvent');
    var view = new BaseView({el: document.createElement('div')});
    view.handleClick = function() {};
    var events = {'click': 'handleClick'};
    view.delegateEvents(events);
    view.undelegateEvents();
    // delegateEvents fn uses a 1ms setTimeout
    jasmineExpect(tungsten.unbindEvent).toHaveBeenCalled();
  });
});