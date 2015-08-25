'use strict';

module.exports = {
  registry: require('./registry'),
  panel: require('./window_manager'),
  vtreeToString: require('./vtree_to_string'),
  diffVtreeAndElem: require('./diff_dom_and_vdom'),
  diff: require('./text_diff')
};