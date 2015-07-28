var AppView = require('./views/todo_app_view');
var AppModel = require('./models/todo_app_model');
var template = require('../templates/todo_app_view.mustache');

window.app = module.exports = new AppView({
  el: '#appwrapper',
  template: template,
  dynamicInitialize: true,
  model: new AppModel(window.data)
});