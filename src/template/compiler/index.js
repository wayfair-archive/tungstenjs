'use strict';

const _ = require('underscore');
const hogan = require('hogan.js/lib/compiler');
const types = require('../ractive_types');

const parser = require('./parser');
const stack = require('./stack');
const logger = require('./logger');

/**
 * Gets the current buffer from htmlparser and processes it
 * Used to handle section tags inside attribute values
 */
function processBuffer() {
  if (!parser.inRelevantState()) {
    return;
  }
  let runningName = parser.getSection();
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
    for (let i = 0; i < token.length; i++) {
      processHoganObject(token[i], inDynamicAttribute);
    }
    return;
  }

  // Any time we hit a mustache node, check the buffer
  if (token.tag !== '_t') {
    processBuffer();
  }

  let obj;
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
      logger.exception('Unexpected mustache type found', token);
  }
}

/**
 * Processes a template string into a Template
 *
 * @param  {string} template Mustache template string
 * @return {Object}          Processed template object
 */
function getTemplate(template, options) {
  stack.clear();
  parser.reset();

  let opts = typeof options === 'undefined' ? {} : options;
  opts.errorLevel = typeof opts.errorLevel === 'number' ? opts.errorLevel : logger.ERROR_LEVELS.EXCEPTION;
  opts.validateHtml = opts.validateHtml != null ? opts.validateHtml : 'strict';

  logger.setErrorLevel(opts.errorLevel);
  stack.setHtmlValidation(opts.validateHtml);

  let templateStr = template.toString();
  // Normalize whitespace within tokens
  // {{ #foo }} !== {{#foo}} in Hogan's eyes
  templateStr = templateStr.replace(/\{\{\s+([#^\/])(\S*?)\s*\}\}/g, function(match, symbol, key) {
    return '{{' + symbol + key + '}}';
  });
  let tokenTree = hogan.parse(hogan.scan(templateStr));
  processHoganObject(tokenTree);
  let output = {};

  if (stack.stack.length > 0) {
    logger.exception('Not all tags were closed properly', stack.stack);
  }

  parser.end();
  output.templateObj = stack.getOutput();
  const Template = require('../template');
  output.template = new Template(output.templateObj);
  output.source = template;
  output.partials = _.keys(stack.partials);
  return output;
};

module.exports = getTemplate;
