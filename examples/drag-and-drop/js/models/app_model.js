var TungstenBackboneBase = require('tungstenjs');
var BaseModel = TungstenBackboneBase.Model;
var FilmsCollection = require('../collections/films_collection');

var AppModel = BaseModel.extend({
  relations: {
    films: FilmsCollection
  }
});

module.exports = AppModel;
