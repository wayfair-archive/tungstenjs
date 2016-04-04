var TungstenBackboneBase = require('tungstenjs');
var BaseView = TungstenBackboneBase.View;
var DraggableContainerView = require('./draggable_container_view');

var FilmsView = DraggableContainerView.extend({
  childViews: {
    'js-film': BaseView
  }
});

module.exports = FilmsView;
