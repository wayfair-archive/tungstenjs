'use strict';

var _ = require('underscore');
var highlighter = require('./highlighter');
var textDiff = require('./text_diff');

var debugWindow;

function getWindow() {
  // Launch panel
  debugWindow = window.open('', 'TungstenDebugger', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,width=800,height=640');
  if (!debugWindow) {
    console.error('Unable to launch debug panel. You may need to allow the popup or run "window.launchDebugger()" from your console');
  } else {
    debugWindow.title = 'Tungsten Debugger';
    debugWindow.onunload = function() {
      debugWindow = null;
    };
    window.launchDebugger();
  }
}

var ctx = require.context('./panel', true, /\.html$/);
var files = ctx.keys();
var templates = {};
for (var i = 0; i < files.length; i++) {
  var templateName = files[i];
  templateName = templateName.replace('./', '');
  templateName = templateName.replace('.html', '');

  templates[templateName] = ctx(files[i]);
}

var appData = {
  styles: require('./panel/style.css'),
  tabs: [
    {
      name: 'View',
      isActive: true,
      activeTabName: 'showViewTab',
      showViewTab: true
    }
  ],
  activeViews: [],
  selectedView: null,
  views: {}
};
window.appData = appData;

function addEvent(query, eventName, handler) {
  var elems = (typeof query === 'string' ? debugWindow.document.querySelectorAll(query) : query);
  if (elems instanceof debugWindow.Element) {
    elems.addEventListener(eventName, handler);
  } else if (elems.length) {
    for (var i = 0; i< elems.length; i++) {
      addEvent(elems[i], eventName, handler);
    }
  }
}

function closest(elem, className) {
  var target = elem;
  while (target && !target.classList.contains(className)) {
    target = target.parentNode;
  }
  return target.classList.contains(className) ? target : null;
}

function getClosestView(elem) {
  var view = null;
  var wrapper = closest(elem, 'js-tree-list-item');
  if (wrapper) {
    view = appData.views[wrapper.getAttribute('data-id')];
  }
  return view;
}

function renderDebugPanel() {
  if (debugWindow) {
    var debugDoc = debugWindow.document;
    debugDoc.body.innerHTML = templates.panel.render(appData, templates);
    addEvent('.js-toggle-children', 'click', function(e) {
      e.stopPropagation();
      var view = getClosestView(e.target);
      view.collapsed = !view.collapsed;
      renderDebugPanel();
    });
    addEvent('.js-tree-list-item', 'click', function(e) {
      if (appData.selectedView) {
        appData.selectedView.off('rendered', renderDebugPanel);
      }
      appData.selectedView = getClosestView(e.target);
      appData.selectedView.on('rendered', updateSelectedView);
      var cids = _.keys(appData.views);
      for (var i = 0; i < cids.length; i++) {
        appData.views[cids[i]].selected = appData.views[cids[i]] === appData.selectedView;
      }
      updateSelectedView();
    });
    addEvent('.js-tree-list-item', 'mouseover', function(e) {
      var view = getClosestView(e.target);
      highlighter(view.el, view.getDebugName());
    });
    addEvent('.js-tree-list-item', 'mouseout', function() {
      highlighter(null);
    });
    addEvent('.js-view-element', 'click', function() {
      console.log(appData.selectedView.el);
    });
    addEvent('.js-view-event', 'click', function(e) {
      var selector = e.currentTarget.getAttribute('data-event-selector');
      console.log(selector, appData.selectedView.getEventFunction(selector));
    });
  }
}

window.renderDebugPanel = renderDebugPanel;

var debugTagRegex = /<span class="js-tree-list-item .*?" data-id=".*?">(.*?)<\/span>/g;
function removeDebugTags(templateStr) {
  var cleanVdom = templateStr.replace(debugTagRegex, function(fullMatch, debugName) {
    return debugName;
  });
  return cleanVdom;
}

function updateSelectedView() {
  var vdomTemplate = appData.selectedView.getVdomTemplate();
  var elTemplate = appData.selectedView.getElTemplate();
  appData.selectedView.templateDiff = textDiff(removeDebugTags(vdomTemplate), removeDebugTags(elTemplate));
  appData.selectedView.vdomTemplate = vdomTemplate;
  appData.selectedView.elTemplate = elTemplate;
  renderDebugPanel();
}

var eventBus = require('./event_bus');
eventBus.on(eventBus.ALL, _.debounce(renderDebugPanel, 50));
eventBus.on(eventBus.CHANGED_REGISTERED, function(nestedViews, flatViews) {
  appData.activeViews = _.values(nestedViews);
  appData.views = flatViews;
  _.each(appData.views, function(view) {
    view.selected = view.selected || false;
  });
});

window.launchDebugger = function() {
  // If the window isn't open attempt to open it
  // If launch is successful this function will be re-invoked
  if (!debugWindow) {
    getWindow();
    return;
  }

  renderDebugPanel();
};

var diffText = require('./text_diff');
exports.validateVdom = function(view, expected, actual) {
  var diff = diffText(expected.toLowerCase(), actual.toLowerCase());
  eventBus.trigger(eventBus.UPDATED_DOM_DIFF, view, diff);
};

getWindow();