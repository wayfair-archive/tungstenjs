/**
 * Ampersand doesn't do event bubbling naturally, so we need to override trigger
 */
'use strict';

var getNewTrigger = function(base) {
  return function(name) {
    base.prototype.trigger.apply(this, arguments);
    // Collections naturally get events from their models so this only bubbles through relations
    if (this.parentProp && this.parent) {
      if (name.indexOf(':') > -1) {
        var splitName = name.split(':');
        splitName.splice(1, 0, this.parentProp);
        name = splitName.join(':');
        arguments[0] = name;
      } else {
        arguments[0] = name + ' ' + name + ':' + this.parentProp;
      }
      this.parent.trigger.apply(this.parent, arguments);
    }
  };
};

module.exports = getNewTrigger;