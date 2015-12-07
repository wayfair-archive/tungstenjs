'use strict';
var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var View = TungstenBackboneBase.View;
var PieChartView = View.extend({
  postInitialize: function() {
    var data = [this.model.get('data').toJSON()];
    var layout = {
      height: 400,
      width: 500
    };
    window.Plotly.newPlot(this.el, data, layout);
    this.listenTo(this.model, 'change:data', (d) => {
      console.log(this.model.get('data').toJSON());
      console.log('this.el', this.el);
      Plotly.restyle(this.el, [d.toJSON()]);
    });
  }
}, {
  debugName: 'PieChartView'
});
module.exports = PieChartView;
