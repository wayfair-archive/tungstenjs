'use strict';

var DefaultStack = require('./stacks/default');
var entityMap = require('html-tokenizer/entity-map');
// @TODO examine other tokenizers or parsers
var Parser = require('html-tokenizer/parser');

module.exports = function(html, stack) {
  var _stack = stack || new DefaultStack(true);

  var parser = new Parser({
    entities: entityMap
  });
  parser.on('open',  function(name, attributes) {
    _stack.openElement(name, attributes);
  });
  parser.on('comment', function(text) {
    _stack.createComment(text);
  });
  parser.on('text', function(text) {
    _stack.createObject(text);
  });
  parser.on('close', function() {
    var el = _stack.peek();
    _stack.closeElement(el);
  });

  parser.parse(html);

  if (!stack) {
    return _stack.getOutput();
  }
};
