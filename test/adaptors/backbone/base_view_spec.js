'use strict';

var BaseView = require('../../../adaptors/backbone/base_view');
var Backbone = require('backbone');

describe('base_view.js public api', function () {
  describe('extend', function () {
    it('should be a function', function () {
      expect(BaseView.extend).to.be.a('function');
    });
    it('should accept two arguments', function () {
      expect(BaseView.extend.length).to.equal(2);
    });
    it('should be different than Backbone\'s', function() {
      expect(BaseView.extend).not.to.equal(Backbone.extend);
    });
  });

  describe('tungstenView', function () {
    it('should be set', function() {
      expect(BaseView.tungstenView).to.be.true;
    });
  });
});

describe('base_view.js constructed api', function () {
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
});