/* eslint-env browser */

/**
 * Hook for Virtual-Dom library to prevent setting unsupported input types in IE
 *
 * @author Artem Ruts <aruts@wayfair.com>
 * @copyright 2016 Wayfair LLC - All rights reserved
 */

'use strict';

// possible input types according to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
const possibleTypes = ['button', 'checkbox', 'color', 'date', 'datetime',
  'datetime-local', 'email', 'file', 'hidden', 'image', 'month', 'number',
  'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text',
  'time', 'url', 'week'];

// test for supported input types
let input = document.createElement('input');
const allowedTypes = possibleTypes.filter(function(type) {
  try {
    input.type = type;
    return true;
  } catch (ex) {
    return false;
  }
});

function InputTypeHook(newType) {
  if (!(this instanceof InputTypeHook)) {
    return new InputTypeHook(newType);
  } else {
    this.newType = newType;
  }
}

InputTypeHook.prototype.hook = function(node, prop) {
  // don't do anything if type didn't change
  if (node.type === this.newType) {
    return;
  }

  const TAG_NAME = 'INPUT';
  // if input type is not supported - fallback to type "text"
  if (node.tagName === TAG_NAME ||
      node.nodeName === TAG_NAME ||
      node.constructor.name === 'HTMLInputElement') {
    if (allowedTypes.indexOf(this.newType) === -1) {
      this.newType = 'text';
    }
  }

  node[prop] = this.newType;
};

InputTypeHook.prototype.type = 'InputTypeHook';
module.exports = InputTypeHook;
