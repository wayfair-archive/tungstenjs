'use strict';

const _ = require('underscore');
const hogan = require('hogan.js/lib/compiler');
const types = require('../types');

const parser = require('./parser');
const stack = require('./stack');
const logger = require('./compiler_logger');

/**
 * Gets the current buffer from htmlparser and processes it
 * Used to handle section tags inside attribute values
 */
function processBuffer() {
  if (!parser.inRelevantState()) {
    return;
  }
  let runningName = parser.getSection();
  if (!runningName) {
    return;
  }
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
 * @param  {Object}  options            Compiler options
 * @param  {Object}  token              Nested mustache tree object
 * @param  {booelan} inDynamicAttribute Whether we are in a dynamic attribute
 */
function processHoganObject(options, token, inDynamicAttribute) {
  if (!token) {
    return;
  }
  if (Array.isArray(token)) {
    for (let i = 0; i < token.length; i++) {
      processHoganObject(options, token[i], inDynamicAttribute);
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
      let isLambda = options.lambdas[token.n.toString()] === true;
      let processingHTML = options.processingHTML;
      if (isLambda) {
        options.processingHTML = false;
      }
      processHoganObject(options, token.nodes, parser.inAttributeName());
      processBuffer();
      stack.closeElement(obj);
      if (isLambda) {
        options.processingHTML = processingHTML;
      }
      break;
    case '^':
      obj = stack.openElement(types.SECTION_UNLESS, token.n.toString());
      processHoganObject(options, token.nodes, parser.inAttributeName());
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
      if (inDynamicAttribute || !options.processingHTML) {
        stack.createObject(token.text.toString());
      } else {
        parser.write(token.text.toString());
      }
      break;
    case '\n':
      if (!options.processingHTML) {
        stack.createObject('\n');
      } else if (!inDynamicAttribute) {
        parser.write('\n');
      }
      break;
    default:
      logger.exception('Unexpected mustache type found', token);
  }
}

const delimiters = {
  open: '{{',
  close: '}}'
};

function atDelim(str, position, delim) {
  if (str.charAt(position) !== delim.charAt(0)) {
    return false;
  }
  for (let i = 1, l = delim.length; i < l; i++) {
    if (str.charAt(position + i) !== delim.charAt(i)) {
      return false;
    }
  }

  return true;
}

var templateTypes = {
  '#': types.SECTION,
  '^': types.SECTION_UNLESS,
  '/': types.CLOSING,
  '!': types.COMMENT,
  '>': types.PARTIAL,
  '{': types.TRIPLE,
  '&': types.TRIPLE,
  '=': types.DELIMCHANGE
};

var typeHasContent = {};
typeHasContent[types.SECTION] = true;
typeHasContent[types.SECTION_UNLESS] = true;

function getDelimiters(str) {
  let newDelims = str.split(/\s+/);
  return [
    newDelims[0],
    newDelims[1].substr(0, newDelims[1].length - 1)
  ];
}

const nonWhitespace = /\S/;
const nonWhitespaceNodes = {};
nonWhitespace[types.TEXT] = true;
nonWhitespace[types.INTERPOLATOR] = true;
nonWhitespace[types.TRIPLE] = true;

function trimWhitespace(line, lastWasNewline) {
  let whitespaceIndicies = [];
  let allWhitespace = true;
  let seenAnyTag = false;
  let newLine = new Array(line.length);
  for (let i = 0; i < line.length; i++) {
    let obj = line[i];
    newLine[i] = obj;
    if (typeof obj === 'string') {
      if (!nonWhitespace.test(obj)) {
        whitespaceIndicies.push(i);
      } else {
        allWhitespace = false;
      }
    } else {
      seenAnyTag = true;
      if (nonWhitespaceNodes[obj.type] === true) {
        allWhitespace = false;
      }
    }
  }

  if (allWhitespace && seenAnyTag) {
    for (let i = 0; i < whitespaceIndicies.length; i++) {
      let index = whitespaceIndicies[i];
      let obj = newLine[index];
      newLine[index] = {
        type: types.TEXT,
        original: obj,
        value: ''
      };
    }
  }

  return newLine;
}

function processTemplate(str, opts) {
  let p = 0;
  let c;
  let textBuffer = '';
  let inDynamicAttribute = false;
  let sectionIDs = {};
  let lineBuffer = [];

  function processLine() {
    if (!opts.preserveWhitespace) {
      lineBuffer = trimWhitespace(lineBuffer);
    }

    for (let i = 0; i < lineBuffer.length; i++) {
      let obj = lineBuffer[i];
      if (typeof obj === 'string') {
        if (inDynamicAttribute) {
          stack.createObject(obj);
        } else {
          parser.write(obj);
        }
      } else {
        processBuffer();
        obj.value = obj.value.trim();
        if (obj.type === types.CLOSING) {
          obj.id = sectionIDs[obj.value] && sectionIDs[obj.value].pop();
          let openObj = stack.peek();
          if (openObj.openingDynamicAttribute) {
            inDynamicAttribute = false;
          }
          if (openObj.processingHTML != null) {
            opts.processingHTML = openObj.processingHTML;
          }
          stack.closeElement(obj);
        } else if (typeHasContent[obj.type]) {
          obj = stack.openElement(obj.type, obj.value);
          if (opts.lambdas[obj.value] === true) {
            obj.processingHTML = opts.processingHTML;
            opts.processingHTML = false;
          }
          if (!sectionIDs[obj.value]) {
            sectionIDs[obj.value] = [];
          }
          sectionIDs[obj.value].push(obj.id);
          if (!inDynamicAttribute && parser.inAttributeName()) {
            inDynamicAttribute = true;
            obj.openingDynamicAttribute = true;
          }
        } else {
          stack.createObject(obj);
        }
      }
    }
    lineBuffer.length = 0;
  }

  while (c = str.charAt(p)) { // eslint-disable-line no-cond-assign
    if (atDelim(str, p, delimiters.open)) {
      if (textBuffer) {
        lineBuffer.push(textBuffer);
        textBuffer = '';
      }
      p += delimiters.open.length - 1;
      let obj = {
        type: null,
        value: ''
      };
      let closingDelim = delimiters.close;
      while (c = str.charAt(++p)) { // eslint-disable-line no-cond-assign
        if (atDelim(str, p, closingDelim)) {
          if (obj.type === types.DELIMCHANGE) {
            // Delimiter change tags change how we compile, but don't need to be processed onto the template
            let newDelims = getDelimiters(obj.value);
            delimiters.open = newDelims[0];
            delimiters.close = newDelims[1];
          } else {
            lineBuffer.push(obj);
          }
          p += closingDelim.length - 1;
          break;
        } else if (!obj.type) {
          // if tag type has not been found, proceed to the first non-whitespace character
          if (c !== ' ') {
            obj.type = templateTypes[c];
            if (!obj.type) {
              obj.type = types.INTERPOLATOR;
              obj.value += c;
            }

            if (c === '{') {
              closingDelim = '}' + closingDelim;
            }
          }
        } else {
          obj.value += c;
        }
      }
    } else {
      textBuffer += c;
      if (c === '\n') {
        lineBuffer.push(textBuffer);
        textBuffer = '';
        processLine();
      }
    }
    p += 1;
  }
  if (textBuffer) {
    lineBuffer.push(textBuffer);
  }
  processLine();
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
  opts.strict = typeof opts.strict === 'boolean' ? opts.strict : true;
  opts.preserveWhitespace = typeof opts.preserveWhitespace === 'boolean' ? opts.preserveWhitespace : false;
  opts.validateHtml = opts.validateHtml != null ? opts.validateHtml : 'strict';
  opts.logger = opts.logger != null ? opts.logger : {};

  let lambdas = {};
  if (_.isArray(opts.lambdas)) {
    for (let i = 0; i < opts.lambdas.length; i++) {
      lambdas[opts.lambdas[i]] = true;
    }
  }
  opts.lambdas = lambdas;
  opts.processingHTML = true;

  logger.setStrictMode(opts.strict);
  logger.setOverrides(opts.logger);
  stack.setHtmlValidation(opts.validateHtml);

  let templateStr = template.toString();

  // Normalize whitespace within tokens
  // {{ #foo }} !== {{#foo}} in Hogan's eyes
  if (opts.useNew === false) {
    templateStr = templateStr.replace(/\{\{\s+([#^\/>!])\s*(\S*?)\s*\}\}/g, function(match, symbol, key) {
      return '{{' + symbol + key + '}}';
    });
    let tokenTree = hogan.parse(hogan.scan(templateStr, null, opts.preserveWhitespace), templateStr, {preserveWhitespace: opts.preserveWhitespace});
    processHoganObject(opts, tokenTree);
  } else {
    processTemplate(templateStr, opts);
  }

  let output = {};

  if (stack.stack.length > 0) {
    logger.exception('Not all tags were closed properly', stack.stack);
  }

  parser.end();
  output.templateObj = stack.getOutput();
  const Template = require('../template');
  output.template = new Template(output.templateObj);
  output.source = template;
  output.tokens = {};
  _.each(stack.tokens, function(values, type) {
    output.tokens[type] = _.keys(values);
  });
  return output;
}

module.exports = getTemplate;
