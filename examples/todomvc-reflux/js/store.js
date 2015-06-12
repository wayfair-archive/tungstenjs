'use strict';

var TungstenBackboneBase = require('../../../adaptors/backbone-reflux');
var Reflux = TungstenBackboneBase.Reflux;
var TodoActions = require('./actions');
var _ = require('underscore');

// some variables and helpers for our fake database stuff
var todoCounter = 0,
  localStorageKey = 'todos';

function getItemByKey(list, itemKey) {
  return _.find(list, function(item) {
    return item.key === itemKey;
  });
}

module.exports = Reflux.createStore({
  // this will set up listeners to all publishers in TodoActions, using onKeyname (or keyname) as callbacks
  listenables: [TodoActions],
  onEditItem: function(itemKey, newLabel) {
    var foundItem = getItemByKey(this.state.todoItems, itemKey);
    if (!foundItem) {
      return;
    }
    foundItem.label = newLabel;
    this.updateList(this.state.todoItems);
  },
  onAddItem: function(label) {
    this.updateList([{
      key: todoCounter++,
      created: new Date(),
      isComplete: false,
      label: label
    }].concat(this.state.todoItems));
  },
  onRemoveItem: function(itemKey) {
    this.updateList(_.filter(this.state.todoItems, function(item) {
      return item.key !== itemKey;
    }));
  },
  onToggleItem: function(itemKey) {
    var foundItem = getItemByKey(this.state.todoItems, itemKey);
    if (foundItem) {
      foundItem.isComplete = !foundItem.isComplete;
      this.updateList(this.state.todoItems);
    }
  },
  onToggleAllItems: function(checked) {
    this.updateList(_.map(this.state.todoItems, function(item) {
      item.isComplete = checked;
      return item;
    }));
  },
  onClearCompleted: function() {
    this.updateList(_.filter(this.state.todoItems, function(item) {
      return !item.isComplete;
    }));
  },
  // called whenever we change a list. normally this would mean a database API call
  updateList: function(list) {
    localStorage.setItem(localStorageKey, JSON.stringify(list));
    // if we used a real database, we would likely do the below in a callback
    this.state.todoItems = list;
    this.trigger(list); // sends the updated list to all listening components (TodoApp)
  },
  // this will be called by all listening components as they register their listeners
  getInitialState: function() {
    var loadedList = localStorage.getItem(localStorageKey);
    this.state = {};
    if (!loadedList) {
      // If no list is in localstorage, start out with a default one
      this.state.todoItems = [{
        key: todoCounter++,
        created: new Date(),
        isComplete: false,
        label: 'Rule the web'
      }];
    } else {
      this.state.todoItems = _.map(JSON.parse(loadedList), function(item) {
        // just resetting the key property for each todo item
        item.key = todoCounter++;
        return item;
      });
    }
    var state = this.state;
    this.state.todoLeftCount = function() {
      return _.filter(state.todoItems, function(item) {
        return !item.isComplete;
      }).length;
    };
    this.state.todoLeftCountPlural = function() {
      var count = state.todoLeftCount();
      return count === 0 || count > 1;
    };
    this.state.hasCompletedItems = function() {
      return _.findWhere(state.todoItems, {isComplete: true}) !== undefined
    };
    return this.state;
  }
});
