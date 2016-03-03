'use strict';
const document = require('global/document');
const window = require('global/window');
const _ = require('underscore');
const utils = require('./utils');
const appData = require('./app_data');
const highlighter = require('../highlighter');
const logger = require('../../utils/logger');
const dataset = require('data-set');
const Context = require('../../template/template_context');
const templateAdaptor = require('../../template/adaptor');
const DebugValueStack = require('../../template/stacks/debug_value');

const getClosestView = appData.getClosestView = function(elem) {
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
    appData.scrollFlag = true;
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

  function getPanelOutput(mustacheElement, indicies = {}) {
    var data = JSON.parse(decodeURIComponent(mustacheElement.getAttribute('data-value')));
    var html = '<table>';
    var ctx = new Context(appData.selectedView.obj.serialize());
    var stack = new DebugValueStack();
    var tmpl = null;
    var tmplCtx = tmpl;
    var name = [];
    for (var i = 0; i < data.length; i++) {
      stack.clear();
      if (!tmpl) {
        tmpl = data[i].context;
        tmplCtx = tmpl;
        templateAdaptor.render(stack, data[i].value, ctx, {});
      } else {
        tmplCtx.f = data[i].value;
        templateAdaptor.render(stack, tmpl, ctx, {});
      }
      var value = stack.getOutput();
      name.push(data[i].name);

      var isArray = Context.isArray(value);
      var outputName = name.join(':');
      if (name[name.length - 1] === '!w/lastModelForDebugger') {
        outputName = 'Model&nbsp;for&nbsp;ChildView';
      }
      html += '<tr><td>' + outputName + '</td><td>' + String(value) + '</td></tr>';

      if (isArray) {
        if (!indicies[i]) {
          indicies[i] = 0;
        }
        data[i].context.r += '.' + indicies[i];
        name[i] += '.<span class="u-underlined u-clickable js-range" data-index="' + i + '" data-max="' + value.length + '">' + indicies[i] + '</span>';
      }
      if (tmplCtx.f) {
        tmplCtx.f = data[i].context;
        tmplCtx = tmplCtx.f;
      }
    }
    html += '</table>';
    return {html, indicies};
  }
  utils.addEvent('js-mustache', 'click', function(e) {
    if (!utils.hasClass(e.target, 'js-mustache')) {
      return;
    }
    var existingPane = utils.selectElements('js-mustache-data', e.currentTarget)[0];
    if (existingPane) {
      existingPane.parentNode.removeChild(existingPane);
    } else {
      var panes = utils.selectElements('js-mustache-data');
      for (var i = 0; i < panes.length; i++) {
        panes[i].parentNode.removeChild(panes[i]);
      }
      var pane = document.createElement('div');
      pane.className = 'MustacheData js-mustache-data';
      var output = getPanelOutput(e.currentTarget);
      var indicies = output.indicies;
      pane.setAttribute('data-indicies', JSON.stringify(indicies));
      pane.innerHTML = output.html;
      e.currentTarget.appendChild(pane);
    }
  });
  utils.addEvent('js-mustache', 'click', function (e) {
    if (!utils.hasClass(e.target, 'js-range')) {
      return;
    }
    var pane = utils.selectElements('js-mustache-data', e.currentTarget)[0];
    var indicies = JSON.parse(pane.getAttribute('data-indicies'));
    var index = parseInt(e.target.getAttribute('data-index'), 10);
    var value = parseInt(e.target.textContent, 10);
    var max = parseInt(e.target.getAttribute('data-max'), 10);
    indicies[index] = (value + 10) % max;
    var output = getPanelOutput(e.currentTarget, indicies);
    pane.setAttribute('data-indicies', JSON.stringify(indicies));
    pane.innerHTML = output.html;
  });
};
