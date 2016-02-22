'use strict';

const _ = require('underscore');
const types = require('../types');
const htmlHelpers = require('../html_helpers');
const logger = require('./compiler_logger');

// Keys to use for the outputted array
const templateKeys = {
  type: 't',
  typeExtra: 'n',
  value: 'r',
  commentValue: 'c',
  children: 'f',
  tagName: 'e',
  attributes: 'a',
  dynamicAttributes: 'm'
};

const templateStack = {
  startID: '',
  result: [],
  stack: [],
  tokens: {
    sections: {},
    interpolators: {},
    triple: {},
    partials: {}
  },
  inSVG: false,
  htmlValidationMode: true
};

templateStack.clear = function() {
  this.result = [];
  this.stack = [];
  this.partials = {};
  this.startID = '';
  this.inSVG = false;
  this.htmlValidationMode = true;
  this.tokens = {
    sections: {},
    interpolators: {},
    triple: {},
    partials: {}
  };
};

templateStack.setHtmlValidation = function(htmlValidationMode) {
  this.htmlValidationMode = htmlValidationMode;
};

templateStack.peek = function() {
  return this.stack[this.stack.length - 1];
};

templateStack.previousElement = function() {
  let i = this.stack.length;
  while (--i >= 0) {
    if (this.stack[i] && this.stack[i].type === types.ELEMENT) {
      return this.stack[i];
    }
  }
  return null;
};

templateStack.inComment = function() {
  for (let i = 0; i < this.stack.length; i++) {
    if (this.stack[i].type === types.COMMENT) {
      return true;
    }
  }
  return false;
};

templateStack.getID = function() {
  let id;
  if (this.stack.length) {
    let openElem = this.peek();
    id = openElem.id + '.' + openElem.children.length;
  } else {
    id = this.startID + this.result.length;
  }
  return id;
};

templateStack.openElement = function(type, value) {
  let elem = {
    children: [],
    type: type,
    id: this.getID()
  };
  if (type === types.ELEMENT) {
    let prev = this.previousElement();
    if (prev && this.htmlValidationMode) {
      let isValid = htmlHelpers.validation.isValidChild(prev, value, this.htmlValidationMode === 'strict');
      if (isValid !== true) {
        logger.warn('Cannot place this ' + value + ' tag within a ' + prev.tagName + ' tag. ' + isValid);
      }
    }
    elem.childTags = {};
    elem.tagName = value;
    elem.attributes = [];
    elem.isOpen = true;
    if (elem.tagName.toLowerCase() === 'svg') {
      this.inSVG = elem.id;
    }
  } else if (type === types.COMMENT) {
    elem.children.push(value);
  } else {
    elem.value = value;
  }
  if (type === types.SECTION || type === types.SECTION_UNLESS) {
    this.tokens.sections[elem.value] = true;
  }
  this.stack.push(elem);

  return elem;
};

templateStack.processObject = function(obj) {
  if (typeof obj === 'string') {
    return obj;
  }
  let processed = {};
  switch (obj.type) {
    case types.TEXT:
      processed[templateKeys.type] = types.TEXT;
      processed[templateKeys.value] = obj.value;
      processed[templateKeys.typeExtra] = obj.original;
      break;
    case types.ELEMENT:
      processed[templateKeys.type] = types.ELEMENT;
      processed[templateKeys.tagName] = obj.tagName;
      var attrs = processAttributeArray(obj.attributes);
      if (_.size(attrs.static) > 0) {
        processed[templateKeys.attributes] = attrs.static;
      }
      if (attrs.dynamic.length > 0) {
        processed[templateKeys.dynamicAttributes] = attrs.dynamic;
      }
      if (obj.tagName.toLowerCase() === 'textarea') {
        if (!processed[templateKeys.attributes]) {
          processed[templateKeys.attributes] = {};
        }
        processed[templateKeys.attributes].value = obj.children;
        obj.children = null;
      }
      if (this.inSVG || obj.tagName.toLowerCase() === 'svg') {
        if (!processed[templateKeys.attributes]) {
          processed[templateKeys.attributes] = {};
        }
        processed[templateKeys.attributes].namespace = 'http://www.w3.org/2000/svg';
      }
      if (obj.children && obj.children.length > 0) {
        processed[templateKeys.children] = obj.children;
      }
      break;
    case types.COMMENT:
      processed[templateKeys.type] = types.COMMENT;
      if (obj.children && obj.children.length) {
        if (obj.children.length === 1) {
          obj.text = obj.children[0];
        } else {
          obj.text = obj.children;
        }
      }
      processed[templateKeys.commentValue] = obj.text;
      break;
    case types.INTERPOLATOR:
    case types.TRIPLE:
    case types.REFERENCE:
      processed[templateKeys.type] = obj.type;
      processed[templateKeys.value] = obj.value;
      break;
    case types.PARTIAL:
    case types.SECTION:
    case types.SECTION_UNLESS:
      processed[templateKeys.type] = obj.type;
      processed[templateKeys.value] = obj.value;
      if (obj.children && obj.children.length > 0) {
        processed[templateKeys.children] = obj.children;
      }
      if (obj.type === types.SECTION_UNLESS) {
        processed[templateKeys.type] = types.SECTION;
        processed[templateKeys.typeExtra] = types.SECTION_UNLESS;
      }
      break;
    case 'attributename':
    case 'attributenameend':
    case 'attributevalue':
    case 'attributeend':
      processed = obj;
      break;
    default:
      processed = obj;
  }
  return processed;
};

/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
templateStack._closeElem = function(obj) {
  let i;

  if (obj.children && obj.children.length) {
    // Process child nodes
    let children = [];
    for (i = 0; i < obj.children.length; i++) {
      let child = this.processObject(obj.children[i]);
      // Filter the array to truthy values to remove empty strings
      if (child) {
        children.push(child);
      }
    }
    obj.children = children;
  }

  if (obj.id === this.inSVG) {
    this.inSVG = false;
  }

  let pushingTo;
  if (this.stack.length > 0) {
    let top = this.peek();
    if (top.type === types.ELEMENT && top.isOpen) {
      pushingTo = top.attributes;
    } else {
      pushingTo = top.children;
      // @TODO fix this
      if (top && top.childTags && obj.type === types.ELEMENT) {
        top.childTags[obj.tagName] = true;
      }
    }
  } else {
    pushingTo = this.result;
    obj = this.processObject(obj);
  }

  // Combine adjacent strings
  if (obj.type === types.TEXT && pushingTo[pushingTo.length - 1] && pushingTo[pushingTo.length - 1].type === types.TEXT) {
    pushingTo[pushingTo.length - 1].value += obj.value;
    pushingTo[pushingTo.length - 1].original += obj.original;
  } else {
    pushingTo.push(obj);
  }
};

templateStack.createObject = function(obj, options) {
  switch (obj.type) {
    case types.PARTIAL:
      this.tokens.partials[obj.value] = true;
      break;
    case types.INTERPOLATOR:
      this.tokens.interpolators[obj.value] = true;
      break;
    case types.TRIPLE:
      this.tokens.triple[obj.value] = true;
      break;
  }
  this._closeElem(obj, options);
};

templateStack.createComment = function(text) {
  this._closeElem({
    type: types.COMMENT,
    text: text
  });
};

templateStack.closeElement = function(closingElem) {
  let openElem = this.peek();
  let id = closingElem.id;
  if (openElem) {
    let openID = openElem.id;
    if (openID !== id) {
      if (closingElem.tagName) {
        logger.exception('</' + openElem.tagName + '> where a </' + closingElem.tagName + '> should be.');
      } else {
        logger.exception('</' + openElem.tagName + '> where a {{/' + closingElem.value + '}} should be.');
      }
    } else {
      // If they match, everything lines up
      this._closeElem(this.stack.pop());
    }
  } else {
    // Something has gone terribly wrong
    logger.exception('</' + closingElem.tagName + '> with no paired <' + closingElem.tagName + '>');
  }
};

templateStack.getOutput = function() {
  // If any items are left on the stack, they weren't closed by the template
  if (this.stack.length) {
    logger.warn('Template contains unclosed items', this.stack);
  }
  // Always return the array
  return this.result;
};

function mergeStrings(arr) {
  for (let i = 0; i < arr.length; i++) {
    while (typeof arr[i] === 'string' && typeof arr[i + 1] === 'string') {
      arr[i] += arr[i + 1];
      arr.splice(i + 1, 1);
    }
  }
  return arr;
}

function flattenAttributeValues(attrObject) {
  if (Array.isArray(attrObject)) {
    for (let i = 0; i < attrObject.length; i++) {
      attrObject[i] = flattenAttributeValues(attrObject[i]);
    }
  } else if (attrObject.children) {
    attrObject.children = mergeStrings(flattenAttributeValues(attrObject.children));
    attrObject = templateStack.processObject(attrObject);
  } else if (attrObject[templateKeys.children]) {
    attrObject[templateKeys.children] = mergeStrings(flattenAttributeValues(attrObject[templateKeys.children]));
    attrObject = templateStack.processObject(attrObject);
  } else if (attrObject.type === 'attributenameend') {
    attrObject = '="';
  } else if (attrObject.type === 'attributeend') {
    attrObject = '" ';
  } else if (attrObject.type === 'attributename' || attrObject.type === 'attributevalue') {
    attrObject = attrObject.value;
  } else {
    attrObject = templateStack.processObject(attrObject);
  }
  return attrObject;
}

/**
 * Processes attributes into static and dynamic values
 * @param  {Array<Object>} attrArray Attribute array built during parsing
 * @return {Object}
 */
function processAttributeArray(attrArray) {
  let attrs = {
    'static': {},
    'dynamic': []
  };
  let name = [];
  let value = [];
  let item;
  let pushingTo = name;
  for (let i = 0; i < attrArray.length; i++) {
    item = attrArray[i];
    if (item.type === 'attributenameend') {
      pushingTo = value;
    } else if (item.type === 'attributeend') {
      // Ensure there are no tokens in a non-dynamic attribute name
      for (let j = 0; j < name.length; j++) {
        if (typeof name[j] !== 'string') {
          logger.warn('Mustache token cannot be in attribute names', name[j]);
        }
      }

      if (name.length === 1) {
        if (value.length) {
          if (value.length === 1 && typeof value[0] === 'string') {
            value = value[0];
          }
        } else {
          value = true;
        }
        attrs.static[name[0]] = flattenAttributeValues(value);
      } else {
        attrs.dynamic = attrs.dynamic.concat(_.map(name, flattenAttributeValues));
        if (value.length) {
          attrs.dynamic.push('="');
          attrs.dynamic = attrs.dynamic.concat(_.map(value, flattenAttributeValues));
          attrs.dynamic.push('"');
        }
      }
      name = [];
      value = [];
      pushingTo = name;
    } else if (item.type === 'attributename' || item.type === 'attributevalue') {
      pushingTo.push(item.value);
    } else if (pushingTo === name) {
      if (name.length === 0) {
        if (item.type === types.INTERPOLATOR) {
          logger.warn('Double curly interpolators cannot be in attributes', item.value);
        } else if (item.type === types.SECTION) {
          attrs.dynamic.push(templateStack.processObject(item));
          continue;
        }
      }
      pushingTo.push(item);
    } else {
      pushingTo.push(item);
    }
  }

  attrs.dynamic = attrs.dynamic.concat(_.map(name, flattenAttributeValues));
  attrs.dynamic = attrs.dynamic.concat(_.map(value, flattenAttributeValues));
  mergeStrings(attrs.dynamic);

  return attrs;
}

module.exports = templateStack;
