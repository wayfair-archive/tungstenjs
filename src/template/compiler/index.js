'use strict';

var _ = require('underscore');
var hogan = require('hogan.js/lib/compiler');
var types = require('../ractive_types');

var parser = require('./parser');
var stack = require('./stack');

/**
 * Gets the current buffer from htmlparser and processes it
 * Used to handle section tags inside attribute values
 */
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
  } else if (parser.afterAttributeName()) {
    parser.endAttribute();
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

/**
 * [processHoganObject description]
 * @param  {Object}  token              Nested mustache tree object
 * @param  {booelan} inDynamicAttribute Whether we are in a dynamic attribute
 */
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

  // Any time we hit a mustache node, check the buffer
  if (token.tag !== '_t') {
    processBuffer();
  }

  var obj;
  switch (token.tag) {
    case '!':
      // Leave control comments in as interpolators
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

/**
 * Processes a template string into a Template
 *
 * @param  {string} template Mustache template string
 * @return {Object}          Processed template object
 */
var getTemplate = function(template) {
  stack.clear();
  parser.reset();
  var templateStr = template.toString();
  templateStr = templateStr.replace(/\{\{\s+([#^\/])(\S*?)\s*\}\}/g, function(match, symbol, key) {
    return '{{' + symbol + key + '}}';
  });
  var tokenTree = hogan.parse(hogan.scan(templateStr));
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
