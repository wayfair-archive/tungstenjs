'use strict';
var fs = require('fs');
var TemplateStack = require('./test_stack');
var htmlparser = require('htmlparser2');
var hogan = require('hogan-express/node_modules/hogan.js/lib/compiler');
var template = '{{! w/test }}<div class="{{class}}" {{#a}}{{#b}}data-foo="bar"{{/b}} data-bar="{{foo}}"{{/a}} {{{test}}}> {{#test}}fa<span>ff</span>ce{{/test}} <!--{{break}}--> {{> partial }} {{^test}}book{{/test}}</div>';
template = fs.readFileSync('./examples/todomvc/templates/todo_app_view.mustache');

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

/*
 * Since htmlparser2 doesn't expose its states, run some tests to grep them
 */
var testParser = new htmlparser.Parser({});
testParser.write('<div ');
var BEFORE_ATTRIBUTE_NAME = testParser._tokenizer._state;
testParser.write('at');
var IN_ATTRIBUTE_NAME = testParser._tokenizer._state;
testParser.write(' ');
var AFTER_ATTRIBUTE_NAME = testParser._tokenizer._state;

testParser.write('attr="');
var IN_ATTRIBUTE_VALUE_DQ = testParser._tokenizer._state;
testParser.write('" attr=\'');
var IN_ATTRIBUTE_VALUE_SQ = testParser._tokenizer._state;
testParser.write('\' attr=val');
var IN_ATTRIBUTE_VALUE_NQ = testParser._tokenizer._state;

var ATTRIBUTE_STATES = {};
ATTRIBUTE_STATES[BEFORE_ATTRIBUTE_NAME] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_NAME] = true;
ATTRIBUTE_STATES[AFTER_ATTRIBUTE_NAME] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_VALUE_DQ] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_VALUE_SQ] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_VALUE_NQ] = true;

var MustacheParser = function(cbs, opts) {
  htmlparser.Parser.call(this, cbs, opts);
  this._attribvalue = [];
};
MustacheParser.prototype = new htmlparser.Parser();
MustacheParser.prototype.constructor = MustacheParser;

MustacheParser.prototype.onattribname = function(name) {
  if (this._lowerCaseAttributeNames) {
    name = name.toLowerCase();
  }
  this._attribname = [name];
};

MustacheParser.prototype.onattribdata = function(value) {
  this._attribvalue += value;
};

MustacheParser.prototype.onattribend = function() {
  if (this._cbs.onattribute) {
    this._cbs.onattribute(this._attribname, this._attribvalue);
  }
  if (
    this._attribs &&
    !Object.prototype.hasOwnProperty.call(this._attribs, this._attribname)
  ) {
    this._attribs[this._attribname] = this._attribvalue;
  }
  this._attribname = [];
  this._attribvalue = [];
};

var stack = new TemplateStack();

var parser = new MustacheParser({
  onopentagname: function() {
    parser._tokenizer._dynamicAttributeDepth = 0;
    parser._tokenizer._dynamicAttributes = [];
  },
  onopentag: function(name, attrs) {
    delete attrs.__dyn__;
    stack.openElement(name, attrs);
    if (parser._tokenizer._dynamicAttributes.length) {
      stack.setDynamicAttributes(parser._tokenizer._dynamicAttributes.join(''));
    }
  },
  onattribute: function(name, value) {
    if (parser._tokenizer._dynamicAttributeDepth > 0) {
      parser._tokenizer._dynamicAttributes.push(' ' + name + '="' + value + '"');
      parser._attribname = '__dyn__';
    } else {
      var parsedValue = value;
      if (parsedValue.length === 1 && typeof parsedValue[0] === 'string') {
        parsedValue = parsedValue[0];
      }
      parser._attribs[name] = parsedValue;
    }
  },
  oncomment: function(text) {
    stack.createComment(text);
  },
  ontext: function(text) {
    stack.createObject(text);
  },
  onclosetag: function() {
    var el = stack.peek();
    stack.closeElement(el);
  }
}, {
  decodeEntities: true
});

function processHoganObject(token) {
  if (!token) {
    return token;
  }
  if (Array.isArray(token)) {
    for (var i = 0; i < token.length; i++) {
      token[i] = processHoganObject(token[i]);
    }
    return token;
  }

  var pushTo = 'stack';
  if (token.tag !== '_t' && ATTRIBUTE_STATES[parser._tokenizer._state] === true) {
    switch (parser._tokenizer._state) {
      case BEFORE_ATTRIBUTE_NAME:
      case IN_ATTRIBUTE_NAME:
      case AFTER_ATTRIBUTE_NAME:
        pushTo = 'attribname';
        break;
      case IN_ATTRIBUTE_VALUE_DQ:
      case IN_ATTRIBUTE_VALUE_SQ:
      case IN_ATTRIBUTE_VALUE_NQ:
        pushTo = 'attribvalue';
        break;
    }
  }

  var obj;
  switch (token.tag) {
    case '!':
      if (token.n.indexOf('w/') > -1) {
        obj = {};
        obj.type = types.REFERENCE;
        obj.value = token.n;
        stack.createObject(obj);
      }
      break;
    case '#':
      obj = {};
      obj.type = types.SECTION;
      obj.value = token.n.toString();
      obj.children = [];
      stack.stack.push(obj);
      processHoganObject(token.nodes || []);
      stack._closeElem(obj);
      break;
    case '^':
      obj = {};
      obj.type = types.SECTION_UNLESS;
      obj.value = token.n.toString();
      obj.children = [];
      stack.stack.push(obj);
      processHoganObject(token.nodes || []);
      stack._closeElem(obj);
      break;
    case '>':
      obj = {};
      obj.type = types.PARTIAL;
      obj.value = token.n.toString();
      stack.createObject(obj);
      break;
    case '{':
      obj = {};
      obj.type = types.TRIPLE;
      obj.value = token.n.toString();
      stack.createObject(obj);
      break;
    case '_v':
      obj = {};
      obj.type = types.INTERPOLATOR;
      obj.value = token.n.toString();
      stack.createObject(obj);
      break;
    case '_t':
      parser.write(token.text.toString());
      break;
    case '\n':
      parser.write('\n');
      break;
    default:
      throw new Error('Unhandled type: ' + JSON.stringify(token.tag));
  }
}

var tokenTree = hogan.parse(hogan.scan(template.toString()));
processHoganObject(tokenTree);
parser.end();
// console.log(JSON.stringify(stack.getOutput()));
console.log(stack.getOutput());
