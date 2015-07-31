'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

var eventBus = _.extend({}, Backbone.Events);
eventBus.CHANGED_REGISTERED = 'CHANGED_REGISTERED';

module.exports = eventBus;