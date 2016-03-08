/**
 * Module to handle the default pattern for events that aren't handled by any other plugin
 */
'use strict';

var document = require('global/document');
var eventsCore = require('../events_core');

module.exports = function(el, eventName, selector, method) {
  eventsCore.bindEventType(document, eventName);

  // Add the event and return arguments to call unbind with
  return eventsCore.addEvent(el, eventName, selector, method);
};
