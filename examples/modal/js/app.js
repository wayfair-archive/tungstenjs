var template = require('../templates/app.mustache');

var ModalComponent = require('../components/modal');
var ModalNoPortalComponent = require('../components/modal_no_portal');
var TungstenBackboneBase = require('tungstenjs');
var BaseView = TungstenBackboneBase.View;
var BaseModel = TungstenBackboneBase.Model;
var BaseCollection = TungstenBackboneBase.Collection;

var AppModel = BaseModel.extend({
  relations: {
    modal: ModalComponent,
    modal_without_portal: ModalNoPortalComponent,
    options: BaseCollection
  }
});

var AppView = BaseView.extend({
  events: {
    'click .js-show-modal': 'showModal',
    'click .js-show-modal-without-portal': 'showModalWithoutPortal'
  },
  showModal: function() {
    this.model.get('modal').show();
  },
  showModalWithoutPortal: function() {
    this.model.get('modal_without_portal').show();
  }
});

var options = [{
  style: 'left:0;top:0',
  label: 'Top Left'
}, {
  style: 'right:0;top:0',
  label: 'Top Right'
}, {
  style: 'left:0;bottom:0',
  label: 'Bottom Left'
}, {
  style: 'right:0;bottom:0',
  label: 'Bottom Right'
}];

var data = {
  modal: {},
  modal_without_portal: {},
  options: options
};

var elem = document.getElementById('appwrapper');
window.app = new AppView({
  el: elem,
  template: template,
  model: new AppModel(data),
  dynamicInitialize: elem.childNodes.length === 0
});
