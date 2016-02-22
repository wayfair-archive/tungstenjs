'use strict';

const _ = require('underscore');
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

const nonWhitespace = /\S/;
const nonWhitespaceNodes = {};
nonWhitespaceNodes[types.TEXT] = true;
nonWhitespaceNodes[types.INTERPOLATOR] = true;
nonWhitespaceNodes[types.TRIPLE] = true;

function trimWhitespace(line) {
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

  // console.log(line, allWhitespace, seenAnyTag);

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

  const delimiters = {
    open: '{{',
    close: '}}'
  };


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
        if (obj.skip === true) {
          continue;
        } else if (obj.type === types.CLOSING) {
          obj.id = sectionIDs[obj.value] && sectionIDs[obj.value].pop();
          let openObj = stack.peek();
          if (openObj) {
            if (openObj.openingDynamicAttribute) {
              inDynamicAttribute = false;
            }
            if (openObj.processingHTML != null) {
              opts.processingHTML = openObj.processingHTML;
            }
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
            let newDelims = obj.value.trim().split(/\s+/);
            delimiters.open = newDelims[0];
            delimiters.close = newDelims[1];
            obj.skip = true;
          } else if (obj.type === types.COMMENT) {
            if (obj.value.substr(0, 2) === 'w/') {
              obj.type = types.INTERPOLATOR;
              obj.value = '!' + obj.value;
            } else {
              obj.skip = true;
            }
          }
          lineBuffer.push(obj);
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
            } else if (c === '=') {
              closingDelim = '=' + closingDelim;
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

  processTemplate(templateStr, opts);

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
