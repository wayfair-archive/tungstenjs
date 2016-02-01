'use strict';

const Parser = require('htmlparser2/lib/Parser');
const types = require('../types');
const stack = require('./stack');
const logger = require('./compiler_logger');
const decoder = require('./decoder');

// Taken from https://github.com/fb55/htmlparser2/blob/master/lib/Parser.js#L59
const voidElements = {
  __proto__: null,
  area: true,
  base: true,
  basefont: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  frame: true,
  hr: true,
  img: true,
  input: true,
  isindex: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,

  // common self closing svg elements
  path: true,
  circle: true,
  ellipse: true,
  line: true,
  rect: true,
  use: true,
  stop: true,
  polyline: true,
  polygon: true
};

/*
 * Since htmlparser2 doesn't expose its states, run some tests to grep them
 */
const testParser = new Parser({});
testParser.write('<div ');
const BEFORE_ATTRIBUTE_NAME = testParser._tokenizer._state;
testParser.write('at');
const IN_ATTRIBUTE_NAME = testParser._tokenizer._state;
testParser.write(' ');
const AFTER_ATTRIBUTE_NAME = testParser._tokenizer._state;

testParser.write('attr="');
const IN_ATTRIBUTE_VALUE_DQ = testParser._tokenizer._state;
testParser.write('" attr=\'');
const IN_ATTRIBUTE_VALUE_SQ = testParser._tokenizer._state;
testParser.write('\' attr=val');
const IN_ATTRIBUTE_VALUE_NQ = testParser._tokenizer._state;
testParser.write('><!-- ');
const IN_COMMENT = testParser._tokenizer._state;

const ATTRIBUTE_STATES = {};
ATTRIBUTE_STATES[BEFORE_ATTRIBUTE_NAME] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_NAME] = true;
ATTRIBUTE_STATES[AFTER_ATTRIBUTE_NAME] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_VALUE_DQ] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_VALUE_SQ] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_VALUE_NQ] = true;
ATTRIBUTE_STATES[IN_COMMENT] = true;

/**
 * Extend Parser to override some built-ins
 *
 * @param {[type]} cbs  [description]
 * @param {[type]} opts [description]
 */
function MustacheParser(cbs) {
  Parser.call(this, cbs, {
    decodeEntities: false,
    recognizeSelfClosing: true
  });
}
MustacheParser.prototype = new Parser();
MustacheParser.prototype.constructor = MustacheParser;

// Runs when the '=' after an attribute name is encountered
MustacheParser.prototype.onattribname = function(name) {
  if (name) {
    stack.createObject({
      type: 'attributename',
      value: name
    });
  }
  stack.createObject({
    type: 'attributenameend'
  });
};

// Runs when attribute value data has been encountered
MustacheParser.prototype.onattribdata = function(value) {
  stack.createObject({
    type: 'attributevalue',
    value: value
  });
};

// Runs when a whitespace character is encountered after a attribute name or the closing quote of a value
MustacheParser.prototype.onattribend = function() {
  stack.createObject({
    type: 'attributeend'
  });
};

MustacheParser.prototype.endAttribute = function() {
  this.onattribend();
  this._tokenizer._state = BEFORE_ATTRIBUTE_NAME;
};

// When an HTML tag is opened
MustacheParser.prototype.onopentagname = function(name) {
  if (this._lowerCaseTagNames) {
    name = name.toLowerCase();
  }

  this._tagname = name;

  if (!(name in voidElements)) {
    this._stack.push(name);
  }

  if (this._cbs.onopentagname) {
    this._cbs.onopentagname(name);
  }
  if (this._cbs.onopentag) {
    this._attribs = {};
  }
};

// When an HTML tag is closed
MustacheParser.prototype.onclosetag = function(name) {
  this._updatePosition(1);

  if (this._lowerCaseTagNames) {
    name = name.toLowerCase();
  }

  if (name in voidElements) {
    logger.warn(name + ' is a void element so does not need a closing tag');
    return;
  }

  if (this._stack.length && (!(name in voidElements) || this._options.xmlMode)) {
    let pos = this._stack.lastIndexOf(name);
    if (pos === this._stack.length - 1) {
      let el = this._stack.pop();
      if (this._cbs.onclosetag) {
        this._cbs.onclosetag(el);
      }
    } else {
      let current = this._stack[this._stack.length - 1];
      logger.exception('</' + name + '> where a </' + current + '> should be.');
    }
  } else {
    logger.exception('</' + name + '> with no paired <' + name + '>');
  }
};

/**
 * Expose new methods for compiler abstraction
 */

/**
 * Gets the text in the tokenizer's buffer
 * @return {String} Text in buffer
 */
MustacheParser.prototype.getSection = function() {
  return this._tokenizer._getSection();
};

/**
 * Move the sectionStart pointer to the processed pointer
 * Clears the buffer so that the tokenizer won't process again
 */
MustacheParser.prototype.clearBuffer = function() {
  this._tokenizer._sectionStart = this._tokenizer._index;
};

/**
 * Checks if the tokenizer's state is one of the ones we've deemed useful
 * @return {boolean}
 */
MustacheParser.prototype.inRelevantState = function() {
  let state = this._tokenizer._state;
  return ATTRIBUTE_STATES[state] === true;
};

/**
 * Whether the tokenizer's state is one of the attribute name states
 * @return {boolean}
 */
MustacheParser.prototype.inAttributeName = function() {
  let state = this._tokenizer._state;
  return state === BEFORE_ATTRIBUTE_NAME ||
    state === IN_ATTRIBUTE_NAME;
};

/**
 * Whether the tokenizer's state is after attribute name
 * @return {boolean}
 */
MustacheParser.prototype.afterAttributeName = function() {
  let state = this._tokenizer._state;
  return state === AFTER_ATTRIBUTE_NAME;
};

/**
 * Whether the tokenizer's state is one of the attribute value states
 * @return {boolean}
 */
MustacheParser.prototype.inAttributeValue = function() {
  let state = this._tokenizer._state;
  return state === IN_ATTRIBUTE_VALUE_DQ ||
    state === IN_ATTRIBUTE_VALUE_SQ ||
    state === IN_ATTRIBUTE_VALUE_NQ;
};

/**
 * Whether the tokenizer's state is in an HTML comment
 * @return {boolean}
 */
MustacheParser.prototype.inComment = function() {
  let state = this._tokenizer._state;
  return state === IN_COMMENT;
};

const parser = new MustacheParser({
  /**
   * Runs when an open tag is first processed
   * @param  {string} name tag's name
   */
  onopentagname: function(name) {
    parser._openTag = stack.openElement(types.ELEMENT, name);
  },
  /**
   * Runs when an open tag is completed
   */
  onopentag: function() {
    let el = stack.peek();
    // Marks the element as no longer opening so we stop pushing to attributes
    el.isOpen = false;
  },
  /**
   * Runs when an close tag is encountered
   */
  onclosetag: function() {
    let el = stack.peek();
    stack.closeElement(el);
  },
  /**
   * Handles HTML comments
   * @param  {} text [description]
   */
  oncomment: function(text) {
    let el = stack.peek();
    if (el && el.type === types.COMMENT) {
      stack.createObject(text);
      stack.closeElement(el);
    } else {
      stack.createComment(text);
    }
  },
  ontext: function(text) {
    let decoded = decoder(text);
    for (let i = 0; i < decoded.length; i++) {
      stack.createObject(decoded[i]);
    }
  }
});

module.exports = parser;
