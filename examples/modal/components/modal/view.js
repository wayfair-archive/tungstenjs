'use strict';

var TungstenBackboneBase = require('tungstenjs');
var BaseView = TungstenBackboneBase.View;

var ModalView = BaseView.extend({
  events: {
    'click .js-close-modal': 'close'
  },
  close: function() {
    this.model.hide();
  }
}, {
  debugName: 'ModalView'
});

// Uses a childView to get access through the Portal
module.exports = BaseView.extend({
  childViews: {
    'js-modal': ModalView
  }
}, {
  debugName: 'ModalComponentView'
});
