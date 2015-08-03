'use strict';

module.exports = {
  registry: require('./registry'),
  panel: require('./window_manager'),
  toString: {
    vtree: require('./vtree_to_string'),
    view: require('./view_to_string')
  },
  diff: require('./text_diff')
};