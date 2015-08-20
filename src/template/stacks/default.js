'use strict';

var processProperties = require('../process_properties');

// IE8 and back don't create whitespace-only nodes from the DOM
// This sets a flag so that templates don't create them either
var whitespaceOnlyRegex = /^\s*$/;
var supportsWhitespaceTextNodes = (function() {
  var d = document.createElement('div');
  d.innerHTML = ' ';
  return d.childNodes.length === 1;
})();

function DefaultStack(attributesOnly, debugMode) {
  this.propertyOpts = {
    attributesOnly: attributesOnly,
    skipHooks: true
  };
  this.debugMode = debugMode;
  this.result = [];
  this.stack = [];
}

DefaultStack.prototype.openElement = function(tagName, properties) {
  this.stack.push({
    tagName: tagName,
    properties: processProperties(properties, this.propertyOpts),
    children: [],
    type: 'node'
  });
};

DefaultStack.prototype.processObject = function(obj) {
  return obj;
};

DefaultStack.prototype.validStackAddition = function(node) {
  return true;
};

/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
DefaultStack.prototype._closeElem = function(obj) {
  var i;
  // if this is an element, create a VNode now so that count is set properly
  if (obj.type === 'node') {
    if (!supportsWhitespaceTextNodes) {
      var children = [];
      for (i = 0; i < obj.children.length; i++) {
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
    // Process child nodes
    for (i = obj.children.length; i--;) {
      obj.children[i] = this.processObject(obj.children[i]);
    }
  }

  while (this.stack.length > 0 && !this.validStackAddition(this.stack, obj)) {
    this.closeElement();
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

DefaultStack.prototype.createObject = function(obj, options) {
  this._closeElem(obj, options);
};

DefaultStack.prototype.createComment = function(text) {
  this._closeElem({
    type: 'comment',
    text: text
  });
};

DefaultStack.prototype.closeElement = function() {
  this._closeElem(this.stack.pop());
};

DefaultStack.prototype.getOutput = function() {
  for (var i = this.result.length; i--;) {
    this.result[i] = this.processObject(this.result[i]);
  }
  return this.result.length === 1 ? this.result[0] : this.result;
};

DefaultStack.prototype.clear = function() {
  this.result = [];
  this.stack = [];
};

/* develblock:start */
DefaultStack.prototype.startContextChange = function(label, isLoop) {
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

DefaultStack.prototype.endContextChange = function() {
  if (this.debugMode) {
    this.closeElem(this.stack.pop());
  }
};
/* develblock:end */

module.exports = DefaultStack;