'use strict';

var _ = require('underscore');
var hogan = require('hogan.js/lib/compiler');
var types = require('../ractive_types');

var parser = require('./parser');
var stack = require('./stack');

function processBuffer() {
  if (!parser.inRelevantState()) {
    return;
  }
  var runningName = parser.getSection();
  if (parser.inAttributeName()) {
    if (runningName) {
      parser.clearBuffer();
      stack.createObject({
        type: 'attributename',
        value: runningName
      });
    }
  } else if (parser.inAttributeValue()) {
    parser.clearBuffer();
    stack.createObject({
      type: 'attributevalue',
      value: runningName
    });
  } else if (parser.inComment()) {
    parser.clearBuffer();
    if (stack.inComment()) {
      stack.createObject(runningName);
    } else {
      stack.openElement(types.COMMENT, runningName);
    }
  }
}

function processHoganObject(token, inDynamicAttribute) {
  if (!token) {
    return;
  }
  if (Array.isArray(token)) {
    for (var i = 0; i < token.length; i++) {
      processHoganObject(token[i], inDynamicAttribute);
    }
    return;
  }

  if (token.tag !== '_t') {
    processBuffer();
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
      processHoganObject(token.nodes, parser.inAttributeName());
      processBuffer();
      stack.closeElement(obj);
      break;
    case '^':
      obj = stack.openElement(types.SECTION_UNLESS, token.n.toString());
      processHoganObject(token.nodes, parser.inAttributeName());
      processBuffer();
      stack.closeElement(obj);
      break;
    case '>':
      obj = {};
      obj.type = types.PARTIAL;
      obj.value = token.n.toString();
      stack.createObject(obj);
      break;
    case '&':
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
      if (inDynamicAttribute) {
        stack.createObject(token.text.toString());
      } else {
        parser.write(token.text.toString());
      }
      break;
    case '\n':
      if (!inDynamicAttribute) {
        parser.write('\n');
      }
      break;
    default:
      throw new Error('Unhandled type: ' + JSON.stringify(token.tag));
  }
}

var getTemplate = function(template) {
  stack.clear();
  parser.reset();
  var tokenTree = hogan.parse(hogan.scan(template.toString()));
  processHoganObject(tokenTree);
  var output = {};

  if (stack.stack.length > 0) {
    throw new Error('Not all tags were closed properly: ' + JSON.stringify(stack.stack));
  }

  parser.end();
  output.templateObj = stack.getOutput();
  var Template = require('../template');
  output.template = new Template(output.templateObj);
  output.source = template;
  output.partials = _.keys(stack.partials);
  return output;
};

module.exports = getTemplate;
