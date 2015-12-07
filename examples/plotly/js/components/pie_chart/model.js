'use strict';

var Model = require('tungstenjs/adaptors/backbone').Model;
var Collection = require('tungstenjs/adaptors/backbone').Collection;

var PieChartModel = Model.extend({
  relations: {
    data: Model
  }
}, {
  debugName: 'PieChartModel'
});
module.exports = PieChartModel;
