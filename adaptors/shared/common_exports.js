/**
 * Common exports for all adaptors
 * Should be defaulted on so that all adaptors share a common API
 *
 * Copyright 2016 Wayfair, LLC
 * Available under the Apache Version 2.0 License
 *
 * https://github.com/wayfair/tungstenjs
 *
 * @author Matt DeGennaro <mdegennaro@wayfair.com>
 * @license Apache-2.0
 */
var tungsten = require('../../src/tungsten.js');
var Context = require('../../src/template/template_context');
var Template = require('../../src/template/template');

module.exports = {
  _: require('underscore'),
  Template: Template,
  _core: tungsten,
  templateHelper: require('../../precompile/tungsten_template/template_helper'),
  precompiler: require('../../precompile/tungsten_template'),
  compiler: require('../../src/template/compiler'),
  _Context: Context,
  addEventPlugin: tungsten.addEventPlugin,
  registerLambda: Context.registerLambda,
  registerWidget: Template.registerWidget,
  renderQueue: require('./render_queue')
};
