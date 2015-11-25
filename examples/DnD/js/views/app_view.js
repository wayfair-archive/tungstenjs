var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var BaseView = TungstenBackboneBase.View;
var FilmsView = require('./films_view');
var _ = require('underscore');

var AppView = BaseView.extend({
  childViews: {
    'js-films': FilmsView
  },
  events: {
    'click .js-year-toggle': 'toggleYear'
  },
  toggleYear: function () {
    var yearSpans = document.getElementsByClassName('year');

    _.each(yearSpans, function (yearSpan) {
      if (yearSpan.className.indexOf('hidden') >= 0) {
        yearSpan.className = 'year';
      } else {
        yearSpan.className = 'year hidden';
      }
    });
  }
});

module.exports = AppView;
