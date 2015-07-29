'use strict';

var tungsten = require('./../tungsten');
var HTMLCommentWidget = require('./widgets/html_comment');
var entityMap = require('html-tokenizer/entity-map');

var result = [];
var stack = [];

// @TODO examine other tokenizers or parsers
var Parser = require('html-tokenizer/parser');
var parser = new Parser({ entities: entityMap });
parser.on('open', function(name, attributes) {
  stack.push({
    tagName: name,
    properties: {
      attributes: attributes
    },
    children: []
  });
});

/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
function closeElem(obj) {
  if (stack.length > 0) {
    stack[stack.length - 1].children.push(obj);
  } else if (obj.tagName) {
    result.push(tungsten.createVNode(obj.tagName, obj.properties, obj.children));
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

module.exports = function(html)  {
  result = [];
  stack = [];
  parser.parse(html);
  return result.length === 1 ? result[0] : result;
};
