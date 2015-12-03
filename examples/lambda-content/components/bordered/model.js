'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var BaseModel = TungstenBackboneBase.Model;

module.exports = BaseModel.extend({
  defaults: {
    content: ''
  }
}, {
  debugName: 'RowModel'
});
