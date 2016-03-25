var template = require('../templates/svg_view.mustache');

var TungstenBackboneBase = require('tungstenjs');

var elem = document.getElementById('appwrapper');

var moment = window.moment;

var DemoModel = TungstenBackboneBase.Model.extend({
  relations: {
    clock: TungstenBackboneBase.Model.extend({
      derived: {
        hourRotation: {
          deps: ['datetime'],
          fn: function() {
            var datetime = this.get('datetime');
            return 30 * datetime.getHours() + datetime.getMinutes() / 2;
          }
        },
        minuteRotation: {
          deps: ['datetime'],
          fn: function() {
            var datetime = this.get('datetime');
            return 6 * datetime.getMinutes() + datetime.getSeconds() / 10;
          }
        },
        secondRotation: {
          deps: ['datetime'],
          fn: function() {
            var datetime = this.get('datetime');
            return 6 * datetime.getSeconds();
          }
        },
        formattedDay: {
          deps: ['datetime'],
          fn: function() {
            var datetime = this.get('datetime');
            return moment(datetime).format('dddd MMMM Do YYYY');
          }
        },
        formattedTime: {
          deps: ['datetime'],
          fn: function() {
            var datetime = this.get('datetime');
            return moment(datetime).format('h:mm:ss a')
          }
        }
      }
    }),
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

debugger;
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
