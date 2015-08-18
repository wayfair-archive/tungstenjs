'use strict';

var _ = require('underscore');
var utils = require('./panel_js/utils');
var appData = require('./panel_js/app_data');
var logger = require('../utils/logger');
var highlighter = require('./highlighter');

var isNode = require('./is_node');

var debugWindow;

function closePanel() {
  debugWindow = null;
  highlighter.unhighlight();
  utils.setDebugWindow(null);
}

function getWindow() {
  // Launch panel
  debugWindow = window.open('', 'TungstenDebugger', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,width=800,height=640');
  if (!debugWindow) {
    logger.error('Unable to launch debug panel. You may need to allow the popup or run "window.launchDebugger()" from your console');
  } else {
    debugWindow.title = 'Tungsten Debugger';
    debugWindow.onunload = closePanel;
    launchDebugger();
  }
}

window.attachTungstenDebugPane = function(panel) {
  debugWindow = panel;
  utils.setDebugWindow(debugWindow);
  if (debugWindow.activeTab) {
    utils.gotoTab(debugWindow.activeTab);
  }
  debugWindow.onunload = closePanel;
  launchDebugger();
};

function launchDebugger() {
  // If the window isn't open attempt to open it
  // If launch is successful this function will be re-invoked
  if (!debugWindow) {
    getWindow();
    return;
  }

  renderDebugPanel();
}
var templates = {};
if (!isNode) {
  var ctx = require.context('!!tungsten_debug?template!./panel', true, /\.template$/);
  var files = ctx.keys();
  for (var i = 0; i < files.length; i++) {
    var templateName = files[i];
    templateName = templateName.replace('./', '');
    templateName = templateName.replace('.template', '');

    templates[templateName] = ctx(files[i]);
  }
}
appData.partials = templates;

function renderDebugPanel() {
  if (debugWindow) {
    var debugDoc = debugWindow.document;
    // Save scroll positions for post-render
    var toolPanelScrolls = _.map(utils.selectElements('tool-panel'), function(el) {
      return el.scrollTop;
    });
    debugWindow.render = renderDebugPanel;
    utils.setDebugWindow(debugWindow);
    try {
      debugDoc.body.innerHTML = templates.panel(appData);
    } catch (ex) {
      logger.log(ex);
    }
    // Reset scroll positions
    var toolPanels = utils.selectElements('tool-panel');
    for (var i = 0; i < toolPanelScrolls.length; i++) {
      toolPanels[i].scrollTop = toolPanelScrolls[i];
    }

    require('./panel_js/panel_events')();

    for (i = 0; i < appData.tabs.tabs.length; i++) {
      var tab = appData.tabs.tabs[i];
      if (tab.isActive) {
        if (typeof tab.events === 'function') {
          tab.events();
        }
        break;
      }
    }

  }
}

window.renderDebugPanel = renderDebugPanel;

var eventBus = require('./event_bus');
// Any events coming through the event bus should re-render the panel
eventBus.on(eventBus.ALL, _.debounce(renderDebugPanel, 50));
// Update the list of registered objects when prompted
eventBus.on(eventBus.CHANGED_REGISTERED, function(nestedRegistry, flatRegistry) {
  appData.activeViews = _.values(nestedRegistry.views);
  appData.views = flatRegistry.views;

  appData.activeModels = nestedRegistry.models;
  appData.models = flatRegistry.models;
});

// Expose method that can be called from a user event handler
window._launchDebuggerFromEvent = launchDebugger;

// Generic method adds a styled button/overlay to load the debug window
window.launchDebugger = function() {
  if (debugWindow) {
    debugWindow.focus();
    renderDebugPanel();
  } else {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(203, 159, 210, 0.48)';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.zIndex = '999999999';

    var button = document.createElement('button');
    button.style.padding = '6px 10px';
    button.style.cursor = 'pointer';
    button.style.borderRadius = '3px';
    button.style.boxShadow = 'rgba(255, 255, 255, 0.2) 4px 3px 1px inset, rgba(0, 0, 0, 0.4) 2px 2px 3px';
    button.style.fontWeight = 'bold';
    button.style.fontSize = '42px';
    button.style.color = '#FFF';
    button.style.textShadow = '0 -1px 0px #000';
    button.style.background = '#995CA3';
    button.style.position = 'absolute';
    button.style.left = '25%';
    button.style.top = '30%';
    button.style.width = '50%';
    button.style.height = '40%';

    var buttonText = document.createTextNode('Open Tungsten Debugger');
    button.appendChild(buttonText);
    overlay.appendChild(button);
    document.body.appendChild(overlay);

    utils.addEventListener(button, 'click', function() {
      launchDebugger();
    });

    utils.addEventListener(overlay, 'click', function() {
      document.body.removeChild(overlay);
    });
  }
};

logger.info('Tungsten Debugger is enabled. Run "launchDebugger()" to enable.\nA button will need to be clicked to satisfy the user input requirement for window.open.');

var MAX_POLLS = 60;
var POLL_INTERVAL = 1000;
/**
 * When the parent window unloads, the debug window polls to reattach
 * Will auto-close if the parent window hasn't reappeared after 30s
 */
function pollForParentOpen() {
  /* jshint validthis:true */
  if (this.pollNum > 0) {
    if (this.opener && !this.opener.OLD_TUNGSTEN_MASTER && typeof this.opener.attachTungstenDebugPane === 'function') {
      this.opener.attachTungstenDebugPane(this);
    } else {
      this.pollNum -= 1;
      this.loadingCounter.textContent = '' + this.pollNum;
      this.setTimeout(pollForParentOpen, POLL_INTERVAL);
    }
  } else {
    this.window.close();
  }
}

// Close debug window on the window closing
utils.addEventListener(window, 'beforeunload', function() {
  if (debugWindow) {
    debugWindow.activeTab = _.keys(appData.tabs.selected)[0];
    debugWindow.pollNum = appData.loading = MAX_POLLS;
    renderDebugPanel();
    debugWindow.loadingCounter = debugWindow.document.getElementById('loading_message_count');
    // Set variable to avoid reattaching to not-yet reloading window
    window.OLD_TUNGSTEN_MASTER = true;
    debugWindow.setTimeout(pollForParentOpen, POLL_INTERVAL);
  }
});
