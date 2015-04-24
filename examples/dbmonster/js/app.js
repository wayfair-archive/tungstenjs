'use strict';

var TungstenBackboneBase = require('tungstenjs/adaptors/backbone');
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
      model: BaseModel.extend({
        idAttr: 'name'
      })
    })
  }
});
var TableView = BaseView.extend({
  childViews: {
    'js-table-row': BaseView.extend({}, {debugName: 'RowView'})
  },
  setDBs: function(e) {
    this.model.get('dbs').reset(e);
  }
}, {
  debugName: 'tableView'
});
window.table = new TableView({
  el: '#appwrapper',
  template: template,
  model: new TableModel({}),
  dynamicInitialize: true
});
