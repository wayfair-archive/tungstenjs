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
var tungsten = require('../../src/tungsten.js');

Context.setAdapterFunctions(BackboneAdaptor);

module.exports = {
  Collection: require('./base_collection'),
  Model: require('./base_model'),
  View: require('./base_view'),
  ViewWidget: require('./backbone_view_widget'),
  Backbone: require('backbone'),
  _: require('underscore'),
  ComponentWidget: require('./component_widget'),
  Template: require('../../src/template/template.js'),
  addEventPlugin: tungsten.addEventPlugin,
  _core: tungsten,
  _template: require('../../precompile/tungsten_template/template_helper'),
  _Context: Context
};
