'use strict';

var _ = require('underscore');
var ComponentWidget = require('tungstenjs/adaptors/backbone').ComponentWidget;

var Model = require('./model');
var View = require('./view');
var template = require('./template.mustache');

module.exports = function(data, options) {
  if (data && data.constructor === ComponentWidget) {
    return data;
  }
  return new ComponentWidget(View, new Model(data), template, options);
};
