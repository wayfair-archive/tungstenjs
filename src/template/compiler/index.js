'use strict';

const _ = require('underscore');
const parser = require('./parser');
const stack = require('./stack');
const logger = require('./compiler_logger');
const errors = require('../../utils/errors');
const processTemplate = require('./languages/mustache');
const Template = require('../template');

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
  opts.processingHTML = typeof opts.processingHTML === 'boolean' ? opts.processingHTML : true;

  logger.setStrictMode(opts.strict);
  logger.setOverrides(opts.logger);
  stack.setHtmlValidation(opts.validateHtml);

  let templateStr = template.toString();

  processTemplate(templateStr, opts);

  let output = {};

  if (stack.stack.length > 0) {
    logger.exception(errors.notAllTagsWereClosedProperly(), stack.stack);
  }

  parser.end();
  output.templateObj = stack.getOutput();
  output.template = new Template(output.templateObj);
  output.source = template;
  output.tokens = {};
  _.each(stack.tokens, function(values, type) {
    output.tokens[type] = _.keys(values);
  });
  return output;
}

module.exports = getTemplate;
