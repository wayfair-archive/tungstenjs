'use strict';

var _ = require('underscore');
var utils = require('./utils');
var appData = require('./app_data');
var highlighter = require('../highlighter');
var logger = require('../../utils/logger');
var dataset = require('data-set');
var Context = require('../../template/template_context');
var ractiveAdaptor = require('../../template/ractive_adaptor');
var DebugValueStack = require('../../template/stacks/debug_value');

var getClosestView = appData.getClosestView = function(elem) {
  var view = null;
  var wrapper = utils.closest(elem, 'js-view-list-item');
  if (wrapper) {
    view = appData.views[wrapper.getAttribute('data-id')];
  }
  return view;
};

appData.updateSelectedView = function() {
  appData.selectedView.vdomTemplate = appData.selectedView.obj.getVdomTemplate();
  appData.selectedView.templateString = appData.selectedView.obj.getTemplateString();
  var diff = appData.selectedView.obj.getTemplateDiff();
  if (diff.indexOf('<ins>') + diff.indexOf('<del>') > -2) {
    appData.selectedView.templateDiff = diff;
  } else {
    appData.selectedView.templateDiff = 'No difference';
  }
  utils.render();
};

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
    appData.selectView(viewWrapper);
  }
});

window.findView = function() {
  var targets = _.map(appData.views, function(view) {
    return view.obj.el;
  });
  highlighter.indicateTargets(targets);
  highlighter.showOverlay();
};

var finding = false;
module.exports = function() {
  utils.addEvent('js-find-view', 'click', function(e) {
    e.stopPropagation();
    finding = !finding;
    if (finding) {
      window.findView();
    } else {
      highlighter.hideOverlay();
      highlighter.hideTargets();
    }
  });
  utils.addEvent('js-toggle-view-children', 'click', function(e) {
    e.stopPropagation();
    var view = getClosestView(e.target);
    view.collapsed = !view.collapsed;
    utils.render();
  });
  utils.addEvent('js-view-list-item', 'click', function(e) {
    appData.selectView(getClosestView(e.target));
  });
  utils.addEvent('js-view-list-item', 'mouseover', function(e) {
    var view = getClosestView(e.target).obj;
    var toHighlight = [
      [view.el, view.getDebugName()]
    ];
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
    var selected = _.findWhere(appData.selectedView.objectEvents, {
      selector: selector
    });
    var fn = selected.fn && selected.fn.original ? selected.fn.original : selected.fn;
    logger.log(selector, fn);
  });
  utils.addEvent('js-track-function', 'click', function(e) {
    var fnName = e.currentTarget.getAttribute('data-fn');
    var selectedFunction = _.findWhere(appData.selectedView.objectFunctions, {
      name: fnName
    });
    selectedFunction.tracked = !selectedFunction.tracked;
    appData.selectedView.toggleFunctionTracking(fnName, selectedFunction.tracked);
    utils.render();
  });
  utils.addEvent('js-show-inherited', 'change', function(e) {
    e.stopPropagation();
    appData.settings.showInheritedMethods = e.currentTarget.checked;
    utils.render();
  });
  utils.addEvent('js-model-tab', 'click', function(e) {
    appData.selectModel(appData.getClosestModel(e.target));
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
  utils.addEvent('js-mustache', 'click', function(e) {
    var ctx = new Context(appData.selectedView.obj.serialize());
    var stack = new DebugValueStack();
    var data = JSON.parse(decodeURIComponent(e.currentTarget.getAttribute('data-value')));
    var tmpl = data[0].context;
    ractiveAdaptor.render(stack, data[0].value, ctx, {});
    var name = data[0].value.r;
    console.log(name, stack.getOutput());
    for (var i = 1; i < data.length; i++) {
      stack.clear();
      data[i - 1].f = data[i].value;
      ractiveAdaptor.render(stack, tmpl, ctx, {});
      name += ':' + data[i].value.r;
      console.log(name, stack.getOutput());
      data[i - 1].f = data[i].context;
    }
  });
};
