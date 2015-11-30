'use strict';

var ComponentWidget = require('tungstenjs/adaptors/backbone').ComponentWidget;

var Model = require('./model');
var View = require('./view');
var template = require('./template.mustache');

module.exports = function(data) {
  if (data && data.constructor === ComponentWidget) {
    return data;
  }
  var id = _.uniqueId('w_subview');
  var model = new Model(data);
  return new ComponentWidget(View, model, template, id);
};
