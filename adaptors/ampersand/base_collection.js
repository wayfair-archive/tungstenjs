/**
 * Base Collection - Provides generic reusable methods that child collections can inherit from
 */

'use strict';
var AmpersandCollection = require('ampersand-collection');
var eventBubbler = require('./event_bubbler');

/**
 * BaseCollection
 *
 * @constructor
 * @class BaseCollection
 */
var BaseCollection = AmpersandCollection.extend({
  tungstenCollection: true,

  trigger: eventBubbler(AmpersandCollection)
});

module.exports = BaseCollection;
