'use strict';

var AppView = require('./views/app_view');
var AppModel = require('./models/app_model');
var films = require('./data.js');
var template = require('../templates/app.mustache');

window.appView = new AppView({
  el: '#appwrapper',
  template: template,
  model: new AppModel({films:films}),
  dynamicInitialize: true
});
