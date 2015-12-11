var Backbone = require('backbone');

// List of Backbone's native events that shouldn't bubble wholesale
const builtInEvents = {
  add: true,
  remove: true,
  update: true,
  reset: true,
  sort: true,
  destroy: true,
  request: true,
  sync: true,
  error: true,
  route: true
};

var bubbleEvent = function(parent, parentProp, args) {
  var name = args[0];
  if (name.indexOf(' ') > -1) {
    // If a multiple events are passed in, split them up and recurse individually
    var names = name.split(/\s+/);
    for (let i = 0; i < names.length; i++) {
      var otherArgs = args.slice(1);
      bubbleEvent(parent, parentProp, [names[i]].concat(otherArgs));
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
  } else if (builtInEvents[name] === true) {
    // If it's a built-in non-change event, add the relation on and bubble
    args[0] = name + ':' + parentProp;
    parent.trigger.apply(parent, args);
  } else {
    // If it's a custom event, add the relation on and a raw form bubble
    args[0] = name + ' ' + name + ':' + parentProp;
    parent.trigger.apply(parent, args);
  }
};

var originalTrigger = Backbone.Events.trigger;
var newTrigger = function() {
  originalTrigger.apply(this, arguments);
  // Collections naturally get events from their models so this only bubbles through relations
  if (this.parentProp && this.parent) {
    bubbleEvent(this.parent, this.parentProp, Array.prototype.slice.call(arguments));
  }
};

module.exports = {
  bubbleEvent,
  newTrigger
};
