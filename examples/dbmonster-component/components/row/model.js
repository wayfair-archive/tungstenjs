'use strict';

var TungstenBackboneBase = require('tungstenjs');
var BaseModel = TungstenBackboneBase.Model;
var BaseCollection = TungstenBackboneBase.Collection;

module.exports = BaseModel.extend({
  idAttribute: 'name'
}, {
  debugName: 'RowModel'
});
