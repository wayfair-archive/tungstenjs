var template = require('../templates/svg_view.mustache');

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');

var elem = document.getElementById('appwrapper');

var DemoModel = TungstenBackboneBase.Model.extend({
  relations: {
    clock: TungstenBackboneBase.Model,
    chart: TungstenBackboneBase.Model.extend({
      relations: {
        temperatures: TungstenBackboneBase.Collection
      }
    })
  }
});

var MarkerView = TungstenBackboneBase.View.extend({
  events: {
    'click': function() {
      console.log('the temperature point clicked was', this.model.toJSON());
    }
  }
});

var ChartView = TungstenBackboneBase.View.extend({
  events: {
    'change .js-city-select': 'changeCity',
    'change .js-degree-type': 'changeType'
  },
  childViews: {
    'js-marker': MarkerView
  },
  setChart: function() {
    var index = this.model.get('selectedCityIndex');
    var type = this.model.get('degreeType');
    var city = this.model.get('cities')[index];
    var active = this.model.get('getCity')(city.temperatures, type);
    this.model.set(active, {reset: true});
  },
  changeCity: function(evt) {
    this.model.set('selectedCityIndex', evt.currentTarget.selectedIndex);
    this.setChart();
  },
  changeType: function(evt) {
    this.model.set('degreeType', evt.currentTarget.value);
    this.setChart();
  }
});
var DemoView = TungstenBackboneBase.View.extend({
  childViews: {
    'js-chart-view': ChartView
  }
});

window.app = module.exports = new DemoView({
  el: elem,
  template: template,
  model: new DemoModel(window.data),
  dynamicInitialize: elem.childNodes.length === 0
});

var clockModel = window.app.model.get('clock');
setInterval(function() {
  clockModel.set('datetime', new Date());
}, 1000);
