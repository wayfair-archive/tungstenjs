'use strict';

var processProperties = require('../process_properties');
var htmlHelpers = require('../html_helpers');
var logger = require('../../utils/logger');

// IE8 and back don't create whitespace-only nodes from the DOM
// This sets a flag so that templates don't create them either
var whitespaceOnlyRegex = /^\s*$/;
var supportsWhitespaceTextNodes = (function() {
  var d = document.createElement('div');
  d.innerHTML = ' ';
  return d.childNodes.length === 1;
})();

/**
 * [DefaultStack description]
 *
 * @param {Boolean} attributesOnly Render all properties as attributes
 * @param {String}  startID        Base ID for elements, for nested views
 * @param {Boolean} debugMode      Flag for extra debugging
 */
function DefaultStack(attributesOnly, startID, debugMode) {
  this.propertyOpts = {
    attributesOnly: attributesOnly,
    useHooks: false
  };
  // If startID is passed in, append a separator
  this.startID = typeof startID === 'string' ? (startID + '.') : '';
  this.debugMode = debugMode;
  this.result = [];
  this.stack = [];
}

DefaultStack.prototype.peek = function() {
  return this.stack[this.stack.length - 1];
};

DefaultStack.prototype.getID = function() {
  var id;
  if (this.stack.length) {
    var openElem = this.peek();
    id = openElem.id + '.' + openElem.children.length;
  } else {
    id = this.startID + this.result.length;
  }
  return id;
};


DefaultStack.prototype.openElement = function(tagName, attributes) {
  var id = this.getID();
  var properties = processProperties(attributes, this.propertyOpts);
  this.stack.push({
    tagName: tagName,
    properties: properties,
    children: [],
    type: 'node',
    id: id
  });

  return id;
};

DefaultStack.prototype.processObject = function(obj) {
  return obj;
};

DefaultStack.prototype.validateStackAddition = function(node) {
  var openElem = this.peek();
  while (openElem && htmlHelpers.validation.impliedCloseTag(openElem.tagName, node.tagName)) {
    this.closeElement();
  }
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

  if (this.stack.length > 0) {
    this.validateStackAddition(this.stack, obj);
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
  if (obj && obj.type === 'Widget') {
    obj.id = this.getID();
  }
  this._closeElem(obj, options);
};

DefaultStack.prototype.createComment = function(text) {
  this._closeElem({
    type: 'comment',
    text: text
  });
};

DefaultStack.prototype.closeElement = function(id, tagName) {
  var openElem = this.peek();
  if (openElem) {
    var openID = openElem.id;
    if (openID !== id) {
      logger.warn(tagName + ' tags improperly paired, closing ' + openID + ' with close tag from ' + id);
        openElem = this.stack.pop();
      while (openElem && openElem.tagName !== tagName) {
        this._closeElem(openElem);
        openElem = this.stack.pop();
      }
    } else {
      // If they match, everything lines up
      this._closeElem(this.stack.pop());
    }
  } else {
    // Something has gone terribly wrong
    logger.warn('Closing element ' + id + ' when the stack was empty');
  }
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