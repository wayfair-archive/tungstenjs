'use strict';

var processProperties = require('../process_properties');
var logger = require('../../utils/logger');

// IE8 and back don't create whitespace-only nodes from the DOM
// This sets a flag so that templates don't create them either
var whitespaceOnlyRegex = /^\s*$/;
function doesSupportWhitespaceTextNodes() {
  // if document isn't defined, we're running in node. so use whitespace nodes
  if (typeof document === 'undefined') {
    return true;
  }
  var d = document.createElement('div');
  d.innerHTML = ' ';
  return d.childNodes.length === 1;
}
var supportsWhitespaceTextNodes = doesSupportWhitespaceTextNodes();

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

DefaultStack.prototype.stringify = function(val) {
  return val.toString();
};

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
  var properties = processProperties(attributes, this.propertyOpts);

  var elem = {
    tagName: tagName,
    properties: properties,
    children: [],
    type: 'node',
    id: this.getID()
  };
  this.stack.push(elem);

  return elem;
};

DefaultStack.prototype.processObject = function(obj) {
  return obj;
};

/* global TUNGSTENJS_IS_TEST */
var TEST_MODE = typeof TUNGSTENJS_IS_TEST !== 'undefined' && TUNGSTENJS_IS_TEST;


/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
DefaultStack.prototype._closeElem = function(obj) {
  var i;
  // if this is an element, create a VNode now so that count is set properly
  if (obj.type === 'node') {
    if (!(TEST_MODE ? module.exports.supportsWhitespaceTextNodes : supportsWhitespaceTextNodes)) {
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
  }

  if (obj.children && obj.children.length) {
    // Process child nodes
    for (i = obj.children.length; i--;) {
      obj.children[i] = this.processObject(obj.children[i]);
    }
  }

  var pushingTo;
  if (this.stack.length > 0) {
    pushingTo = this.stack[this.stack.length - 1].children;
  } else {
    // If pushing to result, it isn't the child of any element and should be processed
    obj = this.processObject(obj);
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

DefaultStack.prototype.closeElement = function(closingElem) {
  var openElem = this.peek();
  var id = closingElem.id;
  var tagName = closingElem.tagName;
  if (openElem) {
    var openID = openElem.id;
    if (openID !== id) {
      logger.warn(tagName + ' tags improperly paired, closing ' + openID + ' with close tag from ' + id);
      do {
        openElem = this.stack.pop();
        this._closeElem(openElem);
        // close tags until we find one with the same tagName
      } while (openElem && openElem.tagName !== tagName);
    } else {
      // If they match, everything lines up
      this._closeElem(this.stack.pop());
    }
  } else if (tagName === 'p') {
    // For some reason a </p> creates an empty tag
    this.closeElement(this.openElement('p', {}));
  } else {
    // Something has gone terribly wrong
    logger.warn('Closing element ' + id + ' when the stack was empty');
  }
};

/**
 * Postprocessing for an array result
 * This allows stacks to create DocumentFragments or join the array to create the expected output type
 * @param  {Array<Any>} output Array of result objects
 * @return {Any}               Processed result
 */
DefaultStack.prototype.processArrayOutput = function(output) {
  return output;
};

DefaultStack.prototype.getOutput = function() {
  while (this.stack.length) {
    this.closeElement(this.peek());
  }
  // If there is only one result, it's already been processed
  // For multiple results, allow Stacks to process array
  return this.result.length === 1 ? this.result[0] : this.processArrayOutput(this.result);
};

DefaultStack.prototype.clear = function() {
  this.result = [];
  this.stack = [];
};

module.exports = DefaultStack;
// Exports for testing
module.exports.doesSupportWhitespaceTextNodes = doesSupportWhitespaceTextNodes;
module.exports.supportsWhitespaceTextNodes = supportsWhitespaceTextNodes;
