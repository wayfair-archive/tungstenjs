'use strict';

var virtualHyperscript = require('../vdom/virtual_hyperscript');
var HTMLCommentWidget = require('./widgets/html_comment');
var entityMap = require('html-tokenizer/entity-map');

var result = [];
var stack = [];

// @TODO examine other tokenizers or parsers
var Parser = require('html-tokenizer/parser');
var parser = new Parser({
  entities: entityMap
});
parser.on('open', function(name, attributes) {
  var properties = {
    attributes: attributes
  };
  if (!attributes.contenteditable) {
    properties.contentEditable = 'inherit';
  }

  stack.push({
    tagName: name,
    properties: properties,
    children: []
  });
});

/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
function closeElem(obj) {
  // if this is an element, create a VNode now so that count is set properly
  if (obj.tagName) {
    obj = virtualHyperscript(obj.tagName, obj.properties, obj.children);
  }

  if (stack.length > 0) {
    stack[stack.length - 1].children.push(obj);
  } else {
    result.push(obj);
  }
}

parser.on('close', function() {
  closeElem(stack.pop());
});

parser.on('text', function(text) {
  closeElem(text);
});

parser.on('comment', function(text) {
  closeElem(new HTMLCommentWidget(text));
});

module.exports = function(html) {
  result = [];
  stack = [];
  parser.parse(html);
  return result.length === 1 ? result[0] : result;
};
