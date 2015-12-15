var template = require('../templates/app.mustache');

var BorderedComponent = require('../components/bordered');
var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
var BaseView = TungstenBackboneBase.View;
var BaseModel = TungstenBackboneBase.Model;

var AppModel = BaseModel.extend({
  relations: {
    fancy: BorderedComponent
  }
});

var AppView = BaseView.extend({
  postInitialize: function() {
    console.log('here1');
  },
  childViews: {
    'js-child': BaseView.extend({
      postInitialize: function() {
        console.log('here2');
      },
      events: {
        'click': function() {console.log('foo', this.el)}
      },
      postRender: function() {
        console.log('child rerender');
      }
    })
  },
  postRender: function() {
    console.log('app rerender');
  }
});

var options = [{
  name: 'a',
  value: 'a'
}, {
  name: 'b',
  value: 'b'
}, {
  name: 'c',
  value: 'c'
}, {
  name: 'd',
  value: 'd'
}]
var data = {
  prop: 'Parent',
  fancy: {
    prop: 'Component'
  },
  selected_value: options[1].value,
  options: options,
  selected: function(template, render) {
    var thisID = render('{{value}}');
    var selectedID = this.get('selected_value').toString();
    if (thisID === selectedID) {
      return ' selected="selected" ';
    }
  }
};

var elem = document.getElementById('appwrapper');
window.app = new AppView({
  el: elem,
  template: template,
  model: new AppModel(data),
  dynamicInitialize: elem.childNodes.length === 0
});
