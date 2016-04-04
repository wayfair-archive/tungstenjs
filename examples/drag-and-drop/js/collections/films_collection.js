'use strict';

var TungstenBackboneBase = require('tungstenjs');
var BaseModel = TungstenBackboneBase.Model;
var BaseCollection = TungstenBackboneBase.Collection;

var FilmsCollection = BaseCollection.extend({
  model: BaseModel
});

module.exports = FilmsCollection;
