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

var ComponentWidget = require('tungstenjs/adaptors/backbone').ComponentWidget;
var ItemView = require('../views/todo_item_view');
var itemTemplate = require('../../templates/todo_item_view.mustache');

var Collection = require('tungstenjs/adaptors/backbone').Collection;
var TodoItemModel = require('../models/todo_item_model');
var ItemCollection = Collection.extend({
  model: function(data) {
    var id = _.uniqueId('w_subview');
    var model = new TodoItemModel(data);
    return new ComponentWidget(ItemView, model, itemTemplate, id);
  },
  _addReference: function(model, options) {
    return Collection.prototype._addReference.call(this, model.model, options);
  },
  filterItems: function(filterBy) {
    for (var i = this.length; i--;) {
      var model = this.at(i);
      model.set('hidden', itemIsHidden(model, filterBy));
    }
  }
});
module.exports = ItemCollection;
