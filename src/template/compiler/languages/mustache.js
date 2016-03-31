'use strict';

const types = require('../../types');
const parser = require('../parser');
const stack = require('../stack');
const logger = require('../compiler_logger');

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
nonWhitespaceNodes[types.INTERPOLATOR] = true;
nonWhitespaceNodes[types.TRIPLE] = true;

/**
 * Checks if the string has a delimiter at the given position
 * @param  {String} str      String to check
 * @param  {Number} position Position to start at
 * @param  {String} delim    Delimiter to check for
 * @return {Boolean}
 */
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

/**
 * Trims whitespace in accordance with Mustache rules
 * Leaves reference nodes behind for lambdas and the debugger
 *
 * @param  {Array<String>} line Symbols for this line
 * @return {Array<String>}      Trimmed symbols for this line
 */
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
    // Bail out if we've seen a non-whitespace
    if (!allWhitespace) {
      return line;
    }
  }

  // Remove the whitespace nodes if this line consists of:
  //  - only whitespace text
  //  - no Interpolators or Unescaped Interpolators
  //  - at least one Mustache tag
  if (allWhitespace && seenAnyTag) {
    for (let i = 0; i < whitespaceIndicies.length; i++) {
      let index = whitespaceIndicies[i];
      let obj = newLine[index];
      newLine[index] = {
        type: types.TEXT,
        original: obj,
        length: obj.length
      };
    }
  }

  return newLine;
}

let inDynamicAttribute = false;
let mustacheClosureIDs = {};
let lineBuffer = [];
let errorPosition = 0;
let errorInParser = false;
let templateString;
function processLine(opts) {
  if (!opts.preserveWhitespace) {
    lineBuffer = trimWhitespace(lineBuffer);
  }

  for (let i = 0; i < lineBuffer.length; i++) {
    let obj = lineBuffer[i];
    let len = obj.length;
    if (typeof obj === 'string') {
      if (inDynamicAttribute || opts.processingHTML === false) {
        stack.createObject(obj);
      } else {
        errorInParser = true;
        parser.write(obj);
        errorInParser = false;
      }
    } else {
      parser.processBuffer();
      if (obj.skip === true) {
        continue;
      } else if (obj.type === types.CLOSING) {
        obj.id = mustacheClosureIDs[obj.value] && mustacheClosureIDs[obj.value].pop();
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
        if (!mustacheClosureIDs[obj.value]) {
          mustacheClosureIDs[obj.value] = [];
        }
        mustacheClosureIDs[obj.value].push(obj.id);
        if (!inDynamicAttribute && parser.inAttributeName()) {
          inDynamicAttribute = true;
          obj.openingDynamicAttribute = true;
        }
      } else {
        stack.createObject(obj);
      }
    }
    errorPosition += len;
  }
  lineBuffer.length = 0;
}

function repeatChar(c, n) {
  return (new Array(n + 1).join(c));
}

function errorContext() {
  var context = 50;
  var parserOffset = errorInParser ? parser.getPosition() : 0;
  var start = Math.max(0, parserOffset + errorPosition - context);
  var contextStr = templateString.substr(start, context * 2 + 1);
  if (errorPosition < context) {
    contextStr = repeatChar(' ', context + 1 - errorPosition) + contextStr;
  }
  var contextLines = contextStr.split('\n');
  var p = 0;
  var newlineOffset = 0;
  contextStr = '';
  for (var i = 0; i < contextLines.length; i++) {
    contextStr += contextLines[i] + '\\n';
    p += contextLines[i].length + 2;
    if (p <= context + 1) {
      newlineOffset += 1;
    }
  }

  return '\n' + contextStr + '\n' +
    repeatChar(' ', context + newlineOffset) + '^' + repeatChar('-', context);
}

function processTemplate(str, opts) {
  let p = 0;
  let c;
  let textBuffer = '';
  const delimiters = {
    open: '{{',
    close: '}}'
  };

  // Set function to logger to show context around any parsing error
  logger.setContextFunction(errorContext);

  templateString = str;
  inDynamicAttribute = false;
  mustacheClosureIDs = {};
  lineBuffer = [];
  errorPosition = 0;
  errorInParser = false;

  const strLen = str.length;

  while (p < strLen) {
    if (atDelim(str, p, delimiters.open)) {
      if (textBuffer) {
        lineBuffer.push(textBuffer);
        textBuffer = '';
      }
      let obj = {
        type: null,
        value: '',
        start: p
      };
      p += delimiters.open.length;
      let closingDelim = delimiters.close;
      while (p < strLen) {
        if (atDelim(str, p, closingDelim)) {
          obj.value = obj.value.trim();
          if (obj.type === types.DELIMCHANGE) {
            // {{=| |=}}
            // Changes how we parse, but is left off output
            let newDelims = obj.value.split(/\s+/);
            delimiters.open = newDelims[0];
            delimiters.close = newDelims[1];
            obj.skip = true;
          } else if (obj.type === types.COMMENT) {
            // {{! }}
            if (obj.value.substr(0, 2) === 'w/') {
              // Control comments should be left on
              obj.type = types.INTERPOLATOR;
              obj.value = '!' + obj.value;
            } else {
              // All others should be left off the output
              obj.skip = true;
            }
          }
          obj.length = (p - obj.start) + closingDelim.length;
          lineBuffer.push(obj);
          p += closingDelim.length - 1;
          break;
        } else {
          c = str.charAt(p);
          if (!obj.type) {
            // while tag type has not been found, wait for the first non-whitespace character
            if (c !== ' ') {
              obj.type = templateTypes[c];
              if (!obj.type) {
                obj.type = types.INTERPOLATOR;
                obj.value += c;
              }

              // Some cases have an extra closing character to search for
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
        p += 1;
      }
    } else {
      // For any non-mustache character, add it to the buffer
      c = str.charAt(p);
      textBuffer += c;
      if (c === '\n') {
        // When we hit a newline, process the line for whitespace rules
        lineBuffer.push(textBuffer);
        textBuffer = '';
        processLine(opts);
      }
    }
    p += 1;
  }
  if (textBuffer) {
    lineBuffer.push(textBuffer);
  }
  processLine(opts);

  // Clear logger context function for next run
  logger.setContextFunction();
}

module.exports = processTemplate;
