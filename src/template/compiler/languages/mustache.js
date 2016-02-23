'use strict';

const types = require('../../types');
const parser = require('../parser');
const stack = require('../stack');

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

  if (allWhitespace && seenAnyTag) {
    for (let i = 0; i < whitespaceIndicies.length; i++) {
      let index = whitespaceIndicies[i];
      let obj = newLine[index];
      newLine[index] = {
        type: types.TEXT,
        original: obj
      };
    }
  }

  return newLine;
}

let inDynamicAttribute = false;
let sectionIDs = {};
let lineBuffer = [];
function processLine(opts) {
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
      parser.processBuffer();
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

function processTemplate(str, opts) {
  let p = 0;
  let c;
  let textBuffer = '';
  const delimiters = {
    open: '{{',
    close: '}}'
  };
  // Reset running variables, just in case
  inDynamicAttribute = false;
  sectionIDs = {};
  lineBuffer = [];

  const strLen = str.length;

  while (p < strLen) {
    if (atDelim(str, p, delimiters.open)) {
      if (textBuffer) {
        lineBuffer.push(textBuffer);
        textBuffer = '';
      }
      p += delimiters.open.length;
      let obj = {
        type: null,
        value: ''
      };
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
      c = str.charAt(p);
      textBuffer += c;
      if (c === '\n') {
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
}

module.exports = processTemplate;
