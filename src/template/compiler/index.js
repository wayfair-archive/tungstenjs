'use strict';

const _ = require('underscore');
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
  const runningName = parser.getSection();
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

function trim(str) {
  if (str.trim) {
    return str.trim();
  }

  return str.replace(/^\s*|\s*$/g, '');
}

function atTag(tag, text, position) {
  for (let i = 0, l = tag.length; i < l; i++) {
    if (text.charAt(position + i) != tag.charAt(i)) {
      return false;
    }
  }

  return true;
}

const OUTSIDE_MUSTACHE = 0;
const AT_MUSTACHE_TAG = 1;
const IN_MUSTACHE_TAG = 2;
const tags = {
  open: '{{',
  close: '}}'
};

function changeDelimiters(text, index) {
  let close = '=' + tags.close;
  let closeIndex = text.indexOf(close, index);
  let delimiters = trim(
    text.substring(text.indexOf('=', index) + 1, closeIndex)
  ).split(' ');

  tags.open = delimiters[0];
  tags.close = delimiters[delimiters.length - 1];

  return closeIndex + close.length - 1;
}

const tagTypes = {
  '#': types.SECTION,
  '^': types.SECTION_UNLESS,
  '/': types.CLOSING_TAG,
  '!': types.COMMENT,
  '>': types.PARTIAL,
  '=': types.DELIMCHANGE,
  '_v': types.INTERPOLATOR,
  '{': types.TRIPLE,
  '&': types.TRIPLE
};

/**
 * Processes a template string into a Template
 *
 * @param  {string} template Mustache template string
 * @return {Object}          Processed template object
 */
function getTemplate(template, options) {
  stack.clear();
  parser.reset();
  tags.open = '{{';
  tags.close = '}}';

  let opts = typeof options === 'undefined' ? {} : options;
  opts.errorLevel = typeof opts.errorLevel === 'number' ? opts.errorLevel : logger.ERROR_LEVELS.EXCEPTION;
  opts.validateHtml = opts.validateHtml != null ? opts.validateHtml : 'strict';

  logger.setErrorLevel(opts.errorLevel);
  stack.setHtmlValidation(opts.validateHtml);

  let templateStr = trim(template.toString());
  let strLen = templateStr.length;
  let state = OUTSIDE_MUSTACHE;

  let buffer = '';
  let tagType;
  let inDynamicAttribute = 0;

  for (let i = 0; i < strLen; i++) {
    if (state === OUTSIDE_MUSTACHE) {
      if (atTag(tags.open, templateStr, i)) {
        --i;
        state = AT_MUSTACHE_TAG;
      } else {
        if (inDynamicAttribute) {
          stack.createObject(templateStr.charAt(i));
        } else {
          parser.write(templateStr.charAt(i));
        }
      }
    } else if (state === AT_MUSTACHE_TAG) {
      processBuffer();
      i += tags.open.length - 1;
      let controlChar;
      do {
        controlChar = templateStr.charAt(i + 1);
      } while (controlChar === ' ' && i++);

      let tag = tagTypes[controlChar];
      tagType = tag || types.INTERPOLATOR;
      if (tagType == '=') {
        i = changeDelimiters(templateStr, i);
        state = OUTSIDE_MUSTACHE;
      } else {
        if (tag) {
          i++;
        }
        state = IN_MUSTACHE_TAG;
      }
    } else {
      if (atTag(tags.close, templateStr, i)) {
        let tagText = trim(buffer);
        switch (tagType) {
          case types.COMMENT:
            // Leave control comments in as interpolators
            if (tagText.indexOf('w/') > -1) {
              stack.createObject({
                type: types.INTERPOLATOR,
                value: '!' + tagText
              });
            }
            break;
          case types.SECTION:
          case types.SECTION_UNLESS:
            if (parser.inAttributeName()) {
              inDynamicAttribute += 1;
            }
            stack.openElement(tagType, tagText);
            break;
          case types.CLOSING_TAG:
            if (inDynamicAttribute > 0) {
              inDynamicAttribute -= 1;
            }
            let elem = stack.peek();
            if (elem.value !== tagText) {
              logger.exception('Mispaired mustache tags. Found {{/' + tagText + '}} where a {{/' + elem.value + '}} was expected.');
            }
            stack.closeElement(elem);
            break;
          case types.PARTIAL:
          case types.TRIPLE:
          case types.INTERPOLATOR:
            stack.createObject({
              type: tagType,
              value: tagText
            });
            break;
        }
        buffer = '';
        i += tags.close.length - 1;
        state = OUTSIDE_MUSTACHE;
        if (tagType === types.TRIPLE && tags.close === '}}') {
          i++;
        }
      } else {
        buffer += templateStr.charAt(i);
      }
    }
  }

  if (stack.stack.length > 0) {
    logger.exception('Not all tags were closed properly', stack.stack);
  }

  let output = {};
  parser.end();
  output.templateObj = stack.getOutput();
  const Template = require('../template');
  output.template = new Template(output.templateObj);
  output.source = template;
  output.partials = _.keys(stack.partials);
  return output;
}

module.exports = getTemplate;
