/**
* Example App Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;

var AppView = View.extend({
  postInitialize: function() {
    var self = this;
    window.setTimeout(function() {
      self.model.set({title: 'changed'});
      self.model.set('selectedCity', self.model.get('cities').at(2).toJSON());
      self.model.get('selectedCity').trigger('change');
      self.render();
      console.log('done');
    }, 3000);
  }
});
module.exports = AppView;
