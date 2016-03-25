var AppView = require('./views/app_view');
var AppModel = require('./models/app_model');
var template = window.template = require('../templates/app_view.mustache');

var el = document.getElementById('appwrapper');

module.exports = window.view = new AppView({
  el: el,
  template: template,
  model: new AppModel(window.data),
  dynamicInitialize: el.childNodes.length === 0
});
