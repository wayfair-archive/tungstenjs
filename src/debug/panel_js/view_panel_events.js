'use strict';

var _ = require('underscore');
var utils = require('./utils');
var textDiff = require('../text_diff');
var appData = require('./app_data');
var highlighter = require('../highlighter');

var debugTagRegex = /<span class="js-view-list-item .*?" data-id=".*?">(.*?)<\/span>/g;
function removeDebugTags(templateStr) {
  var cleanVdom = templateStr.replace(debugTagRegex, function(fullMatch, debugName) {
    return debugName;
  });
  return cleanVdom;
}

function getClosestView(elem) {
  var view = null;
  var wrapper = utils.closest(elem, 'js-view-list-item');
  if (wrapper) {
    view = appData.views[wrapper.getAttribute('data-id')];
  }
  return view;
}

function updateSelectedView() {
  var vdomTemplate = appData.selectedView.obj.getVdomTemplate();
  var elTemplate = appData.selectedView.obj.getElTemplate();
  if (elTemplate === 'View is detached from the page DOM') {
    appData.selectedView.templateDiff = elTemplate;
  } else {
    appData.selectedView.templateDiff = textDiff(removeDebugTags(elTemplate), removeDebugTags(vdomTemplate));
  }
  appData.selectedView.vdomTemplate = vdomTemplate;
  appData.selectedView.elTemplate = elTemplate;
  utils.render();
}

module.exports = function() {
  utils.addEvent('js-toggle-view-children', 'click', function(e) {
    e.stopPropagation();
    var view = getClosestView(e.target);
    view.collapsed = !view.collapsed;
    utils.render();
  });
  utils.addEvent('js-view-list-item', 'click', function(e) {
    if (appData.selectedView) {
      appData.selectedView.obj.off('rendered', utils.render);
    }
    appData.selectedView = getClosestView(e.target);
    appData.selectedView.obj.on('rendered', updateSelectedView);
    var cids = _.keys(appData.views);
    for (var i = 0; i < cids.length; i++) {
      appData.views[cids[i]].selected = appData.views[cids[i]].obj === appData.selectedView;
    }
    updateSelectedView();
  });
  utils.addEvent('js-view-list-item', 'mouseover', function(e) {
    var view = getClosestView(e.target).obj;
    highlighter(view.el, view.getDebugName());
  });
  utils.addEvent('js-view-list-item', 'mouseout', function() {
    highlighter(null);
  });
  utils.addEvent('js-view-element', 'click', function() {
    console.log(appData.selectedView.el);
  });
  utils.addEvent('js-more-view-info', 'click', function(e) {
    var view = getClosestView(e.target).obj;
    console.log(view);
  });
  utils.addEvent('js-view-event', 'click', function(e) {
    var selector = e.currentTarget.getAttribute('data-event-selector');
    console.log(selector, appData.selectedView.getEventFunction(selector));
  });
  utils.addEvent('js-track-function', 'click', function(e) {
    var fnName = e.currentTarget.getAttribute('data-fn');
    var selectedFunction = _.findWhere(appData.selectedView.objectFunctions, {name: fnName});
    selectedFunction.tracked = !selectedFunction.tracked;
    appData.selectedView.toggleFunctionTracking(fnName, selectedFunction.tracked);
    utils.render();
  });
  utils.addEvent('js-show-inherited', 'change', function(e) {
    appData.showInheritedMethods = e.currentTarget.checked;
    utils.render();
  });
  utils.addEvent('js-model-tab', 'click', function() {
    utils.gotoTab('showModelTab');
  });
};