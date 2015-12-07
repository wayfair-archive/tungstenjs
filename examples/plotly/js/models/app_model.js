/**
 * App Demo for Tungsten.js
 */
'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var PieChart = require('../components/pie_chart');

var Model = TungstenBackboneBase.Model;
var AppModel = Model.extend({
  relations: {
    myPieChart: PieChart
  },
  postInitialize: function() {
    window.setTimeout(() => {
      this.get('myPieChart').get('data').set('values', [100, 80, 20]);
      console.log('changed!');
    }, 2000);
  }
}, {debugName: 'AppModel'});
module.exports = AppModel;
