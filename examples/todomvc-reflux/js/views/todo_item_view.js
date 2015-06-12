/**
* Todo App Demo for Tungsten.js
*/
'use strict';

var TungstenBackboneBase = require('../../../../adaptors/backbone-reflux');
var TodoActions = require('../actions');
var View = TungstenBackboneBase.View;
var ENTER_KEY = 13;
var ESC_KEY = 27;
var TodoItemView = View.extend({
  events: {
    'blur .js-todo-edit': 'handleBlurTodoEdit',
    'click .js-toggle': 'handleClickToggle',
    'click .js-destroy': 'handleClickDestroy',
    'dblclick .js-todo-title': 'handleDblClickTodoTitle',
    'keypress .js-todo-edit': 'handleKeyPressTodoEdit'
  },
  handleBlurTodoEdit: function() {
    var text = this.state.editValue; // because of the linkState call in render, this is the contents of the field
    // unless we're not editing (escape was pressed) or text is empty, save!
    if (this.state.isEditing && text) {
      TodoActions.editItem(this.model.id, text);
    }
    // whatever the outcome, if we left the field we're not editing anymore
    this.setState({isEditing:false});
  },
  handleClickDestroy: function() {
    TodoActions.removeItem(this.model.id);
  },
  handleClickToggle: function() {
    debugger;
    TodoActions.toggleItem(this.model.id);
  },
  handleDblClickTodoTitle: function(e) {
    e.preventDefault();
    // because of linkState call in render, field will get value from this.state.editValue
    this.setState({
      isEditing: true,
      editValue: this.model.label
    });
    e.currentTarget.focus();
  },
  handleKeyPressTodoEdit: function(evt) {
    var text = this.state.editValue; // because of the linkState call in render, this is the contents of the field
    // we pressed enter, if text isn't empty we blur the field which will cause a save
    if (evt.which === ENTER_KEY && text) {
      this.refs.editInput.getDOMNode().blur();
    }
    // pressed escape. set editing to false before blurring so we won't save
    else if (evt.which === ESC_KEY) {
      this.setState({ isEditing: false });
    }
  }
}, {
  debugName: 'TodoItemView'
});
module.exports = TodoItemView;
