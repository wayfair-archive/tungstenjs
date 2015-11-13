/**
 * Module to serialize data on form submission
 */
'use strict';
var serialize = require('form-serialize');
var _ = require('underscore');

var EVENT_NAME = 'submit-data';
var SUBMIT_SELECTOR = 'js-submit';

function getHandlers(method) {
  var submit;

  var submitHandler = function(evt) {
    var form = evt.target;
    var data = serialize(form, { hash: true, empty: true });
    method(evt, _.extend(data, submit));
  };

  var submitClickHandler = function(evt) {
    submit = {
      submit: evt.target.name
    };
  };

  return {
    click: submitClickHandler,
    submit: submitHandler
  };
}

module.exports = function(el, eventName, selector, method, options, bindVirtualEvent) {
  if (eventName === EVENT_NAME) {
    var handlers = getHandlers(method);
    return [
      bindVirtualEvent(el, 'click', SUBMIT_SELECTOR, handlers.click, options),
      bindVirtualEvent(el, 'submit', selector, handlers.submit, options)
    ];
  }
};
