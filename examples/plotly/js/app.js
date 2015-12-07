var AppView = require('./views/app_view');
var AppModel = require('./models/app_model');
var template = require('../templates/app_view.mustache');

var elem = document.getElementById('appwrapper');

window.app = module.exports = new AppView({
  el: elem,
  template: template,
  model: new AppModel(window.data),
  dynamicInitialize: true
});
