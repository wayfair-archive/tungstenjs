var logger = require('./src/utils/logger');

var templateKeys = {
  type: 'type', // t
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
  value: 'r',
  commentValue: 'c',
  children: 'f',
  tagName: 'e',
  attributes: 'a',
  dynamicAttributes: 'm'
};

var types = {
  INTERPOLATOR: 2, // {{ }}
  TRIPLE: 3, // {{{ }}}
  SECTION: 4, // {{# }}
  ELEMENT: 7, // <>
  PARTIAL: 8, // {{> }}
  COMMENT: 9, // {{! }}
  CLOSING_TAG: 14, // {{/ }}
  REFERENCE: 30, // {{! w/ }}
  SECTION_UNLESS: 51 // {{^ }}
};

function TemplateStack() {
  this.startID = '';
  this.result = [];
  this.stack = [];
}

TemplateStack.prototype.peek = function() {
  return this.stack[this.stack.length - 1];
};

TemplateStack.prototype.getID = function() {
  var id;
  if (this.stack.length) {
    var openElem = this.peek();
    id = openElem.id + '.' + openElem.children.length;
  } else {
    id = this.startID + this.result.length;
  }
  return id;
};


TemplateStack.prototype.openElement = function(type, value) {
  var elem = {
    children: [],
    type: type,
    id: this.getID()
  };
  if (type === types.ELEMENT) {
    elem.tagName = value;
    elem.attributes = [];
    elem.isOpen = true;
  } else if (type === 'comment') {
    elem.children.push(value);
  } else {
    elem.value = value;
  }
  this.stack.push(elem);

  return elem;
};

TemplateStack.prototype.processObject = function(obj) {
  if (typeof obj === 'string') {
    return obj;
  }
  var processed = {};
  switch (obj.type) {
    case types.ELEMENT:
      processed[templateKeys.type] = types.ELEMENT;
      processed[templateKeys.tagName] = obj.tagName;
      var attrs = processAttributeArray(obj.attributes);
      if (Object.keys(attrs.static).length > 0) {
        processed[templateKeys.attributes] = attrs.static;
      }
      if (attrs.dynamic.length > 0) {
        processed[templateKeys.dynamicAttributes] = attrs.dynamic;
      }
      if (obj.children && obj.children.length > 0) {
        processed[templateKeys.children] = obj.children;
      }
      break;
    case 'comment':
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
        processed.n = types.SECTION_UNLESS;
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
TemplateStack.prototype._closeElem = function(obj) {
  var i;

  if (obj.children && obj.children.length) {
    // Process child nodes
    for (i = obj.children.length; i--;) {
      obj.children[i] = this.processObject(obj.children[i]);
    }
  }

  var pushingTo;
  if (this.stack.length > 0) {
    var top = this.peek();
    if (top.type === types.ELEMENT && top.isOpen) {
      pushingTo = top.attributes;
    } else {
      pushingTo = top.children;
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

TemplateStack.prototype.createObject = function(obj, options) {
  if (obj && obj.type === 'Widget') {
    obj.id = this.getID();
  }
  this._closeElem(obj, options);
};

TemplateStack.prototype.createComment = function(text) {
  this._closeElem({
    type: 'comment',
    text: text
  });
};

TemplateStack.prototype.popElement = function() {
  return this.stack.pop();
};

TemplateStack.prototype.closeElement = function(closingElem) {
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

/**
 * Postprocessing for an array result
 * This allows stacks to create DocumentFragments or join the array to create the expected output type
 * @param  {Array<Any>} output Array of result objects
 * @return {Any}               Processed result
 */
TemplateStack.prototype.processArrayOutput = function(output) {
  return output;
};

TemplateStack.prototype.getOutput = function() {
  while (this.stack.length) {
    this.closeElement(this.peek());
  }
  // If there is only one result, it's already been processed
  // For multiple results, allow Stacks to process array
  return this.result.length === 1 ? this.result[0] : this.processArrayOutput(this.result);
};

TemplateStack.prototype.clear = function() {
  this.result = [];
  this.stack = [];
};

module.exports = TemplateStack;

function mergeStrings(arr) {
  for (var i = 0; i < arr.length; i++) {
    while (typeof arr[i] === 'string' && typeof arr[i + 1] === 'string') {
      arr[i] += arr[i + 1];
      arr.splice(i + 1, 1);
    }
  }
  return arr;
}

function flattenAttributeValues(attrObject) {
  if (Array.isArray(attrObject)) {
    return attrObject.map(flattenAttributeValues);
  } else if (attrObject.children) {
    attrObject.children = mergeStrings(attrObject.children.map(flattenAttributeValues));
    attrObject = TemplateStack.prototype.processObject(attrObject);
  } else if (attrObject.type === 'attributenameend') {
    attrObject = '="';
  } else if (attrObject.type === 'attributeend') {
    attrObject = '" ';
  } else if (attrObject.type === 'attributename' || attrObject.type === 'attributevalue') {
    attrObject = attrObject.value;
  } else {
    attrObject = TemplateStack.prototype.processObject(attrObject);
  }
  return attrObject;
}

function processAttributeArray(attrArray) {
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
        attrs.dynamic = attrs.dynamic.concat(name.map(flattenAttributeValues));
        if (value.length) {
          attrs.dynamic.push('="');
          attrs.dynamic = attrs.dynamic.concat(value.map(flattenAttributeValues));
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

  attrs.dynamic = attrs.dynamic.concat(name.map(flattenAttributeValues));
  attrs.dynamic = attrs.dynamic.concat(value.map(flattenAttributeValues));
  mergeStrings(attrs.dynamic);

  return attrs;
}
