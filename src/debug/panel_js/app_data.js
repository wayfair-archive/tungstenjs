'use strict';
var window = require('global/window');
var isNode = require('../is_node');
var _ = require('underscore');
var styles = isNode ? '' : (
  require('!!tungsten_debug?static!purecss') +
  require('!!tungsten_debug?static!../panel/glyphicons.css') +
  require('!!tungsten_debug?static!../panel/style.css')
);

var bgData = {
  counter: 0,
  lastName: '',
  colors: ['#EDFAFF', '#E8FFF3', '#F5D5D4', '#F0D2F0', '#F4E2CB', '#D2CDFA', '#FFFEBB', '#FFBBF9']
};
var appData = window.appData = module.exports = {
  styles: styles,
  tungstenVersion: TUNGSTENJS_VERSION,
  tabs: {
    tabs: [{
      name: 'View',
      isActive: true,
      activeTabName: 'showViewTab',
      action: true,
      actionClass: 'glyphicon-search js-find-view'
    }, {
      name: 'Data',
      isActive: false,
      activeTabName: 'showModelTab'
    }],
    selected: {
      showViewTab: true
    }
  },
  activeViews: [],
  views: {},
  activeModels: [],
  models: {},
  showInheritedMethods: false,
  hiddenPanels: {},
  settings: {},
  allViewsCollapsed: false,
  allModelsCollapsed: false,
  /**
   * Reset any data pre-render to keep things consistent
   */
  resetCounters: function() {
    bgData.counter = 0;
    bgData.lastName = '';
  },
  getCollectionColor: function(name) {
    if (name !== bgData.lastName) {
      bgData.lastName = name;
      bgData.counter = (bgData.counter + 1) % bgData.colors.length;
    }
    return bgData.colors[bgData.counter];
  },
  validateSelected: function() {
    if (appData.selectedView && !appData.views[appData.selectedView.debugName]) {
      appData.selectedView = null;
    }
    if (appData.selectedModel && !appData.models[appData.selectedModel.debugName]) {
      appData.selectedModel = null;
    }
  },
  selectView: function(viewWrapper) {
    if (appData.selectedView) {
      appData.selectedView.obj.off('rendered', appData.updateSelectedView);
    }
    appData.selectedView = viewWrapper;
    appData.selectedView.obj.on('rendered', appData.updateSelectedView);
    var cids = _.keys(appData.views);
    for (var i = 0; i < cids.length; i++) {
      appData.views[cids[i]].selected = appData.views[cids[i]] === appData.selectedView;
    }
    appData.updateSelectedView();
  },
  selectModel: function(modelWrapper) {
    if (appData.selectedModel) {
      appData.selectedModel.obj.off('rendered', appData.updateSelectedModel);
    }
    appData.selectedModel = modelWrapper;
    appData.selectedModel.obj.on('rendered', appData.updateSelectedModel);
    var cids = _.keys(appData.models);
    for (var i = 0; i < cids.length; i++) {
      appData.models[cids[i]].selected = appData.models[cids[i]] === appData.selectedModel;
    }
    appData.updateSelectedModel();
  }
};

// Setting these after initial exports due to circular requirements
module.exports.tabs.tabs[0].events = require('./view_panel_events');
module.exports.tabs.tabs[1].events = require('./model_panel_events');
