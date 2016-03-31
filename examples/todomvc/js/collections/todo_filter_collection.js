/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var Collection = require('tungstenjs').Collection;
var FilterCollection = Collection.extend({
  selectFilter: function(filterBy) {
    for (var i = this.length; i--;) {
      var model = this.at(i);
      model.set('selected', model.get('hash') === filterBy);
    }
  }
});
module.exports = FilterCollection;
