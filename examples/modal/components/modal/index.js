'use strict';

var TungstenBackboneBase = require('tungstenjs');
var ComponentWidget = TungstenBackboneBase.ComponentWidget;

var PortalWidget = require('../../../../src/template/widgets/portal');
TungstenBackboneBase.registerWidget('_portal', PortalWidget);

var Model = require('./model');
var View = require('./view');
var template = require('./template.mustache');

module.exports = function(data, options) {
  if (data && data.constructor === ComponentWidget) {
    return data;
  }
  return new ComponentWidget(View, new Model(data), template, options);
};

module.exports.prototype = {
  idAttribute: Model.prototype.idAttribute
};

