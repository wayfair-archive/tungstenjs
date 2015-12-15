'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var BaseView = TungstenBackboneBase.View;

module.exports = BaseView.extend({
  postRender: function() {
    console.log('bordered rerender');
  }
}, {
  debugName: 'BorderedView'
});
