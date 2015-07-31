'use strict';

var _ = require('underscore');

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
  activeViews: function() {
    return _.values(appData.views);
  },
  views: {}
};

function addEvent(elems, eventName, handler) {
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
    addEvent(debugDoc.querySelectorAll('.js-toggle-children'), 'click', function(e) {
      var view = getClosestView(e.target);
      view.collapsed = !view.collapsed;
      renderDebugPanel();
    });
    addEvent(debugDoc.querySelectorAll('.js-toggle-children'), 'click', function(e) {
      var view = getClosestView(e.target);
      view.collapsed = !view.collapsed;
      renderDebugPanel();
    });
  }
}

var eventBus = require('./event_bus');
eventBus.on(eventBus.CHANGED_REGISTERED, function(views) {
  appData.views = views;
  renderDebugPanel();
});

var debugWrapper;
window.launchDebugger = function() {
  // If the window isn't open attempt to open it
  // If launch is successful this function will be re-invoked
  if (!debugWindow) {
    getWindow();
    return;
  }

  renderDebugPanel();
};

function getExpandable(name) {
  var details = document.createElement('details');
  var summary = document.createElement('summary');
  summary.innerHTML = name;
  details.appendChild(summary);
  return details;
}

var debugPanel = {};
function getDebugPanel(view) {
  var debugName = view.getDebugName();
  var wrapper = debugWrapper;
  if (view.parentView) {
    wrapper = getDebugPanel(view.parentView);
    wrapper = wrapper.getElementsByClassName('child-container')[0];
  }
  if (debugPanel[debugName] == null) {
    var details = getExpandable(debugName);

    var templateWrapper = getExpandable('Template validation');
    var templateDiff = document.createElement('pre');
    templateDiff.className = 'template';
    templateDiff.appendChild(document.createElement('code'));
    templateWrapper.appendChild(templateDiff);

    var childContainer = document.createElement('div');
    childContainer.className = 'child-container';

    details.appendChild(templateWrapper);
    details.appendChild(childContainer);
    wrapper.appendChild(details);

    debugPanel[debugName] = details;
  }

  return debugPanel[debugName];
}

var diffText = require('./text_diff');
exports.validateVdom = function(view, expected, actual) {
  var output = getDebugPanel(view);
  output.style.display = 'none';
  var diff = diffText(expected.toLowerCase(), actual.toLowerCase());
  output.getElementsByTagName('code')[0].innerHTML = diff;
  output.style.display = '';
};

exports.removeDebugPanel = function(view) {
  var debugName = view.getDebugName();
  var panel = debugPanel[debugName];
  if (panel) {
    panel.parentNode.removeChild(panel);
    debugPanel[debugName] = null;
  }
};

getWindow();