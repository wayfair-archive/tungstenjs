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

module.exports = {
  tags: {
    noClosing: noClosing,
    selfClosing: selfClosing
  }
};