'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var BaseModel = TungstenBackboneBase.Model;

module.exports = BaseModel.extend({
  defaults: {
    color: '#000'
  }
}, {
  debugName: 'RowModel'
});
