'use strict';

/* global describe, it, expect, require, beforeEach */
var Adaptor = require('../../../../adaptors/backbone');

var BaseModel = Adaptor.Model;
var BaseCollection = Adaptor.Collection;

var ChildModel = BaseModel.extend({
  defaults: {
    'testProp': 0
  }
}, {debugName: 'ChildModel'});

var ParentModel = BaseModel.extend({
  defaults: {
    'child': {}
  },
  relations: {
    'child': ChildModel
  }
}, {debugName: 'ParentModel'});

var GrandParentModel = BaseModel.extend({
  defaults: {
    'child': {}
  },
  relations: {
    'child': ParentModel
  }
}, {debugName: 'GrandParentModel'});

var Collection = BaseCollection.extend({
  model: ParentModel
}, {debugName: 'Collection'});

var CollectionModel = BaseModel.extend({
  relations: {
    'arr': Collection
  }
}, {debugName: 'CollectionModel'});

var logEvents = function(model) {
  var eventsObj = {};
  model.on('all', function(eventName, firstArg) {
    eventsObj[eventName] = firstArg;
  });

  return {
    getNumEvents: function() {
      return Object.keys(eventsObj).length;
    },
    getEvent: function(name) {
      return eventsObj[name];
    },
    debug: function() {
      console.log(Object.keys(eventsObj));
    },
    reset: function() {
      eventsObj = {};
    }
  };
};

describe('tungsten.js public API', function() {
  beforeEach(function() {
    this.addMatchers({
      toBeInstanceOf: function(expectedInstance) {
        var actual = this.actual;
        var notText = this.isNot ? ' not' : '';
        this.message = function() {
          return 'Expected ' + actual.constructor.name + notText + ' is instance of ' + expectedInstance.name;
        };
        return actual instanceof expectedInstance;
      }
    });
  });

  describe('Relation Autocreation', function() {
    it('should create relation objects when not provided', function() {
      var model = new GrandParentModel();

      expect(model.get('child')).toBeInstanceOf(ParentModel);
      expect(model.get('child:child')).toBeInstanceOf(ChildModel);
    });

    it('should use passed relations of the correct type', function() {
      var childModel = new ChildModel({
        testProp: 0
      });
      var model = new GrandParentModel({
        child: {
          child: childModel
        }
      });

      expect(model.get('child:child')).toBe(childModel);

      var parentModel = model.get('child');
      model = new GrandParentModel({
        child: parentModel
      });

      expect(model.get('child')).toBe(parentModel);
      // childModel should still be on parentModel from initial creation
      expect(model.get('child:child')).toBe(childModel);
    });

    it('should bubble events through relations', function() {
      var model = new GrandParentModel();

      var events = logEvents(model);
      var childEvents = logEvents(model.get('child'));
      var grandChildEvents = logEvents(model.get('child:child'));

      model.get('child:child').trigger('testEvent', 'prop');
      expect(events.getNumEvents()).toBe(3);
      expect(events.getEvent('testEvent')).toBe('prop');
      expect(events.getEvent('testEvent:child:child')).toBe('prop');
      expect(events.getEvent('testEvent:child')).toBe('prop');

      expect(childEvents.getNumEvents()).toBe(2);
      expect(childEvents.getEvent('testEvent:child')).toBe('prop');
      expect(childEvents.getEvent('testEvent')).toBe('prop');

      expect(grandChildEvents.getNumEvents()).toBe(1);
      expect(grandChildEvents.getEvent('testEvent')).toBe('prop');

      events.reset();
      childEvents.reset();
      grandChildEvents.reset();

      model.get('child').trigger('testEvent', 'prop');
      expect(events.getNumEvents()).toBe(2);
      expect(events.getEvent('testEvent')).toBe('prop');
      expect(events.getEvent('testEvent:child')).toBe('prop');

      expect(childEvents.getNumEvents()).toBe(1);
      expect(childEvents.getEvent('testEvent')).toBe('prop');

      expect(grandChildEvents.getNumEvents()).toBe(0);
    });

    it('should pass correct arguments for "change" events', function() {
      // The first argument for a change event should be the changed model
      // Since we bubble a 'change' event for each parent model as well as the originator
      //   the parent models should indicate that they changed
      // This allows listeners to expect the model that they are specifically
      //   listening for at any nested depth rather than getting the originally changed model

      var model = new GrandParentModel();

      var parentModel = model.get('child');
      var childModel = parentModel.get('child');

      var events = logEvents(model);
      var childEvents = logEvents(parentModel);
      var grandChildEvents = logEvents(childModel);

      model.set('child:child:testProp', 1);
      expect(events.getNumEvents()).toBe(4);
      expect(events.getEvent('change')).toBe(model);
      expect(events.getEvent('change:child')).toBe(parentModel);
      expect(events.getEvent('change:child:child')).toBe(childModel);
      expect(events.getEvent('change:child:child:testProp')).toBe(childModel);

      expect(childEvents.getNumEvents()).toBe(3);
      expect(childEvents.getEvent('change')).toBe(parentModel);
      expect(childEvents.getEvent('change:child')).toBe(childModel);
      expect(childEvents.getEvent('change:child:testProp')).toBe(childModel);

      expect(grandChildEvents.getNumEvents()).toBe(2);
      expect(grandChildEvents.getEvent('change')).toBe(childModel);
      expect(grandChildEvents.getEvent('change:testProp')).toBe(childModel);
    });

    it('should declare a naive parent for backwards-compatibility', function() {
      var model = new GrandParentModel();

      var parentModel = model.get('child');
      var childModel = model.get('child:child');

      expect(childModel.parent).toBe(parentModel);
      expect(parentModel.parent).toBe(model);

      var newParent = new ParentModel({
        child: childModel
      });

      expect(childModel.parent).toBe(newParent);
      expect(childModel.parent).not.toBe(parentModel);
    });

    it('should bubble events to all parents', function() {
      var model = new GrandParentModel();

      var parentModel = model.get('child');
      var childModel = model.get('child:child');

      var newParentModel = new ParentModel({
        child: childModel
      });

      var events = logEvents(model);
      var parentEvents = logEvents(parentModel);
      var newParentEvents = logEvents(newParentModel);

      model.set('child:child:testProp', 1);
      expect(events.getNumEvents()).toBe(4);
      expect(events.getEvent('change')).toBe(model);
      expect(events.getEvent('change:child')).toBe(parentModel);
      expect(events.getEvent('change:child:child')).toBe(childModel);
      expect(events.getEvent('change:child:child:testProp')).toBe(childModel);

      expect(parentEvents.getNumEvents()).toBe(3);
      expect(parentEvents.getEvent('change')).toBe(parentModel);
      expect(parentEvents.getEvent('change:child')).toBe(childModel);
      expect(parentEvents.getEvent('change:child:testProp')).toBe(childModel);

      expect(newParentEvents.getNumEvents()).toBe(3);
      expect(newParentEvents.getEvent('change')).toBe(newParentModel);
      expect(newParentEvents.getEvent('change:child')).toBe(childModel);
      expect(newParentEvents.getEvent('change:child:testProp')).toBe(childModel);
    });

    it('should use the existing model for updates', function() {
      var model = new GrandParentModel();

      var parentModel = model.get('child');
      var childModel = parentModel.get('child');

      var events = logEvents(model);

      // Since child already exists, the given properties should be merged into the existing model
      model.set('child:child', {
       testProp: 0
      });
      expect(parentModel.get('child')).toBe(childModel);
      expect(parentModel.get('child:testProp')).toBe(0);
      // Since no properties changed, no events should have fired
      expect(events.getNumEvents()).toBe(0);

      events.reset();

      model.set('child:child', {
       testProp: 1
      });
      expect(parentModel.get('child')).toBe(childModel);
      expect(parentModel.get('child:testProp')).toBe(1);
      // same events as tested above
      expect(events.getNumEvents()).toBe(4);
      expect(events.getEvent('change')).toBe(model);
      expect(events.getEvent('change:child')).toBe(parentModel);
      expect(events.getEvent('change:child:child')).toBe(childModel);
      expect(events.getEvent('change:child:child:testProp')).toBe(childModel);

    });

    it('should allow a relation to be replaced', function() {
      var model = new GrandParentModel();

      var parentModel = model.get('child');

      var events = logEvents(model);

      // Create a new ChildModel with the same properties
      var newChild = new ChildModel({
        testProp: 0
      });

      model.set('child:child', newChild);
      expect(parentModel.get('child')).toBe(newChild);
      expect(parentModel.get('child:testProp')).toBe(0);

      // No properties changed, so we only get the replace event
      expect(events.getNumEvents()).toBe(1);
      expect(events.getEvent('replace:child:child')).toBe(newChild);

      events.reset();

      // Create a new ChildModel with different properties
      var newChildTwo = new ChildModel({
        testProp: 1
      });

      model.set('child:child', newChildTwo);
      expect(parentModel.get('child')).toBe(newChildTwo);
      expect(parentModel.get('child:testProp')).toBe(1);

      // A properties changed, so we get the replace event as well as change events
      expect(events.getNumEvents()).toBe(5);
      expect(events.getEvent('change')).toBe(model);
      expect(events.getEvent('change:child')).toBe(parentModel);
      expect(events.getEvent('change:child:child')).toBe(newChildTwo);
      expect(events.getEvent('change:child:child:testProp')).toBe(newChildTwo);
      expect(events.getEvent('replace:child:child')).toBe(newChildTwo);
    });

    it('bubbles events based on current state of attachment', function() {
      var model = new GrandParentModel();

      var events = logEvents(model);

      var childModel = model.get('child');

      childModel.trigger('test:child');
      expect(events.getNumEvents()).toBe(1);

      // silently detach childModel so that no stray events fire
      model.set('child', null, {silent: true});

      events.reset();
      childModel.trigger('test:child');
      expect(events.getNumEvents()).toBe(0);
      // silently detach childModel so that no stray events fire
      model.set('child', childModel, {silent: true});

      events.reset();
      childModel.trigger('test:child');
      expect(events.getNumEvents()).toBe(1);
    });
  });

  it('handles collection events', function() {
    var modelOne = new GrandParentModel({id: 1});
    var modelTwo = new GrandParentModel({id: 2});

    var model = new CollectionModel({
      arr: [modelOne, modelTwo]
    });

    var events = logEvents(model);
    var collection = model.get('arr');
    // resetting the collection directly
    collection.reset([modelOne]);

    expect(events.getNumEvents()).toBe(1);
    expect(events.getEvent('reset:arr')).toBe(collection);

    events.reset();

    // resetting the collection indirectly using reset option
    model.set('arr', [modelTwo], {reset: true});

    expect(events.getNumEvents()).toBe(1);
    expect(events.getEvent('reset:arr')).toBe(collection);

    events.reset();

    // Setting the collection directly
    collection.set(modelOne);

    expect(events.getNumEvents()).toBe(4);
    expect(events.getEvent('remove:arr')).toBe(modelTwo);
    expect(events.getEvent('add:arr')).toBe(modelOne);
    expect(events.getEvent('sort:arr')).toBe(collection);
    expect(events.getEvent('update:arr')).toBe(collection);

    events.reset();
    // Setting the collection indirectly
    model.set('arr', [modelTwo]);

    expect(events.getNumEvents()).toBe(4);
    expect(events.getEvent('remove:arr')).toBe(modelOne);
    expect(events.getEvent('add:arr')).toBe(modelTwo);
    expect(events.getEvent('sort:arr')).toBe(collection);
    expect(events.getEvent('update:arr')).toBe(collection);
  });
});