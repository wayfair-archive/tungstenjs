'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var BaseView = TungstenBackboneBase.View;
var BaseModel = TungstenBackboneBase.Model;
var BaseCollection = TungstenBackboneBase.Collection;
var template = require('../templates/app.mustache');
var dragula = require('dragula');
var _ = require('underscore');

/* Example implementing https://github.com/bevacqua/dragula */

var DraggableView = BaseView.extend({
  postInitialize: function() {
    dragula([this.el]);
  },
  postRender: function() {
    dragula([this.el]);
  }
});

var DraggableContainerView = BaseView.extend({
  postInitialize: function() {
    this.draggable = [];
    var self = this;
    _.forEach(this.childViews, function(cvValue, cvKey) {
      if (cvValue.draggable === true) {
        var draggableItems = self.el.querySelectorAll('.' + cvKey);
        _.forEach(draggableItems, function(item) {
          self.draggable.push(item);
        });
      }
    });
    dragula(this.draggable);
  }
});

var AppView = DraggableContainerView.extend({
  childViews: {
    'js-container': {
      draggable: true,
      view: DraggableContainerView
    }
  }
});

window.appView = new AppView({
  el: '#appwrapper',
  template: template,
  model: new BaseModel({}),
  dynamicInitialize: true
});


