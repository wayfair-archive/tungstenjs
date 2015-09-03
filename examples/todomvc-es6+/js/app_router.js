/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

import { Backbone } from 'tungstenjs/adaptors/backbone';
var history = Backbone.history;
var Router = Backbone.Router;
var app, router;

var TodoRouter = Router.extend({
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
    if (!history.started) {
      router = new TodoRouter();
      history.start();
    }
  }
};