'use strict';

var eventBubbler = require('../../../adaptors/ampersand/event_bubbler');

describe('event_bubbler public api', function() {
  it('should be a function', function() {
    expect(eventBubbler).to.be.a('function');
    expect(eventBubbler).to.have.length(1);
  });
  it('should return a function', function() {
    var output = eventBubbler();
    expect(output).to.be.a('function');
    expect(output).to.have.length(0);
  });
  describe('should bubble events', function() {
    var base, model, parent;
    beforeEach(function() {
      base = {
        prototype: {
          trigger: jasmine.createSpy('baseTrigger')
        }
      };
      parent = {
        trigger: jasmine.createSpy('parentTrigger')
      };
      model = {
        parentProp: 'model',
        parent: parent
      };
    });
    it('should call trigger even with no parent', function() {
      var trigger = eventBubbler(base);
      model.parentProp = null;
      model.parent = null;
      trigger.call(model, 'event');

      jasmineExpect(base.prototype.trigger).toHaveBeenCalledWith('event');
    });
    it('should bubble events to parent', function() {
      var trigger = eventBubbler(base);
      trigger.call(model, 'event');

      jasmineExpect(base.prototype.trigger).toHaveBeenCalledWith('event');
      jasmineExpect(parent.trigger).toHaveBeenCalledWith('event:model');
    });
    it('should handle multiple events', function() {
      var trigger = eventBubbler(base);
      trigger.call(model, 'event1 event2');

      jasmineExpect(parent.trigger).toHaveBeenCalledWith('event1:model');
      jasmineExpect(parent.trigger).toHaveBeenCalledWith('event2:model');
    });
    it('should add itself to a bubbled events', function() {
      var trigger = eventBubbler(base);
      trigger.call(model, 'event:submodel');

      jasmineExpect(parent.trigger).toHaveBeenCalledWith('event:model:submodel');
    });
    it('should trigger a base change event', function() {
      var trigger = eventBubbler(base);
      trigger.call(model, 'change', model);

      jasmineExpect(parent.trigger).toHaveBeenCalledWith('change', parent);
      jasmineExpect(parent.trigger).toHaveBeenCalledWith('change:model', model);
    });
  });
});