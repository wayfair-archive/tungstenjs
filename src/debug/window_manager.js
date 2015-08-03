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
    launchDebugger();
  }
}

function gotoTab(tabName) {
  appData.tabs.selected = {};
  appData.tabs.selected[tabName] = true;
  _.each(appData.tabs.tabs, function(data) {
    data.isActive = data.activeTabName === tabName;
  });
  renderDebugPanel();
}

window.attachTungstenDebugPane = function(panel) {
  debugWindow = panel;
  if (debugWindow.activeTab) {
    gotoTab(debugWindow.activeTab);
  }
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
  tabs: {
    tabs: [
      {
        name: 'View',
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
  selectedView: null,
  views: {},
  models: []
};
window.appData = appData;

function selectElements(className) {
  if (debugWindow.document.querySelectorAll) {
    return debugWindow.document.querySelectorAll('.' + className);
  } else if (debugWindow.document.getElementsByClassName) {
    return debugWindow.document.getElementsByClassName(className);
  } else {
    var elements = debugWindow.document.getElementsByTagName('*');
    var pattern = new RegExp('(^|\\s)' + className + '(\\s|$)');
    var results = [];
    for (i = 0; i < elements.length; i++) {
      if ( pattern.test(elements[i].className) ) {
        results.push(elements[i]);
      }
    }
    return results;
  }
}

function addEventListener(elem, eventName, handler) {
  if (elem.addEventListener) {
    elem.addEventListener(eventName, handler);
  } else {
    elem.attachEvent('on' + eventName.toLowerCase(), handler);
  }
}

function addEvent(className, eventName, handler) {
  var elems = selectElements(className);
  if (elems && elems.length) {
    for (var i = 0; i < elems.length; i++) {
      addEventListener(elems[i], eventName, handler);
    }
  }
}

function hasClass(elem, className) {
  if (!elem) {
    return false;
  }
  if (elem.classList) {
    return elem.classList.contains(className);
  }
  var elemClass = (' ' + elem.className + ' ').replace(/\s*/g, '');
  return elemClass.indexOf(className) > -1;
}

function closest(elem, className) {
  var target = elem;
  while (target && !hasClass(target, className)) {
    target = target.parentNode;
  }
  return hasClass(target, className) ? target : null;
}

function getClosestView(elem) {
  var view = null;
  var wrapper = closest(elem, 'js-view-list-item');
  if (wrapper) {
    view = appData.views[wrapper.getAttribute('data-id')];
  }
  return view;
}

function getClosestModel(elem) {
  var model = null;
  var wrapper = closest(elem, 'js-model-list-item');
  if (wrapper) {
    model = appData.models[wrapper.getAttribute('data-id')];
  }
  return model;
}

var debugTagRegex = /<span class="js-view-list-item .*?" data-id=".*?">(.*?)<\/span>/g;
function removeDebugTags(templateStr) {
  var cleanVdom = templateStr.replace(debugTagRegex, function(fullMatch, debugName) {
    return debugName;
  });
  return cleanVdom;
}

function updateSelectedView() {
  var vdomTemplate = appData.selectedView.getVdomTemplate();
  var elTemplate = appData.selectedView.getElTemplate();
  if (elTemplate === 'View is detached from the page DOM') {
    appData.selectedView.templateDiff = elTemplate;
  } else {
    appData.selectedView.templateDiff = textDiff(removeDebugTags(elTemplate), removeDebugTags(vdomTemplate));
  }
  appData.selectedView.vdomTemplate = vdomTemplate;
  appData.selectedView.elTemplate = elTemplate;
  renderDebugPanel();
}

function updateSelectedModel() {
  if (typeof appData.selectedModel.getPropertiesArray === 'function') {
    appData.selectedModel.modelProperties = appData.selectedModel.getPropertiesArray();
  }
  renderDebugPanel();
}

function renderDebugPanel() {
  if (debugWindow) {
    var debugDoc = debugWindow.document;
    debugDoc.body.innerHTML = templates.panel.render(appData, templates);
    addEvent('js-tab', 'click', function(e) {
      var tabName = e.currentTarget.getAttribute('data-route');
      gotoTab(tabName);
    });
    /**
     * View panel events
     */
    addEvent('js-toggle-view-children', 'click', function(e) {
      e.stopPropagation();
      var view = getClosestView(e.target);
      view.collapsed = !view.collapsed;
      renderDebugPanel();
    });
    addEvent('js-view-list-item', 'click', function(e) {
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
    addEvent('js-view-list-item', 'mouseover', function(e) {
      var view = getClosestView(e.target);
      highlighter(view.el, view.getDebugName());
    });
    addEvent('js-view-list-item', 'mouseout', function() {
      highlighter(null);
    });
    addEvent('js-view-element', 'click', function() {
      console.log(appData.selectedView.el);
    });
    addEvent('js-view-event', 'click', function(e) {
      var selector = e.currentTarget.getAttribute('data-event-selector');
      console.log(selector, appData.selectedView.getEventFunction(selector));
    });
    addEvent('js-model-tab', 'click', function() {
      gotoTab('showModelTab');
    });
    /**
     * Model panel events
     */
    addEvent('js-toggle-model-children', 'click', function(e) {
      e.stopPropagation();
      var view = getClosestModel(e.target);
      view.collapsed = !view.collapsed;
      renderDebugPanel();
    });
    addEvent('js-model-list-item', 'click', function(e) {
      if (appData.selectedModel) {
        appData.selectedModel.off('rendered', renderDebugPanel);
      }
      appData.selectedModel = getClosestModel(e.target);
      appData.selectedModel.on('all', _.debounce(updateSelectedModel, 100));
      var cids = _.keys(appData.models);
      for (var i = 0; i < cids.length; i++) {
        appData.models[cids[i]].selected = appData.models[cids[i]] === appData.selectedModel;
      }
      updateSelectedModel();
    });
  }
}

window.renderDebugPanel = renderDebugPanel;

var eventBus = require('./event_bus');
eventBus.on(eventBus.ALL, _.debounce(renderDebugPanel, 50));
eventBus.on(eventBus.CHANGED_REGISTERED, function(nestedRegistry, flatRegistry) {
  appData.activeViews = _.values(nestedRegistry.views);
  appData.views = flatRegistry.views;
  _.each(appData.views, function(view) {
    view.selected = view.selected || false;
  });

  appData.activeModels = nestedRegistry.models;
  appData.models = flatRegistry.models;
});

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

    addEventListener(button, 'click', function() {
      launchDebugger();
    });

    addEventListener(overlay, 'click', function() {
      document.body.removeChild(overlay);
    });
  }
};

console.info('Tungsten Debugger is enabled. Run "launchDebugger()" to enable');

/**
 * When the parent window unloads, the debug window polls to reattach
 * Will auto-close if the parent window hasn't reappeared after 30s
 */
function pollForParentOpen() {
  /* jshint validthis:true */
  if (this.pollNum > 0) {
    if (this.opener && typeof this.opener.attachTungstenDebugPane === 'function') {
      this.opener.attachTungstenDebugPane(this);
    } else {
      this.pollNum -= 1;
      this.loadingCounter.textContent = '' + this.pollNum;
      this.setTimeout(pollForParentOpen, 1000);
    }
  } else {
    this.window.close();
  }
}

// Close debug window on the window closing
window.onbeforeunload = function() {
  if (debugWindow) {
    debugWindow.activeTab = _.keys(appData.tabs.selected)[0];
    debugWindow.pollNum = appData.loading = 30;
    renderDebugPanel();
    debugWindow.loadingCounter = debugWindow.document.getElementById('loading_message_count');
    debugWindow.setTimeout(pollForParentOpen, 1000);
  }
};