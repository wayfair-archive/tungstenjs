var AppView = require('./views/todo_app_view');
var AppModel = require('./models/todo_app_model');
var template = require('../templates/todo_app_view.mustache');

window.NestedView = require('./views/nested_view');
window.NestedModel = require('tungstenjs/adaptors/backbone/base_model');

window.data.nested = {
  is_tungsten_component: true,
  template: require('../templates/nested.mustache'),
  data: {
    arr: [1, 2, 3]
  },
  view: window.NestedView,
  model: window.NestedModel
};

window.app = module.exports = new AppView({
  el: '#appwrapper',
  template: template,
  model: new AppModel(window.data),
  dynamicInitialize: true
});