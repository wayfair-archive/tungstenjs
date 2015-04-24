/**
 * Standalone version of Ractive Types
 *
 * @license MIT
 * @source https://github.com/ractivejs/ractive/blob/master/src/config/types.js
 * Copyright (c) 2012-14 Rich Harris and contributors.
 *
 * (MIT LICENSE)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

var ractiveTypes = {
  TEXT: 1,
  INTERPOLATOR: 2,
  TRIPLE: 3,
  SECTION: 4,
  INVERTED: 5,
  CLOSING: 6,
  ELEMENT: 7,
  PARTIAL: 8,
  COMMENT: 9,
  DELIMCHANGE: 10,
  MUSTACHE: 11,
  TAG: 12,
  ATTRIBUTE: 13,
  CLOSING_TAG: 14,
  COMPONENT: 15,
  NUMBER_LITERAL: 20,
  STRING_LITERAL: 21,
  ARRAY_LITERAL: 22,
  OBJECT_LITERAL: 23,
  BOOLEAN_LITERAL: 24,
  GLOBAL: 26,
  KEY_VALUE_PAIR: 27,
  REFERENCE: 30,
  REFINEMENT: 31,
  MEMBER: 32,
  PREFIX_OPERATOR: 33,
  BRACKETED: 34,
  CONDITIONAL: 35,
  INFIX_OPERATOR: 36,
  INVOCATION: 40,
  SECTION_IF: 50,
  SECTION_UNLESS: 51,
  SECTION_EACH: 52,
  SECTION_WITH: 53,
  SECTION_IF_WITH: 54
};

module.exports = ractiveTypes;