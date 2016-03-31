'use strict';

var TungstenBackboneBase = require('tungstenjs');
var BaseView = TungstenBackboneBase.View;

module.exports = BaseView.extend({
  tagName: 'tr'
}, {
  debugName: 'RowView'
});
