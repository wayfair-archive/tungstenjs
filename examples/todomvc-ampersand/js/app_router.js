/**
 * Todo App Demo for Tungsten.js
 */
'use strict';

var app, router;
var Router = require('ampersand-router');
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
    router = new TodoRouter();
    if (!router.history.started()) {
      router.history.start({pushState: false});
    }
  }
};
