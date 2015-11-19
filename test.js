'use strict';
var DefaultStack = require('./src/template/stacks/default');
var htmlparser = require('htmlparser2');
var hogan = require('hogan-express/node_modules/hogan.js/lib/compiler');
var template = '{{! w/test }}<div class="{{class}}" {{#a}}{{#b}}data-foo="bar"{{/b}} data-bar="{{foo}}"{{/a}} {{{test}}}> {{#test}}fa<span>ff</span>ce{{/test}} <!--{{break}}--> {{> partial }} {{^test}}book{{/test}}</div>';

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

function processMustacheString(str, stack) {
  var tokens = hogan.scan(str).map(processHoganObject);
  var token;
  for (var i = 0; i < tokens.length; i++) {
    token = tokens[i];
    if (!token) {
      continue;
    }
    if (typeof token === 'string' || token instanceof String) {
      stack.createObject(token.toString());
    } else {
      switch (token.type) {
        case types.INTERPOLATOR:
        case types.TRIPLE:
        case types.REFERENCE:
        case types.PARTIAL:
          stack.createObject(token);
          break;
        case types.SECTION:
        case types.SECTION_UNLESS:
          stack.stack.push(token);
          break;
        case types.CLOSING_TAG:
          var elem = stack.peek();
          if (elem.type === types.SECTION || elem.type === types.SECTION_UNLESS) {
            stack.closeElement(elem);
          } else {
            throw new Error('closing ' + JSON.stringify(token) + ' from ' + JSON.stringify(elem));
          }
          break;
        default:
          throw new Error('unhandled Hogan token', JSON.stringify(token));
      }
    }
  }
}

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

  var obj;
  switch (token.tag) {
    case '/':
      obj = {};
      obj.type = types.CLOSING_TAG;
      obj.value = token.n;
      return obj;
    case '!':
      if (token.n.indexOf('w/') > -1) {
        obj = {};
        obj.type = types.REFERENCE;
        obj.value = processCompleteMustacheString(token.n);
        return obj;
      }
      return null;
    case '#':
      obj = {};
      obj.type = types.SECTION;
      obj.value = token.n.toString();
      obj.children = processHoganObject(token.nodes || []);
      return obj;
    case '^':
      obj = {};
      obj.type = types.SECTION_UNLESS;
      obj.value = token.n.toString();
      obj.children = processHoganObject(token.nodes || []);
      return obj;
    case '{':
      obj = {};
      obj.type = types.TRIPLE;
      obj.value = token.n.toString();
      return obj;
    case '>':
      obj = {};
      obj.type = types.PARTIAL;
      obj.value = token.n.toString();
      return obj;
    case '_v':
      obj = {};
      obj.type = types.INTERPOLATOR;
      obj.value = token.n.toString();
      return obj;
    case '_t':
      return token.text.toString();
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
  // always pass useAttributes
  DefaultStack.call(this, true);
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

var templateKeys = {
  type: 'type', // t
  value: 'value', // r
  children: 'children', // f
  tagName: 'tagName', // e
  properties: 'properties', // a
  dynamicProperties: 'dynamicProperties' // m
};

TemplateStack.prototype.processObject = function(obj) {
  if (typeof obj === 'string') {
    return obj;
  }
  var processed = {};
  switch (obj.type) {
    case 'node':
      processed[templateKeys.type] = types.ELEMENT;
      processed[templateKeys.tagName] = obj.tagName;
      if (obj.properties && Object.keys(obj.properties).length > 0) {
        processed[templateKeys.properties] = obj.properties;
      }
      if (obj.dynamicProperties && obj.dynamicProperties.length > 0) {
        processed[templateKeys.dynamicProperties] = obj.dynamicProperties;
      }
      if (obj.children && obj.children.length > 0) {
        processed[templateKeys.children] = obj.children;
      }
      break;
    case 'comment':
      processed[templateKeys.type] = types.COMMENT;
      processed[templateKeys.value] = obj.text;
      break;
    case types.INTERPOLATOR:
    case types.TRIPLE:
    case types.REFERENCE:
      return obj;
    case types.PARTIAL:
    case types.SECTION:
    case types.SECTION_UNLESS:
      processed[templateKeys.type] = obj.type;
      processed[templateKeys.value] = obj.value;
      if (obj.children && obj.children.length > 0) {
        processed[templateKeys.children] = obj.children;
      }
      break;
  }
  return processed;
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
      var parsedValue = processCompleteMustacheString(value);
      if (parsedValue.length === 1 && typeof parsedValue[0] === 'string') {
        parsedValue = parsedValue[0];
      }
      parser._attribs[name] = parsedValue;
    }
  },
  oncomment: function(text) {
    stack.createComment(processCompleteMustacheString(text));
  },
  ontext: function(text) {
    processMustacheString(text, stack);
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
