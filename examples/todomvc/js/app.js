var AppView = require('./views/todo_app_view');
var AppModel = require('./models/todo_app_model');
var template = require('../templates/todo_app_view.mustache');

module.exports = new AppView({
  el: '#appwrapper',
  template: template,
  model: new AppModel({
    todoItems: [{title: 'lorem ipsum'}, {title: 'foo'}],
    todoCount: 2,
    todoCountPlural: true
  })
});