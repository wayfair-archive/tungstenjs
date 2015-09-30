/**
 * Example App Demo for Tungsten.js
 */
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');

var Model = TungstenBackboneBase.Model;
var AppModel = Model.extend({
  relations: {
    'cities' : TungstenBackboneBase.Collection,
    'selectedCity': TungstenBackboneBase.Model
  },
  postInitialize: function() {
    var self = this;
    this.listenTo(this.get('cities'), 'selectCity', function(city) {
      self.set('selectedCity', city.toJSON());
    });
  }
});
module.exports = AppModel;
