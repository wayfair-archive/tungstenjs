/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var Collection = require('tungstenjs/adaptors/ampersand').Collection;
var FilterCollection = Collection.extend({
  model: require('../models/todo_filter_model'),
  debugName: 'TodoFilterCollection',
  selectFilter: function(filterBy) {
    for (var i = this.length; i--;) {
      var model = this.at(i);
      model.selected = model.hash === filterBy;
    }
  }
});
module.exports = FilterCollection;
