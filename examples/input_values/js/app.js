var TungstenBackboneBase = require('tungstenjs');
var _ = TungstenBackboneBase._;
var View = TungstenBackboneBase.View;
var Model = TungstenBackboneBase.Model;
var Collection = TungstenBackboneBase.Collection;

var AppView = View.extend({
  events: {
    'change .js-input': function(e) {
      this.model.get('inputs').findWhere({name: e.target.name}).set('value', e.target.value);
    },
    'change .js-textarea': function(e) {
      this.model.get('textareas').findWhere({name: e.target.name}).set('value', e.target.value);
    },
    'change .js-checkbox': function(e) {
      this.model.get('checkboxes').findWhere({name: e.target.name}).set('checked', e.target.checked);
    }
  }
});

var ShufflingCollection = Collection.extend({
  postInitialize: function() {
    this.listenTo(this, 'change', function() {
      this.set(_.shuffle(this.models));
    });
  },
  model: Model.extend({
    idAttribute: 'name'
  })
});

var AppModel = Model.extend({
  relations: {
    inputs: ShufflingCollection,
    textareas: ShufflingCollection,
    checkboxes: ShufflingCollection
  }
});

var template = require('../templates/app_view.mustache');

var elem = document.getElementById('appwrapper');

window.app = module.exports = new AppView({
  el: elem,
  template: template,
  model: new AppModel(window.data),
  dynamicInitialize: elem.childNodes.length === 0
});
