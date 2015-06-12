/**
 * Backbone.js Adaptor for Tungsten.js
 *
 * Copyright 2015 Wayfair, LLC
 * Available under the Apache Version 2.0 License
 *
 * https://github.com/wayfair/tungstenjs
 *
 * @author Matt DeGennaro <mdegennaro@wayfair.com>
 * @license Apache-2.0
 */
'use strict';

// Require context adaptor to set functions
var _ = require('underscore');
var Context = require('../../src/template/template_context');
var BackboneAdaptor = require('./context_adaptor');
Context.setAdapterFunctions(BackboneAdaptor);

var Reflux = require('reflux');
var Backbone = require('backbone');

Reflux.setEventEmitter(function() {
  var eventEmitter = _.extend({}, Backbone.Events);
  eventEmitter.addListener = eventEmitter.on;
  eventEmitter.emit = eventEmitter.trigger;
  return eventEmitter;
});

module.exports = {
  Reflux: Reflux,
  View: require('./base_view'),
  Backbone: Backbone
};
