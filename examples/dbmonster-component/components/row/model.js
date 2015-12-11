'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var BaseModel = TungstenBackboneBase.Model;
var BaseCollection = TungstenBackboneBase.Collection;

module.exports = BaseModel.extend({
  idAttribute: 'name'
}, {
  debugName: 'RowModel'
});
