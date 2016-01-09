'use strict';

var _ = require('underscore');

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

// If any of the values are opened within the parent, the parent should be implicitly closed
var formTags = {
  input: true,
  option: true,
  optgroup: true,
  select: true,
  button: true,
  datalist: true,
  textarea: true
};

var openImpliesClose = {
  tr: { tr:true, th:true, td:true },
  th: { th:true },
  td: { thead:true, th:true, td:true },
  body: { head:true, link:true, script:true },
  li: { li:true },
  p: { p:true },
  h1: { p:true },
  h2: { p:true },
  h3: { p:true },
  h4: { p:true },
  h5: { p:true },
  h6: { p:true },
  select: formTags,
  input: formTags,
  output: formTags,
  button: formTags,
  datalist: formTags,
  textarea: formTags,
  option: { option:true },
  optgroup: { optgroup:true }
};

var allowedParents = {
  body: {
    html: true
  },
  li: {
    ol: true,
    ul: true
  },
  dt: {
    dl: true
  },
  dd: {
    dl: true
  },
  figcaption: {
    figure: true
  },
  rb: {
    ruby: true
  },
  rt: {
    ruby: true,
    rtc: true
  },
  rtc: {
    ruby: true
  },
  rp: {
    ruby: true
  },
  param: {
    object: true
  },
  source: {
    audio: true,
    video: true
  },
  track: {
    audio: true,
    video: true
  },
  tr: {
    thead: true,
    tbody: true,
    tfoot: true
  },
  caption: {
    table: function(parent) {
      // captions must be the first element
      if (parent.children.length === 0) {
        return true;
      }
      return 'A caption tag must be the first child of its table';
    }
  },
  colgroup: {
    table: function(parent) {
      for (var i = 0; i < parent.children.length; i++) {
        switch (parent.children[i].tagName) {
          case 'thead':
          case 'tbody':
          case 'tfoot':
            return 'A colgroup must be before any ' + parent.children[i].tagName + ' elements';
        }
      }
      return true;
    }
  },
  col: {
    colgroup: true
  },
  thead: {
    table: function(parent) {
      if (parent.childTags.tbody) {
        return 'A thead must be before any tbody elements';
      } else if (parent.childTags.tfoot) {
        return 'A thead must be before any tfoot elements';
      } else if (parent.childTags.thead) {
        return 'There may only be one thead element per table';
      }
      return true;
    }
  },
  tfoot: {
    table: function(parent) {
      if (parent.childTags.tfoot) {
        return 'There may only be one tfoot element per table';
      }
      return true;
    }
  },
  tbody: {
    table: true
  },
  td: {
    tr: true
  },
  th: {
    tr: true
  },
  optgroup: {
    select: true
  },
  option: {
    select: true,
    datalist: true,
    optgroup: true
  // },
  // legend: {
  //   fieldset: function(parent) {
  //     // captions must be the first element
  //     if (parent.children.length === 0) {
  //       return true;
  //     }
  //     return 'A legend tag must be the first child of its fieldset';
  //   }
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
  return openImpliesClose[next] && openImpliesClose[next][tag] || false;
}

function isAllowedChild(parent, child) {
  if (!allowedParents[child]) {
    // if we haven't set up explicit data, assume it's fine
    return true;
  }
  var isAllowed = allowedParents[child][parent.tagName];
  if (typeof isAllowed === 'function') {
    return isAllowed(parent);
  }
  return Boolean(isAllowed) || false;
}

function isValidChild(parentNode, childTagName) {
  if (impliedCloseTag(parentNode.tagName, childTagName)) {
    return 'Opening a ' + childTagName + ' implicitly closes a ' + parentNode.tagName + ' tag and all close tags must be explicit';
  }
  var allowedChild = isAllowedChild(parentNode, childTagName);
  if (allowedChild !== true) {
    if (typeof allowedChild === 'string') {
      return allowedChild;
    } else {
      return 'A ' + childTagName + ' may only be placed within one of the following tags: ' + _.keys(allowedParents[childTagName]).join(', ');
    }
  }
  return true;
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
