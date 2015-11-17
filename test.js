'use strict';
var DefaultStack = require('./src/template/stacks/default');
var htmlparser = require('htmlparser2');
var hogan = require('hogan-express/node_modules/hogan.js/lib/compiler');
var template = '{{! test }}<div class="{{class}}" {{#a}}{{#b}}data-foo="bar"{{/b}} data-bar="{{foo}}"{{/a}} {{{test}}}> {{#test}}fa<span>ff</span>ce{{/test}} <!-- break --> {{^test}}book{{/test}}</div>';

var _stateBeforeAttributeName = htmlparser.Tokenizer.prototype._stateBeforeAttributeName;
htmlparser.Tokenizer.prototype._stateBeforeAttributeName = function(c) {
  if (c === '{') {
    var curlyCounter = 1;
    this._sectionStart = this._index;
    while (curlyCounter !== 0) {
      this._index += 1;
      c = this._buffer.charAt(this._index);
      if (c === '{') {
        curlyCounter += 1;
      } else if (c === '}') {
        curlyCounter -= 1;
      }
    }
    this._index += 1;
    c = this._buffer.charAt(this._index);
    var section = this._getSection();
    if (section.substr(0, 3) === '{{#') {
      this._dynamicAttributeDepth += 1;
    }
    if (section.substr(0, 3) === '{{/') {
      this._dynamicAttributeDepth -= 1;
    }
    this._dynamicAttributes.push(section);

    this._stateBeforeAttributeName(c);
  } else {
    _stateBeforeAttributeName.call(this, c);
  }
};

function processMustacheTokens(tokens) {
  // process token array into stack calls?
  return tokens;
}

function processMustacheString(str, parse) {
  var tokens = hogan.scan(str);
  return tokens;
}

var types = {
  INTERPOLATOR: 2,
  TRIPLE: 3,
  SECTION: 4,
  INVERTED: 5,
  ELEMENT: 7,
  PARTIAL: 8,
  COMMENT: 9
};

function processHoganObject(token) {
  if (Array.isArray(token)) {
    for (var i = 0; i < token.length; i++) {
      token[i] = processHoganObject(token[i]);
    }
    return token;
  }

  switch (token.tag) {
    case '#':
      return {
        type: types.SECTION,
        value: token.n,
        children: processHoganObject(token.nodes)
      };
    case '^':
      return {
        type: types.INVERTED,
        value: token.n,
        children: processHoganObject(token.nodes)
      };
    case '{':
      return {
        type: types.TRIPLE,
        value: token.n
      };
    case '_v':
      return {
        type: types.INTERPOLATOR,
        value: token.n
      };
    case '_t':
      return token.text;
  }
}

function processCompleteMustacheString(str) {
  var tokens = hogan.parse(hogan.scan(str), str);
  return processHoganObject(tokens);
}

var MustacheParser = function(cbs, opts) {
  htmlparser.Parser.call(this, cbs, opts);
};
MustacheParser.prototype = new htmlparser.Parser();
MustacheParser.prototype.constructor = MustacheParser;

var TemplateStack = function() {
  DefaultStack.call(this);
};
TemplateStack.prototype = new DefaultStack();
TemplateStack.prototype.constructor = TemplateStack;

TemplateStack.prototype.setDynamicAttributes = function(value) {
  var elem = stack.peek();
  if (!elem.dynamicProperties) {
    elem.dynamicProperties = [];
  }
  var tokens = processCompleteMustacheString(value);
  elem.dynamicProperties.push(tokens);
};

var stack = new TemplateStack();

var parser = new MustacheParser({
  onopentagname: function() {
    parser._tokenizer._dynamicAttributeDepth = 0;
    parser._tokenizer._dynamicAttributes = [];
  },
  onopentag: function(name, attrs) {
    delete attrs.__dyn__;
    // console.log('open', name, attrs);
    stack.openElement(name, attrs);
    stack.setDynamicAttributes(parser._tokenizer._dynamicAttributes.join(''));
  },
  onattribute: function(name, value) {
    if (parser._tokenizer._dynamicAttributeDepth > 0) {
      parser._tokenizer._dynamicAttributes.push(' ' + name + '="' + value + '"');
      parser._attribname = '__dyn__';
    } else {
      parser._attribs[name] = value;
    }
  },
  oncomment: function(text) {
    stack.createComment(processMustacheString(text));
  },
  ontext: function(text) {
    stack.createObject(processMustacheString(text));
  },
  onclosetag: function() {
    var el = stack.peek();
    stack.closeElement(el);
  }
}, {
  decodeEntities: true
});
parser.write(template);
parser.end();

console.log(JSON.stringify(stack.getOutput(), null, '  '));
