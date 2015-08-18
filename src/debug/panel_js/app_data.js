'use strict';

var isNode = require('../is_node');
var styles = isNode ? '' : require('!!tungsten_debug?static!../panel/style.css');

window.appData = module.exports = {
  styles: styles,
  tabs: {
    tabs: [
      {
        name: 'View <span class="glyphicon glyphicon-search js-find-view tab-action"></span>',
        isActive: true,
        activeTabName: 'showViewTab'
      },
      {
        name: 'Data',
        isActive: false,
        activeTabName: 'showModelTab'
      }
    ],
    selected: {
      showViewTab: true
    }
  },
  activeViews: [],
  views: {},
  activeModels: [],
  models: {},
  showInheritedMethods: false,
  hiddenPanels: {}
};

// Setting these after initial exports due to circular requirements
module.exports.tabs.tabs[0].events = require('./view_panel_events');
module.exports.tabs.tabs[1].events = require('./model_panel_events');
