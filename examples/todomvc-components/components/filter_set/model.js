'use strict';

var Model = require('tungstenjs/adaptors/backbone').Model;
var FilterCollection = require('./filter_collection');
var ItemModel = Model.extend({
  selectFilter: function(filterBy) {
    this.get('filters').selectFilter(filterBy);
  },
  relations: {
    filters: FilterCollection
  }
});
module.exports = ItemModel;
