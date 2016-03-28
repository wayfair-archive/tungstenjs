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

var Collection = require('tungstenjs').Collection;
var ItemComponent = require('../../components/todo_item');

var ItemCollection = Collection.extend({
  model: ItemComponent,
  filterItems: function(filterBy) {
    for (var i = this.length; i--;) {
      var model = this.at(i);
      model.set('hidden', itemIsHidden(model, filterBy));
    }
  }
}, {
  debugName: 'TodoItemComponentCollection'
});
module.exports = ItemCollection;
