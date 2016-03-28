'use strict';

var Model = require('tungstenjs').Model;
var FilterCollection = require('./filter_collection');
var ItemModel = Model.extend({
  exposedFunctions: ['selectFilter'],
  selectFilter: function(filterBy) {
    this.get('filters').selectFilter(filterBy);
  },
  relations: {
    filters: FilterCollection
  }
}, {
  debugName: 'TodoFilterSetModel'
});
module.exports = ItemModel;
