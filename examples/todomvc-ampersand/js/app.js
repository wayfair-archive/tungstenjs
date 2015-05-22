var AppView = require('./views/todo_app_view');
var AppModel = require('./models/todo_app_model');
var template = require('../templates/todo_app_view.mustache');

window.test = module.exports = new AppView({
  el: document.getElementById('appwrapper'),
  template: template,
  model: new AppModel(window.data)
});