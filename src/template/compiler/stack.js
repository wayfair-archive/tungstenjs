'use strict';

var _ = require('underscore');
var types = require('../ractive_types');
var htmlHelpers = require('../html_helpers');

var templateKeys = {
  type: 'type', // t
  typeExtra: 'typeExtra', // n
  value: 'value', // r
  commentValue: 'value', // c
  children: 'children', // f
  tagName: 'tagName', // e
  attributes: 'attributes', // a
  dynamicAttributes: 'dynamicAttributes' // m
};
// Ractive compatibility
templateKeys = {
  type: 't',
  typeExtra: 'n',
  value: 'r',
  commentValue: 'c',
  children: 'f',
  tagName: 'e',
  attributes: 'a',
  dynamicAttributes: 'm'
};

var templateStack = {
  startID: '',
  result: [],
  stack: [],
  partials: {},
  inSVG: false
};

templateStack.peek = function() {
  return this.stack[this.stack.length - 1];
};

templateStack.previousElement = function() {
  var i = this.stack.length;
  while (--i >= 0) {
    if (this.stack[i] && this.stack[i].type === types.ELEMENT) {
      return this.stack[i];
    }
  }
  return null;
};

templateStack.inComment = function() {
  for (var i = 0; i < this.stack.length; i++) {
    if (this.stack[i].type === types.COMMENT) {
      return true;
    }
  }
  return false;
};

templateStack.getID = function() {
  var id;
  if (this.stack.length) {
    var openElem = this.peek();
    id = openElem.id + '.' + openElem.children.length;
  } else {
    id = this.startID + this.result.length;
  }
  return id;
};

templateStack.openElement = function(type, value) {
  var elem = {
    children: [],
    type: type,
    id: this.getID()
  };
  if (type === types.ELEMENT) {
    var prev = this.previousElement();
    if (prev) {
      var isValid = htmlHelpers.validation.isValidChild(prev, value);
      if (isValid !== true) {
        throw new Error('Cannot place this ' + value + ' tag within a ' + prev.tagName + ' tag. ' + isValid);
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
  this.stack.push(elem);

  return elem;
};

templateStack.processObject = function(obj) {
  if (typeof obj === 'string') {
    return obj;
  }
  var processed = {};
  switch (obj.type) {
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
  }
  return processed;
};

/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
templateStack._closeElem = function(obj) {
  var i;

  if (obj.children && obj.children.length) {
    // Process child nodes
    var children = [];
    for (i = 0; i < obj.children.length; i++) {
      var child = this.processObject(obj.children[i]);
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

  var pushingTo;
  if (this.stack.length > 0) {
    var top = this.peek();
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
  if (typeof obj === 'string' && typeof pushingTo[pushingTo.length - 1] === 'string') {
    pushingTo[pushingTo.length - 1] += obj;
  } else {
    pushingTo.push(obj);
  }
};

templateStack.createObject = function(obj, options) {
  if (obj.type === types.PARTIAL) {
    this.partials[obj.value] = true;
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
  var openElem = this.peek();
  var id = closingElem.id;
  var tagName = closingElem.tagName;
  if (openElem) {
    var openID = openElem.id;
    if (openID !== id) {
      throw new Error(tagName + ' tags improperly paired, closing ' + openID + ' with close tag from ' + id);
    } else {
      // If they match, everything lines up
      this._closeElem(this.stack.pop());
    }
  } else {
    // Something has gone terribly wrong
    throw new Error('Closing element ' + id + ' when the stack was empty');
  }
};

templateStack.getOutput = function() {
  // If any items are left on the stack, they weren't closed by the template
  if (this.stack.length) {
    throw new Error('Template contains unclosed items:' + JSON.stringify(this.stack));
  }
  return this.result.length === 1 ? this.result[0] : this.result;
};

templateStack.clear = function() {
  this.result = [];
  this.stack = [];
};

var mergeStrings = function(arr) {
  for (var i = 0; i < arr.length; i++) {
    while (typeof arr[i] === 'string' && typeof arr[i + 1] === 'string') {
      arr[i] += arr[i + 1];
      arr.splice(i + 1, 1);
    }
  }
  return arr;
};

var flattenAttributeValues = function(attrObject) {
  if (Array.isArray(attrObject)) {
    for (var i = 0; i < attrObject.length; i++) {
      attrObject[i] = flattenAttributeValues(attrObject[i]);
    }
  } else if (attrObject.children) {
    attrObject.children = mergeStrings(flattenAttributeValues(attrObject.children));
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
};

var processAttributeArray = function(attrArray) {
  var attrs = {
    'static': {},
    'dynamic': []
  };
  var name = [];
  var value = [];
  var item;
  var pushingTo = name;
  for (var i = 0; i < attrArray.length; i++) {
    item = attrArray[i];
    if (item.type === 'attributenameend') {
      pushingTo = value;
    } else if (item.type === 'attributeend') {
      for (var j = 0; j < name.length; j++) {
        if (typeof name[j] !== 'string') {
          throw new Error('Mustache token cannot be in attribute names', name[j]);
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
      if (item.value !== '') {
        pushingTo.push(item.value);
      }
    } else if (pushingTo === name) {
      if (name.length === 0) {
        if (item.type === types.INTERPOLATOR) {
          throw new Error('Double curly interpolators cannot be in attributes', item);
        } else if (item.type === types.SECTION) {
          attrs.dynamic.push(flattenAttributeValues(item));
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
};

module.exports = templateStack;
