'use strict';

var BackboneAdaptor = require('../../../adaptors/backbone');
var BaseCollection = BackboneAdaptor.Collection;
var Backbone = BackboneAdaptor.Backbone;
var logger = require('../../../src/utils/logger');

describe('base_collection.js public api', function() {
  describe('extend', function() {
    it('should be a function', function() {
      expect(BaseCollection.extend).to.be.a('function');
    });
    it('should accept two arguments', function() {
      expect(BaseCollection.extend).to.have.length(2);
    });
    it('should be different than Backbone\'s', function() {
      expect(BaseCollection.extend).not.to.equal(Backbone.extend);
    });
  });
});

describe('base_collection.js static api', function() {
  describe('extend', function () {
    it('should be a function', function() {
      expect(BaseCollection.extend).to.be.a('function');
      expect(BaseCollection.extend).to.have.length(2);
    });
    it('should call extend', function() {
      spyOn(Backbone.Collection, 'extend');
      BaseCollection.extend({}, {});
      jasmineExpect(Backbone.Collection.extend).toHaveBeenCalled();
    });
    /* develblock:start */
    it('should prevent initialize from being overwritten', function() {
      spyOn(logger, 'warn');
      spyOn(BaseCollection.prototype, 'initialize');
      var initFn = jasmine.createSpy();
      var testFn = function() {};
      var TestCollection = BaseCollection.extend({
        initialize: initFn,
        test: testFn
      });
      expect(TestCollection.prototype.initialize).not.to.equal(initFn);
      expect(TestCollection.prototype.test).to.equal(testFn);
      jasmineExpect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.calls.argsFor(0)[0]).to.contain('may not be overridden');

      var args = {};
      TestCollection.prototype.initialize(args);
      jasmineExpect(BaseCollection.prototype.initialize).toHaveBeenCalledWith(args);
      jasmineExpect(initFn).toHaveBeenCalledWith(args);
    });
    it('should error with debugName if available', function() {
      spyOn(logger, 'warn');
      var initFn = function() {};
      BaseCollection.extend({
        initialize: initFn
      }, {
        debugName: 'FOOBAR'
      });
      jasmineExpect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.calls.argsFor(0)[0]).to.contain(' for collection "FOOBAR"');
    });
    /* develblock:end */
  });
});

describe('base_collection.js constructed api', function() {
  describe('postInitialize', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.postInitialize).to.be.a('function');
      expect(BaseCollection.prototype.postInitialize).to.have.length(0);
    });
  });
  describe('resetRelations', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.resetRelations).to.be.a('function');
      expect(BaseCollection.prototype.resetRelations).to.have.length(1);
    });
  });
  describe('trigger', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.trigger).to.be.a('function');
      expect(BaseCollection.prototype.trigger).to.have.length(0);
    });
  });
  describe('reset', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.reset).to.be.a('function');
      expect(BaseCollection.prototype.reset).to.have.length(2);
    });
  });
  describe('serialize', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.serialize).to.be.a('function');
      expect(BaseCollection.prototype.serialize).to.have.length(1);
    });
  });
  describe('doSerialize', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.doSerialize).to.be.a('function');
      expect(BaseCollection.prototype.doSerialize).to.have.length(0);
    });
  });
  describe('bindExposedEvent', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.bindExposedEvent).to.be.a('function');
      expect(BaseCollection.prototype.bindExposedEvent).to.have.length(2);
    });
    it('should add a listener to the component\'s model', function() {
      var collection = {
        listenTo: jasmine.createSpy('listenTo')
      };
      var component = {
        model: {}
      };
      var event = 'event';

      BaseCollection.prototype.bindExposedEvent.call(collection, event, component);
      jasmineExpect(collection.listenTo).toHaveBeenCalled();
      expect(collection.listenTo.calls.count()).to.equal(1);
      var call = collection.listenTo.calls.first();
      expect(call.args[0]).to.equal(component.model);
      expect(call.args[1]).to.equal(event);
      expect(call.args[2]).to.be.a.function;
    });
    it('should trigger exposed events on the collection', function() {
      var collection = new BaseCollection([]);
      var component = {
        model: new BackboneAdaptor.Model({})
      };
      var event = 'foo';

      spyOn(collection, 'listenTo').and.callThrough();
      spyOn(collection, 'trigger');
      collection.bindExposedEvent(event, component);
      jasmineExpect(collection.listenTo).toHaveBeenCalled();
      expect(collection.listenTo.calls.count()).to.equal(1);

      component.model.trigger(event);
      jasmineExpect(collection.trigger).toHaveBeenCalled();
      expect(collection.trigger.calls.count()).to.equal(1);
      var call = collection.trigger.calls.mostRecent();
      expect(call.args[0]).to.equal(event);
    });
    it('should trigger an additional change on the collection', function() {
      var collection = new BaseCollection([]);
      var component = {
        model: new BackboneAdaptor.Model({})
      };
      var event = 'change:foo';

      spyOn(collection, 'listenTo').and.callThrough();
      spyOn(collection, 'trigger');
      collection.bindExposedEvent(event, component);
      jasmineExpect(collection.listenTo).toHaveBeenCalled();
      expect(collection.listenTo.calls.count()).to.equal(1);

      component.model.trigger(event);
      jasmineExpect(collection.trigger).toHaveBeenCalled();
      expect(collection.trigger.calls.count()).to.equal(2);
      expect(collection.trigger.calls.argsFor(0)[0]).to.equal(event);
      expect(collection.trigger.calls.argsFor(1)[0]).to.equal('change');
    });
  });
  describe('_addReference', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype._addReference).to.be.a('function');
      expect(BaseCollection.prototype._addReference).to.have.length(2);
    });
    it('should add listeners to a Component', function() {
      var collection = {
        bindExposedEvent: jasmine.createSpy('bindExposedEvent'),
        _onModelEvent: {}
      };
      var component = {
        model: {
          on: jasmine.createSpy('on')
        }
      };

      spyOn(Backbone.Collection.prototype, '_addReference');
      spyOn(BackboneAdaptor.ComponentWidget, 'isComponent').and.returnValue(true);

      // If there are no exposed events, nothing happens
      BaseCollection.prototype._addReference.call(collection, component, {});
      jasmineExpect(component.model.on).not.toHaveBeenCalled();
      jasmineExpect(collection.bindExposedEvent).not.toHaveBeenCalled();

      // If there are no exposed events, nothing happens
      component.exposedEvents = [];
      BaseCollection.prototype._addReference.call(collection, component, {});
      jasmineExpect(component.model.on).not.toHaveBeenCalled();
      jasmineExpect(collection.bindExposedEvent).not.toHaveBeenCalled();

      // If set to true, we bind the model to the collection as in core
      component.exposedEvents = true;
      BaseCollection.prototype._addReference.call(collection, component, {});
      jasmineExpect(collection.bindExposedEvent).not.toHaveBeenCalled();
      jasmineExpect(component.model.on).toHaveBeenCalled();
      var onArgs = component.model.on.calls.argsFor(0);
      expect(onArgs[0]).to.equal('all');
      expect(onArgs[1]).to.equal(collection._onModelEvent);
      expect(onArgs[2]).to.equal(collection);
      component.model.on.calls.reset();

      // If set to an array, we listen for each event
      component.exposedEvents = ['foo', 'bar'];
      BaseCollection.prototype._addReference.call(collection, component, {});
      jasmineExpect(component.model.on).not.toHaveBeenCalled();
      jasmineExpect(collection.bindExposedEvent).toHaveBeenCalled();
      expect(collection.bindExposedEvent.calls.count()).to.equal(2);
      var args = collection.bindExposedEvent.calls.argsFor(0);
      expect(args[0]).to.equal(component.exposedEvents[0]);
      expect(args[1]).to.equal(component);

      args = collection.bindExposedEvent.calls.argsFor(1);
      expect(args[0]).to.equal(component.exposedEvents[1]);
      expect(args[1]).to.equal(component);
    });
  });
  describe('_removeReference', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype._removeReference).to.be.a('function');
      expect(BaseCollection.prototype._removeReference).to.have.length(2);
    });
    it('should remove listeners from a Component', function() {
      var collection = {
        stopListening: jasmine.createSpy('stopListening'),
        _onModelEvent: {}
      };
      var component = {
        model: {
          off: jasmine.createSpy('off')
        }
      };

      spyOn(Backbone.Collection.prototype, '_removeReference');
      spyOn(BackboneAdaptor.ComponentWidget, 'isComponent').and.returnValue(true);

      // If there are no exposed events, nothing happens
      BaseCollection.prototype._removeReference.call(collection, component, {});
      jasmineExpect(component.model.off).not.toHaveBeenCalled();
      jasmineExpect(collection.stopListening).not.toHaveBeenCalled();

      // If there are no exposed events, nothing happens
      component.exposedEvents = [];
      BaseCollection.prototype._removeReference.call(collection, component, {});
      jasmineExpect(component.model.off).not.toHaveBeenCalled();
      jasmineExpect(collection.stopListening).not.toHaveBeenCalled();

      // If set to true, we bind the model to the collection as in core
      component.exposedEvents = true;
      BaseCollection.prototype._removeReference.call(collection, component, {});
      jasmineExpect(collection.stopListening).not.toHaveBeenCalled();
      jasmineExpect(component.model.off).toHaveBeenCalled();
      var onArgs = component.model.off.calls.argsFor(0);
      expect(onArgs[0]).to.equal('all');
      expect(onArgs[1]).to.equal(collection._onModelEvent);
      expect(onArgs[2]).to.equal(collection);
      component.model.off.calls.reset();

      // If set to an array, we listen for each event
      component.exposedEvents = ['foo', 'bar'];
      BaseCollection.prototype._removeReference.call(collection, component, {});
      jasmineExpect(component.model.off).not.toHaveBeenCalled();
      jasmineExpect(collection.stopListening).toHaveBeenCalled();
      expect(collection.stopListening.calls.count()).to.equal(2);
      var args = collection.stopListening.calls.argsFor(0);
      expect(args[0]).to.equal(component.model);
      expect(args[1]).to.equal(component.exposedEvents[0]);

      args = collection.stopListening.calls.argsFor(1);
      expect(args[0]).to.equal(component.model);
      expect(args[1]).to.equal(component.exposedEvents[1]);
    });
  });
  /* develblock:start */
  describe('initDebug', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.initDebug).to.be.a('function');
      expect(BaseCollection.prototype.initDebug).to.have.length(0);
    });
  });
  describe('getDebugName', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.getDebugName).to.be.a('function');
      expect(BaseCollection.prototype.getDebugName).to.have.length(0);
    });
    it('should return the cid if debugName is not available', function() {
      var result = BaseCollection.prototype.getDebugName.call({
        cid: 'collection1'
      });

      expect(result).to.equal('collection1');
    });
    it('should return the debugName', function() {
      var result = BaseCollection.prototype.getDebugName.call({
        cid: 'collection1',
        constructor: {
          debugName: 'FOOBAR'
        }
      });

      expect(result).to.equal('FOOBAR1');
    });
  });
  describe('getChildren', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.getChildren).to.be.a('function');
      expect(BaseCollection.prototype.getChildren).to.have.length(0);
    });
    it('should return the collection\'s models', function() {
      var collection = {
        models: [{id: 1}, {id: 2}]
      };

      expect(BaseCollection.prototype.getChildren.call(collection)).to.have.members(collection.models);
    });
    it('should treat any Components as their model', function() {
      var models = [{id: 1}, {id: 2}];
      var collection = {
        models: [models[0], {type: 'Widget', model: models[1]}]
      };

      var children = BaseCollection.prototype.getChildren.call(collection);
      expect(children).to.have.members(models);
    });
  });
  describe('getFunctions', function() {
    it('should be a function', function() {
      expect(BaseCollection.prototype.getFunctions).to.be.a('function');
      expect(BaseCollection.prototype.getFunctions).to.have.length(2);
    });
  });
  /* develblock:end */
});
