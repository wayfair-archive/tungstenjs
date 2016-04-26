'use strict';

var TungstenBackboneBase = require('tungstenjs');
var ComponentWidget = TungstenBackboneBase.ComponentWidget;

var Model = require('../modal/model');
var View = require('../modal/view');
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

