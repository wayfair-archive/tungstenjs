'use strict';

var TungstenBackboneBase = require('tungstenjs');
var BaseView = TungstenBackboneBase.View;
var BaseModel = TungstenBackboneBase.Model;
var BaseCollection = TungstenBackboneBase.Collection;
var template = require('../templates/table.mustache');
require('./database-generator');
var TableModel = BaseModel.extend({
  defaults: {
    dbs: []
  },
  relations: {
    dbs: BaseCollection.extend({
      model: require('../components/row')
    })
  }
});
var TableView = BaseView.extend({
  setDBs: function(newData) {
    var rows = this.model.get('dbs');
    if (rows.length === 0) {
      rows.set(newData);
    } else {
      for (var i = 0; i < newData.length; i++) {
        rows.at(i).set(newData[i], {merge: true});
      }
    }
  }
}, {
  debugName: 'tableView'
});
window.table = new TableView({
  el: document.getElementById('appwrapper'),
  template: template,
  model: new TableModel({}),
  dynamicInitialize: true
});
