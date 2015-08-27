'use strict';

var htmlparser = require('htmlparser2');
var DefaultStack = require('./stacks/default');

module.exports = function(html, stack) {
  var _stack = stack || new DefaultStack(true);

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
        var el = _stack.peek();
        _stack.closeElement(el);
      }
  }, {decodeEntities: true});

  parser.write(html);
  parser.end();

  if (!stack) {
    return _stack.getOutput();
  }
};
