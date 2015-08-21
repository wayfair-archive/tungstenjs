'use strict';

// List of elements that have no closing tag or slash
var noClosing = {
  'br': true,
  'hr': true,
  'img': true,
  'input': true,
  'meta': true,
  'link': true
};
// List of elements with a closing slash, but no closing tag
var selfClosing = {
  'area': true,
  'base': true,
  'col': true,
  'command': true,
  'embed': true,
  'hr': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true
};

var impliedClose = {
  li: {
    li: true
  },
  dt: {
    dt: true,
    dd: true
  },
  dd: {
    dt: true,
    dd: true
  },
  p: {
    address: true,
    article: true,
    aside: true,
    blockquote: true,
    div: true,
    dl: true,
    fieldset: true,
    footer: true,
    form: true,
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: true,
    header: true,
    hgroup: true,
    hr: true,
    main: true,
    menu: true,
    nav: true,
    ol: true,
    p: true,
    pre: true,
    section: true,
    table: true,
    ul: true
  },
  rt: {
    rt: true,
    rp: true
  },
  rp: {
    rt: true,
    rp: true
  },
  optgroup: {
    optgroup: true
  },
  option: {
    option: true,
    optgroup: true
  },
  thead: {
    tbody: true,
    tfoot: true
  },
  tbody: {
    tbody: true,
    tfoot: true
  },
  tfoot: {
    tbody: true
  },
  tr: {
    tr: true,
    tbody: true
  },
  td: {
    td: true,
    th: true,
    tr: true
  },
  th: {
    td: true,
    th: true,
    tr: true
  }
};

/**
 * Many tags may have their close tag omitted depending on the next open tag
 * This checks if this is one of those cases
 *
 * @param  {String} tag  Currently open tag
 * @param  {String} next Next opening tag
 *
 * @return {Boolean}     Whether the close tag would be implied
 */
function impliedCloseTag(tag, next) {
  return impliedClose[tag] && impliedClose[tag][next] || false;
}

function isValidChild(parent, child) {
  return !impliedCloseTag(parent, child);
}

module.exports = {
  tags: {
    noClosing: noClosing,
    selfClosing: selfClosing
  },
  validation: {
    impliedCloseTag: impliedCloseTag,
    isValidChild: isValidChild
  }
};