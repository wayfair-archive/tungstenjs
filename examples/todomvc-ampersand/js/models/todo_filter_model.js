/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var Model = require('tungstenjs/adaptors/ampersand').Model;
var FilterModel = Model.extend({
  props: {
    name: 'string',
    hash: 'string',
    selected: 'boolean'
  },
  debugName: 'TodoFilterModel'
});
module.exports = FilterModel;
