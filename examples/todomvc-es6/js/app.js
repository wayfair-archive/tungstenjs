import { AppView } from './views/todo_app_view';
import { AppModel } from './models/todo_app_model';
import template from '../templates/todo_app_view.mustache';

var elem = document.getElementById('appwrapper');

window.app = module.exports = new AppView({
  el: elem,
  template: template,
  model: new AppModel(window.data),
  dynamicInitialize: elem.childNodes.length === 0
});
