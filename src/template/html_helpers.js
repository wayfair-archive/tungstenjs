'use strict';

const _ = require('underscore');

// List of elements that have no closing tag or slash
const noClosing = {
  'br': true,
  'hr': true,
  'img': true,
  'input': true,
  'meta': true,
  'link': true
};
// List of elements with a closing slash, but no closing tag
const selfClosing = {
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
const formTags = {
  input: true,
  option: true,
  optgroup: true,
  select: true,
  button: true,
  datalist: true,
  textarea: true
};

const openImpliesClose = {
  tr: {
    tr: true,
    th: true,
    td: true
  },
  th: {
    th: true
  },
  td: {
    thead: true,
    th: true,
    td: true
  },
  body: {
    head: true,
    link: true,
    script: true
  },
  li: {
    li: true
  },
  p: {
    p: true
  },
  h1: {
    p: true
  },
  h2: {
    p: true
  },
  h3: {
    p: true
  },
  h4: {
    p: true
  },
  h5: {
    p: true
  },
  h6: {
    p: true
  },
  select: formTags,
  input: formTags,
  output: formTags,
  button: formTags,
  datalist: formTags,
  textarea: formTags,
  option: {
    option: true
  },
  optgroup: {
    optgroup: true
  }
};

const requiredParents = {
  body: {
    html: true
  },
  tr: {
    thead: true,
    tbody: true,
    tfoot: true
  },
  caption: {
    table: function(parent) {
      // captions must be the first element
      if (_.size(parent.childTags) === 0) {
        return true;
      }
      return 'A caption tag must be the first child of its table';
    }
  },
  colgroup: {
    table: function(parent) {
      for (let i = 0; i < parent.children.length; i++) {
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
    table: true
  },
  tfoot: {
    table: true
  },
  tbody: {
    table: true
  },
  td: {
    tr: true
  },
  th: {
    tr: true
  }
};

const standardsParents = _.defaults({
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
  optgroup: {
    select: true
  },
  option: {
    select: true,
    datalist: true,
    optgroup: true
  },
  legend: {
    fieldset: function(parent) {
      // captions must be the first element
      if (_.size(parent.childTags) === 0) {
        return true;
      }
      return 'A legend tag must be the first child of its fieldset';
    }
  }
}, requiredParents);

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

function isAllowedChild(parent, child, allowedParents) {
  if (!allowedParents[child]) {
    // if we haven't set up explicit data, assume it's fine
    return true;
  }
  let isAllowed = allowedParents[child][parent.tagName];
  if (typeof isAllowed === 'function') {
    return isAllowed(parent);
  }
  return Boolean(isAllowed) || false;
}

function isValidChild(parentNode, childTagName, enforceStandards) {
  if (impliedCloseTag(parentNode.tagName, childTagName)) {
    return 'Opening a ' + childTagName + ' implicitly closes a ' + parentNode.tagName + ' tag and all close tags must be explicit';
  }

  let allowedParents = enforceStandards ? standardsParents : requiredParents;
  let allowedChild = isAllowedChild(parentNode, childTagName, allowedParents);
  if (allowedChild !== true) {
    if (typeof allowedChild === 'string') {
      return allowedChild;
    } else {
      return 'A ' + childTagName + ' may not be placed within a ' + parentNode.tagName + ', only within one of the following tags: ' + _.keys(allowedParents[childTagName]).join(', ');
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
