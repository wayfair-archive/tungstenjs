/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

function itemIsHidden(item, filter) {
  if (filter === 'active') {
    return item.get('completed');
  } else if (filter === 'completed') {
    return !item.get('completed');
  }
  return false;
}

var Model = require('../models/todo_item_model.js');
var Collection = require('tungstenjs').Collection;
var ItemCollection = Collection.extend({
  model: Model,
  filterItems: function(filterBy) {
    for (var i = this.length; i--;) {
      var model = this.at(i);
      model.set('hidden', itemIsHidden(model, filterBy));
    }
  }
});
module.exports = ItemCollection;
