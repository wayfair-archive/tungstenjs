'use strict';

var DefaultStack = require('./stacks/default');
var Parser = require('htmlparser2/lib/Parser');

/**
 * htmlparser2 treats boolean attributes as attributes with an empty string value
 * Since empty string is falsy, virtual-dom will turn the attribute off
 * This treats attribute values as true until a value is found
 *
 * @param {Object} cbs     Callback functions
 * @param {Object} options Options for htmlparser2
 */
function TungstenParser(cbs, options) {
  Parser.call(this, cbs, options);
  this._attribvalue = true;
}
TungstenParser.prototype = new Parser();
TungstenParser.prototype.constructor = TungstenParser;

TungstenParser.prototype.onattribdata = function(value) {
  if (this._attribvalue === true) {
    this._attribvalue = value;
  } else {
    this._attribvalue += value;
  }
};
TungstenParser.prototype._onattribend = Parser.prototype.onattribend;
TungstenParser.prototype.onattribend = function() {
  this._onattribend();
  this._attribvalue = true;
};

var defaultStack = new DefaultStack(true);
var _stack;
var parser = new TungstenParser({
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
