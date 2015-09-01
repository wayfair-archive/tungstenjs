/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var app, router;
var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var TodoRouter = TungstenBackboneBase.Backbone.Router.extend({
  routes: {
    '*filter': 'setFilter'
  },
  setFilter: function (filter) {
    // Trigger a collection filter event, causing hiding/unhiding of Todo view items
    app.trigger('filter', filter || '');
  }
});

module.exports = {
  init: function(a) {
    app = a;
    if (!TungstenBackboneBase.Backbone.history.started) {
      router = new TodoRouter();
      TungstenBackboneBase.Backbone.history.start();
    }
  }
};
