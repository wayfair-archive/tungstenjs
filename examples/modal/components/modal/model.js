'use strict';

var TungstenBackboneBase = require('tungstenjs');
var BaseModel = TungstenBackboneBase.Model;

module.exports = BaseModel.extend({
  exposedFunctions: ['show', 'hide'],
  defaults: {
    visible: false
  },
  show: function() {
    this.set('visible', true);
  },
  hide: function() {
    this.set('visible', false);
  }
}, {
  debugName: 'ModalModel'
});
