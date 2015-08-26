'use strict';

var htmlparser = require('htmlparser2');
var DefaultStack = require('./stacks/default');

var _stack;

var parser = new htmlparser.Parser({
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
      _stack.closeElement(_stack.peek().id);
    }
}, {decodeEntities: true});

module.exports = function(html, stack) {
  _stack = stack || new DefaultStack(true);
  parser.write(html);
  parser.end();
  if (!stack) {
    return _stack.getOutput();
  }
};
