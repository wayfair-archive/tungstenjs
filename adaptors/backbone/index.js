/**
 * Backbone.js Adaptor for Tungsten.js
 *
 * Copyright 2016 Wayfair, LLC
 * Available under the Apache Version 2.0 License
 *
 * https://github.com/wayfair/tungstenjs
 *
 * @author Matt DeGennaro <mdegennaro@wayfair.com>
 * @license Apache-2.0
 */
'use strict';

// Require context adaptor to set functions
var Context = require('../../src/template/template_context');
var BackboneAdaptor = require('./context_adaptor');

Context.setAdapterFunctions(BackboneAdaptor);

var adaptor = {
  Collection: require('./base_collection'),
  Model: require('./base_model'),
  View: require('./base_view'),
  Backbone: require('backbone'),
  ViewWidget: require('./backbone_view_widget'),
  ComponentWidget: require('./component_widget')
};

var shared = require('../shared/common_exports');
for (var prop in shared) {
  adaptor[prop] = shared[prop];
}

module.exports = adaptor;
