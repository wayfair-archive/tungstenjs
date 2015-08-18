'use strict';

var _ = require('underscore');
var utils = require('./utils');
var appData = require('./app_data');
var highlighter = require('../highlighter');
var logger = require('../../utils/logger');
var dataset = require('data-set');

function getClosestView(elem) {
  var view = null;
  var wrapper = utils.closest(elem, 'js-view-list-item');
  if (wrapper) {
    view = appData.views[wrapper.getAttribute('data-id')];
  }
  return view;
}

function updateSelectedView() {
  appData.selectedView.vdomTemplate = appData.selectedView.obj.getVdomTemplate();
  var diff = appData.selectedView.obj.getTemplateDiff();
  if (diff.indexOf('<ins>') + diff.indexOf('<del>') > -2) {
    appData.selectedView.templateDiff = diff;
  } else {
    appData.selectedView.templateDiff = 'No difference';
  }
  utils.render();
}

function selectView(viewWrapper) {
  if (appData.selectedView) {
    appData.selectedView.obj.off('rendered', utils.render);
  }
  appData.selectedView = viewWrapper;
  appData.selectedView.obj.on('rendered', updateSelectedView);
  var cids = _.keys(appData.views);
  for (var i = 0; i < cids.length; i++) {
    appData.views[cids[i]].selected = appData.views[cids[i]] === appData.selectedView;
  }
  updateSelectedView();
}

// Parent window functionality
utils.addEventListener(document.getElementById('tungstenDebugOverlay'), 'mousemove', function(e) {
  var matchedElems = [];
  // Hide the overlay to grab the underlying element
  highlighter.hideOverlay();
  var el = document.elementFromPoint(e.clientX, e.clientY);
  highlighter.showOverlay();
  var data;
  while (el) {
    data = dataset(el);
    if (data.view) {
      matchedElems.unshift([el, data.view.getDebugName()]);
    }
    el = el.parentNode;
  }
  if (matchedElems.length) {
    highlighter.highlight(matchedElems);
  } else {
    highlighter.unhighlight();
  }
});

utils.addEventListener(document.getElementById('tungstenDebugOverlay'), 'click', function(e) {
  var closestView = null;
  highlighter.hideOverlay();
  highlighter.hideTargets();
  var el = document.elementFromPoint(e.clientX, e.clientY);
  var data;
  while (el && !closestView) {
    data = dataset(el);
    closestView = data.view;
    el = el.parentNode;
  }
  if (closestView) {
    var viewWrapper = appData.views[closestView.getDebugName()];
    selectView(viewWrapper);
  }
});

window.findView = function() {
  var targets = _.map(appData.views, function(view) {
    return view.obj.el;
  });
  highlighter.indicateTargets(targets);
  highlighter.showOverlay();
};

module.exports = function() {
  utils.addEvent('js-find-view', 'click', function(e) {
    e.stopPropagation();
    window.findView();
  });
  utils.addEvent('js-toggle-view-children', 'click', function(e) {
    e.stopPropagation();
    var view = getClosestView(e.target);
    view.collapsed = !view.collapsed;
    utils.render();
  });
  utils.addEvent('js-view-list-item', 'click', function(e) {
    selectView(getClosestView(e.target));
  });
  utils.addEvent('js-view-list-item', 'mouseover', function(e) {
    var view = getClosestView(e.target).obj;
    var toHighlight = [[view.el, view.getDebugName()]];
    while (view.parentView) {
      view = view.parentView;
      toHighlight.unshift([view.el, view.getDebugName()]);
    }
    highlighter.highlight(toHighlight);
  });
  utils.addEvent('js-view-list-item', 'mouseout', function() {
    highlighter.unhighlight();
  });
  utils.addEvent('js-view-element', 'click', function() {
    logger.log(appData.selectedView.obj.el);
  });
  utils.addEvent('js-more-view-info', 'click', function(e) {
    var view = getClosestView(e.target).obj;
    logger.log(view);
  });
  utils.addEvent('js-view-event', 'click', function(e) {
    var selector = e.currentTarget.getAttribute('data-event-selector');
    var selected = _.findWhere(appData.selectedView.objectEvents, {selector: selector});
    var fn = selected.fn && selected.fn.original ? selected.fn.original : selected.fn;
    logger.log(selector, fn);
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
  utils.addEvent('js-add-new-event', 'blur', function(e) {
    var eventName = e.currentTarget.value;
    if (/^\s*$/.test(eventName)) {
      return;
    }
    var existing = _.findWhere(appData.selectedView.customEvents, {
      name: eventName
    });
    if (!existing) {
      var listener = utils.addListener(appData.selectedView.obj, eventName);
      appData.selectedView.customEvents.push({
        name: eventName,
        listener: listener
      });
    }
    utils.render();
  });
  utils.addEvent('js-add-new-event', 'keyup', function(e) {
    var which = (e.which || e.keyCode);
    if (which === 13) {
      e.currentTarget.blur();
    }
  });
  utils.addEvent('js-untrack-event', 'click', function(e) {
    var eventName = utils.closest(e.currentTarget, 'js-tracked-event').getAttribute('data-key');
    var events = appData.selectedView.customEvents;
    for (var i = 0; i < events.length; i++) {
      if (events[i].name === eventName) {
        utils.removeListener(appData.selectedView.obj, events[i].name, events[i].listener);
        events.splice(i, 1);
        break;
      }
    }
    utils.render();
  });
  utils.addEvent('js-time-travel-button-first', 'click', function() {
    appData.selectedView.getState().goFirst();
    utils.render();
  });
  utils.addEvent('js-time-travel-button-last', 'click', function() {
    appData.selectedView.getState().goLast();
    utils.render();
  });
  utils.addEvent('js-time-travel-button-prev', 'click', function() {
    appData.selectedView.getState().goBack();
    utils.render();
  });
  utils.addEvent('js-time-travel-button-next', 'click', function() {
    appData.selectedView.getState().goNext();
    utils.render();
  });
  utils.addEvent('js-time-travel-item', 'click', function(e) {
    var index = parseInt(e.currentTarget.getAttribute('data-index'));
    appData.selectedView.getState().goToIndex(index);
    utils.render();
  });
  utils.addEvent('js-time-travel-button-clear', 'click', function() {
    if (utils.confirm('Are you sure you want to clear history?')) {
      appData.selectedView.getState().clear();
      utils.render();
    }
  });
};
