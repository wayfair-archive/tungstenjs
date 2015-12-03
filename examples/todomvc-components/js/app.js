var _ = require('underscore');
var AppView = require('./views/todo_app_view');
var AppModel = require('./models/todo_app_model');
var template = require('../templates/todo_app_view.mustache');

var elem = document.getElementById('appwrapper');

window.app = module.exports = new AppView({
  el: elem,
  template: template,
  model: new AppModel(window.data),
  dynamicInitialize: elem.childNodes.length === 0
});

var router = require('./app_router');
router.init(window.app);
