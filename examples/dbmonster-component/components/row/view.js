'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var BaseView = TungstenBackboneBase.View;

module.exports = BaseView.extend({
  tagName: 'tr'
}, {
  debugName: 'RowView'
});
