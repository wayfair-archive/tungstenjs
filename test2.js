'use strict';
var TemplateStack = require('./test_stack');
var htmlparser = require('htmlparser2');
var hogan = require('hogan.js/lib/compiler');
var template = `{{! w/test }}
<div selected class="{{class}}" {{#a}}{{#b}}data-{{c}}-a="bar"{{/b}} data-bar="{{foo}}"{{/a}} {{{test}}}>
  {{#test}}fa<span>ff</span>ce{{/test}}
  <!-- t{{break}}t-->
  {{> partial }}
  {{^test}}book{{/test}}
</div>
</span>
`;
// template = fs.readFileSync('./examples/todomvc/templates/todo_app_view.mustache');

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
testParser.write('><!-- ');
var IN_COMMENT = testParser._tokenizer._state;

var ATTRIBUTE_STATES = {};
ATTRIBUTE_STATES[BEFORE_ATTRIBUTE_NAME] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_NAME] = true;
ATTRIBUTE_STATES[AFTER_ATTRIBUTE_NAME] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_VALUE_DQ] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_VALUE_SQ] = true;
ATTRIBUTE_STATES[IN_ATTRIBUTE_VALUE_NQ] = true;
ATTRIBUTE_STATES[IN_COMMENT] = true;

var MustacheParser = function(cbs, opts) {
  htmlparser.Parser.call(this, cbs, opts);
  this._attribvalue = [];
  this._dynamicAttributeDepth = 0;
};
MustacheParser.prototype = new htmlparser.Parser();
MustacheParser.prototype.constructor = MustacheParser;

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

MustacheParser.prototype.onattribdata = function(value) {
  stack.createObject({
    type: 'attributevalue',
    value: value
  });
};

MustacheParser.prototype.onattribend = function() {
  stack.createObject({
    type: 'attributeend'
  });
};

var stack = new TemplateStack();

var parser = new MustacheParser({
  onopentagname: function(name) {
    parser._tokenizer._dynamicAttributeDepth = 0;
    parser._tokenizer._dynamicAttributes = [];
    parser._attribs = [];
    parser._openTag = stack.openElement(types.ELEMENT, name);
  },
  onopentag: function() {
    var el = stack.peek();
    el.isOpen = false;
  },
  oncomment: function(text) {
    var el = stack.peek();
    if (el.type === 'comment') {
      stack.createObject(text);
      stack.closeElement(el);
    } else {
      stack.createComment(text);
    }
  },
  ontext: function(text) {
    stack.createObject(text);
  },
  onclosetag: function(name) {
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

  if (token.tag !== '_t' && ATTRIBUTE_STATES[parser._tokenizer._state] === true) {
    var runningName = parser._tokenizer._getSection();
    switch (parser._tokenizer._state) {
      case BEFORE_ATTRIBUTE_NAME:
      case IN_ATTRIBUTE_NAME:
      case AFTER_ATTRIBUTE_NAME:
        if (runningName) {
          parser._tokenizer._sectionStart = parser._tokenizer._index;
          stack.createObject({
            type: 'attributename',
            value: runningName
          });
        }
        break;
      case IN_COMMENT:
        stack.openElement('comment', runningName);
        parser._tokenizer._sectionStart = parser._tokenizer._index;
        break;
      case IN_ATTRIBUTE_VALUE_DQ:
      case IN_ATTRIBUTE_VALUE_SQ:
      case IN_ATTRIBUTE_VALUE_NQ:
        stack.createObject({
          type: 'attributevalue',
          value: runningName
        });
        parser._tokenizer._sectionStart = parser._tokenizer._index;
        break;
    }
  }

  var obj;
  switch (token.tag) {
    case '!':
      if (token.n.indexOf('w/') > -1) {
        obj = {};
        obj.type = types.INTERPOLATOR;
        obj.value = '!' + token.n;
        stack.createObject(obj);
      }
      break;
    case '#':
      obj = stack.openElement(types.SECTION, token.n.toString());
      processHoganObject(token.nodes || []);
      stack.closeElement(obj);
      break;
    case '^':
      obj = stack.openElement(types.SECTION_UNLESS, token.n.toString());
      processHoganObject(token.nodes || []);
      stack.closeElement(obj);
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
// console.log(JSON.stringify(stack.getOutput(), null, '  '));
console.log(JSON.stringify(stack.getOutput()));
