/**
 * Ampersand doesn't do event bubbling naturally, so we need to override trigger
 */
'use strict';

var getNewTrigger = function(base) {
  var bubbleEvent = function(parent, parentProp, args) {
    var name = args[0];
    if (name.indexOf(' ') > -1) {
      // If a multiple events are passed in, split them up and recurse individually
      var names = name.split(/\s+/);
      for (var i = 0; i < names.length; i++) {
        var otherArgs = args.slice(1);
        bubbleEvent(parent, [names[i]].concat(otherArgs));
      }
    } else if (name.indexOf(':') > -1) {
      // If we're bubbling a relation event, add this relation into the chain and bubble
      var splitName = name.split(':');
      splitName.splice(1, 0, parentProp);
      args[0] = splitName.join(':');
      parent.trigger.apply(parent, args);
    } else if (name === 'change') {
      // Change is unique because the first argument should be the model that was changed
      // Since we bubble a raw change event for each parent model, the first arg needs to change
      // Bubble relation changed with existing context
      args[0] = name + ':' + parentProp;
      parent.trigger.apply(parent, args);
      // Bubble root change with parent as context
      args[0] = name;
      args[1] = parent;
      parent.trigger.apply(parent, args);
    } else {
      // If it's a regular non-change event, add the relation on and bubble
      args[0] = name + ':' + parentProp;
      parent.trigger.apply(parent, args);
    }
  };

  return function() {
    base.prototype.trigger.apply(this, arguments);
    // Collections naturally get events from their models so this only bubbles through relations
    if (this.parentProp && this.parent) {
      bubbleEvent(this.parent, this.parentProp, Array.prototype.slice.call(arguments));
    }
  };
};

module.exports = getNewTrigger;