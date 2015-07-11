var AppView = require('./views/app_view');
var AppModel = require('./models/app_model');
var template = require('../templates/app_view.mustache');

module.exports = new AppView({
  el: '#appwrapper',
  template: template,
  model: new AppModel(window.data)
});