'use strict';

var tungsten = require('../tungsten');
// var virtualHyperscript = require('../vdom/virtual_hyperscript');
var processProperties = require('./process_properties');
var HTMLCommentWidget = require('./widgets/html_comment');

// IE8 and back don't create whitespace-only nodes from the DOM
// This sets a flag so that templates don't create them either
var whitespaceOnlyRegex = /^\s*$/;
var supportsWhitespaceTextNodes = (function() {
  var d = document.createElement('div');
  d.innerHTML = ' ';
  return d.childNodes.length === 1;
})();

function ToVdom(attributesOnly, debugMode) {
  this.attributesOnly = attributesOnly;
  this.debugMode = debugMode;
  this.result = [];
  this.stack = [];
}

ToVdom.prototype.openElement = function(tagName, properties) {
  this.stack.push({
    tagName: tagName,
    properties: processProperties(properties, this.attributesOnly),
    children: [],
    type: 'tempNode'
  });
};

/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
ToVdom.prototype.closeElem = function(obj) {
  // if this is an element, create a VNode now so that count is set properly
  if (obj.type === 'tempNode') {
    if (!supportsWhitespaceTextNodes) {
      var children = [];
      for (var i = 0; i < obj.children.length; i++) {
        if (typeof obj.children[i] !== 'string') {
          children.push(obj.children[i]);
        } else if (!whitespaceOnlyRegex.test(obj.children[i])) {
          children.push(obj.children[i]);
        }
      }
      obj.children = children;
    }

    // If the only child is an empty string, set no children
    if (obj.children.length === 1 && obj.children[0] === '') {
      obj.children.length = 0;
    }
    obj = tungsten.createVNode(obj.tagName, obj.properties, obj.children);
  }

  var pushingTo;
  if (this.stack.length > 0) {
    pushingTo = this.stack[this.stack.length - 1].children;
  } else {
    pushingTo = this.result;
  }

  // Combine adjacent strings
  if (typeof obj === 'string' && typeof pushingTo[pushingTo.length - 1] === 'string') {
    pushingTo[pushingTo.length - 1] += obj;
  } else {
    pushingTo.push(obj);
  }
};

ToVdom.prototype.createObject = function(obj) {
  this.closeElem(obj);
};

ToVdom.prototype.createComment = function(text) {
  this.closeElem(new HTMLCommentWidget(text));
};

ToVdom.prototype.closeElement = function() {
  this.closeElem(this.stack.pop());
};

ToVdom.prototype.getOutput = function()  {
  return this.result.length === 1 ? this.result[0] : this.result;
};

ToVdom.prototype.clear = function()  {
  this.result = [];
  this.stack = [];
};

/* develblock:start */
ToVdom.prototype.startContextChange = function(label, isLoop) {
  if (this.debugMode) {
    var className = 'debug_context';
    if (isLoop) {
      className += ' debug_context_loop';
    }
    this.stack.push({
      tagName: 'div',
      properties: processProperties({'class': className}),
      label: label,
      children: [],
      debugContext: true
    });
  }
};

ToVdom.prototype.endContextChange = function() {
  if (this.debugMode) {
    this.closeElem(this.stack.pop());
  }
};
/* develblock:end */

module.exports = ToVdom;