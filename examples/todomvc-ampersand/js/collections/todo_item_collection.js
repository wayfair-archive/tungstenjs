/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var Model = require('../models/todo_item_model.js');
var Collection = require('tungstenjs/adaptors/ampersand').Collection;
var ItemCollection = Collection.extend({
  model: Model
});
module.exports = ItemCollection;