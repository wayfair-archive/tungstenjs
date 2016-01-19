'use strict';

var DefaultStack = require('./stacks/default');
var Parser = require('htmlparser2/lib/Parser');

var defaultStack = new DefaultStack(true);
var _stack;
var parser = new Parser({
  onopentag: function(name, attributes) {
    _stack.openElement(name, attributes);
  },
  oncomment: function(text) {
    _stack.createComment(text);
  },
  ontext: function(text) {
    _stack.createObject(text);
  },
  onclosetag: function() {
    var el = _stack.peek();
    _stack.closeElement(el);
  }
}, {decodeEntities: true});

module.exports = function(html, stack) {
  if (stack) {
    _stack = stack;
  } else {
    defaultStack.clear();
    _stack = defaultStack;
  }

  parser.reset();
  parser.end(html);
  // @TODO add logging when parser._stack.length > 0 as the html string left behind tags

  if (!stack) {
    return _stack.getOutput();
  }
};
