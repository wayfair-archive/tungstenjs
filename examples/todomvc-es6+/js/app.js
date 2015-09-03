import { AppView } from './views/todo_app_view';
import { AppModel } from './models/todo_app_model';
import * as router from './app_router';
import template from '../templates/todo_app_view.mustache';

var el = document.getElementById('appwrapper');

window.app = module.exports = new AppView({
  el,
  template,
  model: new AppModel(window.data),
  dynamicInitialize: el.childNodes.length === 0
});

router.init(window.app);
