'use strict';

module.exports.childViews = function(childViews) {
  for (var selector in childViews) {
    if (Object.keys(childViews[selector].prototype).indexOf('el') !== -1) {
      throw new Error('Child views cannot contain property "el"');
    }
    if (selector.substr(0, 4) === '.js-') {
      throw new Error('Child views cannot start with a period: "' + selector + '"');
    } else if (selector.substr(0, 3) !== 'js-') {
      throw new Error('Child views must start with "js-": "' + selector + '"');
    }
  }
};
