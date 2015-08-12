'use strict';

var appData = require('./app_data');
var utils = require('./utils');

module.exports = function() {
  utils.addEvent('js-tab', 'click', function(e) {
    var tabName = e.currentTarget.getAttribute('data-route');
    utils.gotoTab(tabName);
  });
  utils.addEvent('js-sidebar-pane-title', 'click', function(e) {
    // Bail if a child element was clicked
    if (e.currentTarget === e.target) {
      var paneId = e.currentTarget.getAttribute('data-id');
      appData.hiddenPanels[paneId] = !appData.hiddenPanels[paneId];
      utils.render();
    }
  });
};
