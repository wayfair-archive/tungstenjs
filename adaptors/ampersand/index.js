/**
 * Ampersand Views/Models/Collections Adaptor for Tungsten.js
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
var Context = require('../../src/template/template_context');
var AmpersandAdaptor = require('./context_adaptor');
Context.setAdapterFunctions(AmpersandAdaptor);

module.exports = {
  Collection: require('./base_collection'),
  Model: require('./base_model'),
  View: require('./base_view'),
  ViewWidget: require('./ampersand_view_widget'),
  Ampersand: {
    Collection: require('ampersand-collection'),
    Model: require('ampersand-model'),
    View: require('ampersand-view')
  },
  _core: require('../../src/tungsten.js'),
  _template: require('../../precompile/tungsten_template/template_helper')
};
