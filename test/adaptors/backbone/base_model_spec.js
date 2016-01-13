'use strict';

var _ = require('underscore');
var BackboneAdaptor = require('../../../adaptors/backbone');
var BaseModel = BackboneAdaptor.Model;
var BaseCollection = BackboneAdaptor.Collection;
var Backbone = BackboneAdaptor.Backbone;
var logger = require('../../../src/utils/logger');

describe('base_model.js static api', function() {
  describe('extend', function () {
    it('should be a function', function() {
      expect(BaseModel.extend).to.be.a('function');
      expect(BaseModel.extend).to.have.length(2);
    });
    it('should be different than Backbone\'s', function() {
      expect(BaseModel.extend).not.to.equal(Backbone.extend);
    });
    it('should call extend', function() {
      spyOn(Backbone.Model, 'extend');
      BaseModel.extend({});
      jasmineExpect(Backbone.Model.extend).toHaveBeenCalled();
    });
    /* develblock:start */
    it('should prevent initialize from being overwritten', function() {
      spyOn(logger, 'warn');
      spyOn(BaseModel.prototype, 'initialize');
      var initFn = jasmine.createSpy();
      var testFn = function() {};
      var TestModel = BaseModel.extend({
        initialize: initFn,
        test: testFn
      });
      expect(TestModel.prototype.initialize).not.to.equal(initFn);
      expect(TestModel.prototype.test).to.equal(testFn);
      jasmineExpect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.calls.argsFor(0)[0]).to.contain('may not be overridden');

      var args = {};
      TestModel.prototype.initialize(args);
      jasmineExpect(BaseModel.prototype.initialize).toHaveBeenCalledWith(args);
      jasmineExpect(initFn).toHaveBeenCalledWith(args);
    });
    it('should error with debugName if available', function() {
      spyOn(logger, 'warn');
      var initFn = function() {};
      BaseModel.extend({
        initialize: initFn
      }, {
        debugName: 'FOOBAR'
      });
      jasmineExpect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.calls.argsFor(0)[0]).to.contain(' for model "FOOBAR"');
    });
    /* develblock:end */
  });
});

describe('base_model.js constructed api', function() {
  describe('tungstenModel', function() {
    it('should be set', function() {
      expect(BaseModel.prototype.tungstenModel).to.be.true;
    });
  });
  describe('set', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.set).to.be.a('function');
      expect(BaseModel.prototype.set).to.have.length(3);
    });
  });
  describe('toJSON', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.toJSON).to.be.a('function');
      expect(BaseModel.prototype.toJSON).to.have.length(0);
    });
  });
  describe('doSerialize', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.doSerialize).to.be.a('function');
      expect(BaseModel.prototype.doSerialize).to.have.length(0);
    });
  });
  describe('serialize', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.serialize).to.be.a('function');
      expect(BaseModel.prototype.serialize).to.have.length(1);
    });
  });
  describe('clone', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.clone).to.be.a('function');
      expect(BaseModel.prototype.clone).to.have.length(0);
    });
  });
  describe('postInitialize', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.postInitialize).to.be.a('function');
      expect(BaseModel.prototype.postInitialize).to.have.length(0);
    });
  });
  describe('getDeep', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getDeep).to.be.a('function');
      expect(BaseModel.prototype.getDeep).to.have.length(1);
    });
  });
  describe('setRelation', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.setRelation).to.have.length(3);
    });
  });
  describe('trigger', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.trigger).to.be.a('function');
      expect(BaseModel.prototype.trigger).to.have.length(0);
    });
  });
  describe('reset', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.reset).to.be.a('function');
      expect(BaseModel.prototype.reset).to.have.length(2);
    });
  });

  /* develblock:start */
  describe('initDebug', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.initDebug).to.be.a('function');
      expect(BaseModel.prototype.initDebug).to.have.length(0);
    });
  });
  describe('getDebugName', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getDebugName).to.be.a('function');
      expect(BaseModel.prototype.getDebugName).to.have.length(0);
    });
    it('should return the cid if debugName is not available', function() {
      var result = BaseModel.prototype.getDebugName.call({
        cid: 'model1'
      });

      expect(result).to.equal('model1');
    });
    it('should return the debugName', function() {
      var result = BaseModel.prototype.getDebugName.call({
        cid: 'model1',
        constructor: {
          debugName: 'FOOBAR'
        }
      });

      expect(result).to.equal('FOOBAR1');
    });
  });
  describe('getChildren', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getChildren).to.be.a('function');
      expect(BaseModel.prototype.getChildren).to.have.length(0);
    });
    it('should return the model\'s children and collections', function() {
      var TestModel = BaseModel.extend({
        defaults: {
          cl1: [],
          cl2: [],
          ch1: {},
          ch2: {}
        },
        relations: {
          'cl1': BaseCollection,
          'cl2': BaseCollection,
          'ch1': BaseModel,
          'ch2': BaseModel
        }
      });
      var model = new TestModel();
      var children = model.getChildren();
      expect(children).to.have.length(4);
      expect(children).to.include.members([model.get('cl1'), model.get('cl2'), model.get('ch1'), model.get('ch2')]);
    });
  });
  describe('getFunctions', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getFunctions).to.be.a('function');
      expect(BaseModel.prototype.getFunctions).to.have.length(2);
    });
  });
  describe('getPropertiesArray', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getPropertiesArray).to.be.a('function');
      expect(BaseModel.prototype.getPropertiesArray).to.have.length(0);
    });
    it('should return an object of property types', function() {
      var TestModel = BaseModel.extend({
        defaults: {
          cl1: [],
          ch1: {}
        },
        derived: {
          d1: {
            deps: [],
            fn: function() {
              return ['derived'];
            }
          }
        },
        relations: {
          'cl1': BaseCollection,
          'ch1': BaseModel
        }
      });
      var model = new TestModel({
        prop: 'test'
      });
      var serializable = {};
      var unserializable = {
        toJSON: function() {
          throw 'cannot serialize';
        }
      };
      model.set({
        'serializable': serializable,
        'unserializable': unserializable
      });

      spyOn(model.get('ch1'), 'getDebugName').and.returnValue('ModelName');
      spyOn(model.get('cl1'), 'getDebugName').and.returnValue('CollectionName');

      var properties = model.getPropertiesArray();
      var expectedRelations = [{
        key: 'ch1',
        data: {
          isRelation: true,
          name: 'ModelName'
        }
      }, {
        key: 'cl1',
        data: {
          isRelation: true,
          name: 'CollectionName'
        }
      }];
      var expectedDerived = [{
        key: 'd1',
        data: {
          isDerived: model.derived.d1,
          value: ['derived'],
          displayValue: '["derived"]'
        }
      }];

      var expectedProperties = [{
        key: 'prop',
        data: {
          isEditable: true,
          isEditing: false,
          value: 'test',
          displayValue: '"test"'
        }
      }, {
        key: 'serializable',
        data: {
          isEditable: true,
          isEditing: false,
          value: serializable,
          displayValue: '{}'
        }
      }, {
        key: 'unserializable',
        data: {
          isEditable: false,
          isEditing: false,
          value: unserializable,
          displayValue: '[object Object]'
        }
      }];

      expect(properties.normal).to.eql(expectedProperties);
      expect(properties.relational).to.eql(expectedRelations);
      expect(properties.derived).to.eql(expectedDerived);
    });
  });
  /* develblock:end */
});

/**
 * QUnit to Jasmine mapper functions:
 */
function equal(actual, expected) {
  expect(actual).to.equal(expected);
}

function notEqual(actual, expected) {
  expect(actual).to.not.equal(expected);
}

function strictEqual(actual, expected) {
  expect(actual).to.equal(expected);
}

function deepEqual(actual, expected) {
  expect(actual).to.deep.equal(expected);
}

function ok(state) {
  expect(state).to.be.ok;
}

function throws(fn) {
  expect(fn).to.throw(Error);
}

/**
 * Backbone model specs modified from backbone.js:
 *    @author Jeremy Ashkenas, @license MIT
 *    Copyright (c) 2010-2015 Jeremy Ashkenas, DocumentCloud
 *    Permission is hereby granted, free of charge, to any person
 *    obtaining a copy of this software and associated documentation
 *    files (the "Software"), to deal in the Software without
 *    restriction, including without limitation the rights to use,
 *    copy, modify, merge, publish, distribute, sublicense, and/or sell
 *    copies of the Software, and to permit persons to whom the
 *    Software is furnished to do so, subject to the following
 *    conditions:
 *    The above copyright notice and this permission notice shall be
 *    included in all copies or substantial portions of the Software.
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *    OTHER DEALINGS IN THE SOFTWARE.
 */

describe('base_model.js backbone functionality', function() {
  var doc, collection, value = 0;
  var CollectionClass = BackboneAdaptor.Collection.extend({
    url: function() {
      return '/collection';
    }
  });
  beforeEach(function() {
    doc = new BaseModel({
      id: '1-the-tempest',
      title: 'The Tempest',
      author: 'Bill Shakespeare',
      length: 123
    });
    collection = new CollectionClass();
    collection.add(doc);
  });
  afterEach(function() {
    doc = null, collection = null, value = 0;
  });
  it('initialize', function() {
    var Model = BaseModel.extend({
      postInitialize: function() {
        this.one = 1;
        equal(this.collection, collection);
      }
    });
    var model = new Model({}, {
      collection: collection
    });
    equal(model.one, 1);
    equal(model.collection, collection);
  });
  it('initialize with attributes and options', function() {
    var Model = BaseModel.extend({
      postInitialize: function(attributes, options) {
        this.one = options.one;
      }
    });
    var model = new Model({}, {one: 1});
    equal(model.one, 1);
  });

  it('initialize with parsed attributes', function() {
    var Model = BaseModel.extend({
      parse: function(attrs) {
        attrs.value += 1;
        return attrs;
      }
    });
    var model = new Model({
      value: 1
    }, {
      parse: true
    });
    equal(model.get('value'), 2);
  });

  it('initialize with defaults', function() {
    var Model = BaseModel.extend({
      defaults: {
        first_name: 'Unknown',
        last_name: 'Unknown'
      }
    });
    var model = new Model({
      'first_name': 'John'
    });
    equal(model.get('first_name'), 'John');
    equal(model.get('last_name'), 'Unknown');
  });

  it('parse can return null', function() {
    var Model = BaseModel.extend({
      parse: function(attrs) {
        attrs.value += 1;
        return null;
      }
    });
    var model = new Model({
      value: 1
    }, {
      parse: true
    });
    equal(JSON.stringify(model.toJSON()), '{}');
  });

  it('url', function() {
    doc.urlRoot = null;
    equal(doc.url(), '/collection/1-the-tempest');
    doc.collection.url = '/collection/';
    equal(doc.url(), '/collection/1-the-tempest');
    doc.collection = null;
    throws(function() {
      doc.url();
    });
    doc.collection = collection;
  });

  it('url when using urlRoot, and uri encoding', function() {
    var Model = BaseModel.extend({
      urlRoot: '/collection'
    });
    var model = new Model();
    equal(model.url(), '/collection');
    model.set({
      id: '+1+'
    });
    equal(model.url(), '/collection/%2B1%2B');
  });

  it('url when using urlRoot as a function to determine urlRoot at runtime', function() {
    var Model = BaseModel.extend({
      urlRoot: function() {
        return '/nested/' + this.get('parent_id') + '/collection';
      }
    });

    var model = new Model({
      parent_id: 1
    });
    equal(model.url(), '/nested/1/collection');
    model.set({
      id: 2
    });
    equal(model.url(), '/nested/1/collection/2');
  });

  it('underscore methods', function() {
    var model = new BaseModel({
      'foo': 'a',
      'bar': 'b',
      'baz': 'c'
    });
    deepEqual(model.keys(), ['foo', 'bar', 'baz']);
    deepEqual(model.values(), ['a', 'b', 'c']);
    deepEqual(model.invert(), {
      'a': 'foo',
      'b': 'bar',
      'c': 'baz'
    });
    deepEqual(model.pick('foo', 'baz'), {
      'foo': 'a',
      'baz': 'c'
    });
    deepEqual(model.omit('foo', 'bar'), {
      'baz': 'c'
    });
  });

  it('chain', function() {
    var model = new BaseModel({
      a: 0,
      b: 1,
      c: 2
    });
    deepEqual(model.chain().pick('a', 'b', 'c').values().compact().value(), [1, 2]);
  });

  it('clone', function() {
    var a = new BaseModel({
      'foo': 1,
      'bar': 2,
      'baz': 3
    });
    var b = a.clone();
    equal(a.get('foo'), 1);
    equal(a.get('bar'), 2);
    equal(a.get('baz'), 3);
    equal(b.get('foo'), a.get('foo'), 'Foo should be the same on the clone.');
    equal(b.get('bar'), a.get('bar'), 'Bar should be the same on the clone.');
    equal(b.get('baz'), a.get('baz'), 'Baz should be the same on the clone.');
    a.set({
      foo: 100
    });
    equal(a.get('foo'), 100);
    equal(b.get('foo'), 1, 'Changing a parent attribute does not change the clone.');

    var foo = new BaseModel({
      p: 1
    });
    var bar = new BaseModel({
      p: 2
    });
    bar.set(foo.clone().attributes, {
      unset: true
    });
    equal(foo.get('p'), 1);
    equal(bar.get('p'), undefined);
  });

  it('isNew', function() {
    var a = new BaseModel({
      'foo': 1,
      'bar': 2,
      'baz': 3
    });
    ok(a.isNew(), 'it should be new');
    a = new BaseModel({
      'foo': 1,
      'bar': 2,
      'baz': 3,
      'id': -5
    });
    ok(!a.isNew(), 'any defined ID is legal, negative or positive');
    a = new BaseModel({
      'foo': 1,
      'bar': 2,
      'baz': 3,
      'id': 0
    });
    ok(!a.isNew(), 'any defined ID is legal, including zero');
    ok(new BaseModel({}).isNew(), 'is true when there is no id');
    ok(!new BaseModel({
      'id': 2
    }).isNew(), 'is false for a positive integer');
    ok(!new BaseModel({
      'id': -5
    }).isNew(), 'is false for a negative integer');
  });

  it('get', function() {
    equal(doc.get('title'), 'The Tempest');
    equal(doc.get('author'), 'Bill Shakespeare');
  });

  it('escape', function() {
    equal(doc.escape('title'), 'The Tempest');
    doc.set({
      audience: 'Bill & Bob'
    });
    equal(doc.escape('audience'), 'Bill &amp; Bob');
    doc.set({
      audience: 'Tim > Joan'
    });
    equal(doc.escape('audience'), 'Tim &gt; Joan');
    doc.set({
      audience: 10101
    });
    equal(doc.escape('audience'), '10101');
    doc.unset('audience');
    equal(doc.escape('audience'), '');
  });

  it('has', function() {
    var model = new BaseModel();

    strictEqual(model.has('name'), false);

    model.set({
      '0': 0,
      '1': 1,
      'true': true,
      'false': false,
      'empty': '',
      'name': 'name',
      'null': null,
      'undefined': undefined
    });

    strictEqual(model.has('0'), true);
    strictEqual(model.has('1'), true);
    strictEqual(model.has('true'), true);
    strictEqual(model.has('false'), true);
    strictEqual(model.has('empty'), true);
    strictEqual(model.has('name'), true);

    model.unset('name');

    strictEqual(model.has('name'), false);
    strictEqual(model.has('null'), false);
    strictEqual(model.has('undefined'), false);
  });

  it('matches', function() {
    var model = new BaseModel();

    strictEqual(model.matches({
      'name': 'Jonas',
      'cool': true
    }), false);

    model.set({
      name: 'Jonas',
      'cool': true
    });

    strictEqual(model.matches({
      'name': 'Jonas'
    }), true);
    strictEqual(model.matches({
      'name': 'Jonas',
      'cool': true
    }), true);
    strictEqual(model.matches({
      'name': 'Jonas',
      'cool': false
    }), false);
  });

  it('matches with predicate', function() {
    var model = new BaseModel({
      a: 0
    });

    strictEqual(model.matches(function(attr) {
      return attr.a > 1 && attr.b != null;
    }), false);

    model.set({
      a: 3,
      b: true
    });

    strictEqual(model.matches(function(attr) {
      return attr.a > 1 && attr.b != null;
    }), true);
  });

  it('set and unset', function() {
    var a = new BaseModel({
      id: 'id',
      foo: 1,
      bar: 2,
      baz: 3
    });
    var changeCount = 0;
    a.on('change:foo', function() {
      changeCount += 1;
    });
    a.set({
      'foo': 2
    });
    ok(a.get('foo') == 2, 'Foo should have changed.');
    ok(changeCount == 1, 'Change count should have incremented.');
    a.set({
      'foo': 2
    }); // set with value that is not new shouldn\'t fire change event
    ok(a.get('foo') == 2, 'Foo should NOT have changed, still 2');
    ok(changeCount == 1, 'Change count should NOT have incremented.');

    a.validate = function(attrs) {
      equal(attrs.foo, void 0, 'validate:true passed while unsetting');
    };
    a.unset('foo', {
      validate: true
    });
    equal(a.get('foo'), void 0, 'Foo should have changed');
    delete a.validate;
    ok(changeCount == 2, 'Change count should have incremented for unset.');

    a.unset('id');
    equal(a.id, undefined, 'Unsetting the id should remove the id property.');
  });

  it('#2030 - set with failed validate, followed by another set triggers change', function() {
    var attr = 0,
      main = 0,
      error = 0;
    var Model = BaseModel.extend({
      validate: function(attr) {
        if (attr.x > 1) {
          error++;
          return 'this is an error';
        }
      }
    });
    var model = new Model({
      x: 0
    });
    model.on('change:x', function() {
      attr++;
    });
    model.on('change', function() {
      main++;
    });
    model.set({
      x: 2
    }, {
      validate: true
    });
    model.set({
      x: 1
    }, {
      validate: true
    });
    deepEqual([attr, main, error], [1, 1, 1]);
  });

  it('set triggers changes in the correct order', function() {
    var value = null;
    var model = new BaseModel;
    model.on('last', function() {
      value = 'last';
    });
    model.on('first', function() {
      value = 'first';
    });
    model.trigger('first');
    model.trigger('last');
    equal(value, 'last');
  });

  it('set falsy values in the correct order', function() {
    var model = new BaseModel({
      result: 'result'
    });
    model.on('change', function() {
      equal(model.changed.result, void 0);
      equal(model.previous('result'), false);
    });
    model.set({
      result: void 0
    }, {
      silent: true
    });
    model.set({
      result: null
    }, {
      silent: true
    });
    model.set({
      result: false
    }, {
      silent: true
    });
    model.set({
      result: void 0
    });
  });

  it('nested set triggers with the correct options', function() {
    var model = new BaseModel();
    var o1 = {};
    var o2 = {};
    var o3 = {};
    model.on('change', function(__, options) {
      switch (model.get('a')) {
        case 1:
          deepEqual(options, o1);
          return model.set('a', 2, o2);
        case 2:
          deepEqual(options, o2);
          return model.set('a', o3);
        case 3:
          deepEqual(options, o3);
      }
    });
    model.set('a', 1, o1);
  });

  it('multiple unsets', function() {
    var i = 0;
    var counter = function() {
      i++;
    };
    var model = new BaseModel({
      a: 1
    });
    model.on('change:a', counter);
    model.set({
      a: 2
    });
    model.unset('a');
    model.unset('a');
    equal(i, 2, 'Unset does not fire an event for missing attributes.');
  });

  it('unset and changedAttributes', function() {
    var model = new BaseModel({
      a: 1
    });
    model.on('change', function() {
      ok('a' in model.changedAttributes(), 'changedAttributes should contain unset properties');
    });
    model.unset('a');
  });

  it('using a non-default id attribute.', function() {
    var MongoModel = BaseModel.extend({
      idAttribute: '_id'
    });
    var model = new MongoModel({
      id: 'eye-dee',
      _id: 25,
      title: 'Model'
    });
    equal(model.get('id'), 'eye-dee');
    equal(model.id, 25);
    equal(model.isNew(), false);
    model.unset('_id');
    equal(model.id, undefined);
    equal(model.isNew(), true);
  });

  it('setting an alternative cid prefix', function() {
    var Model = BaseModel.extend({
      cidPrefix: 'm'
    });
    var model = new Model();

    equal(model.cid.charAt(0), 'm');

    model = new BaseModel();
    // In debugger the default cidPrefix is overrridden
    var prefix = 'c';
    /* develblock:start */
    prefix = BaseModel.prototype.cidPrefix;
    /* develblock:end */
    equal(model.cid.substr(0, prefix.length), prefix);
    var Collection = Backbone.Collection.extend({
      model: Model
    });
    var collection = new Collection([{id: 'c5'}, {id: 'c6'}, {id: 'c7'}]);

    equal(collection.get('c6').cid.charAt(0), 'm');
    collection.set([{id: 'c6', value: 'test'}], {
      merge: true,
      add: true,
      remove: false
    });
    ok(collection.get('c6').has('value'));
  });

  it('set an empty string', function() {
    var model = new BaseModel({
      name: 'Model'
    });
    model.set({
      name: ''
    });
    equal(model.get('name'), '');
  });

  it('setting an object', function() {
    var model = new BaseModel({
      custom: {
        foo: 1
      }
    });
    model.on('change', function() {
      ok(1);
    });
    model.set({
      custom: {
        foo: 1
      } // no change should be fired
    });
    model.set({
      custom: {
        foo: 2
      } // change event should be fired
    });
  });

  it('clear', function() {
    var changed;
    var model = new BaseModel({
      id: 1,
      name: 'Model'
    });
    model.on('change:name', function() {
      changed = true;
    });
    model.on('change', function() {
      var changedAttrs = model.changedAttributes();
      ok('name' in changedAttrs);
    });
    model.clear();
    equal(changed, true);
    equal(model.get('name'), undefined);
  });

  it('defaults', function() {
    var Defaulted = BaseModel.extend({
      defaults: {
        'one': 1,
        'two': 2
      }
    });
    var model = new Defaulted({
      two: undefined
    });
    equal(model.get('one'), 1);
    equal(model.get('two'), 2);
    Defaulted = BaseModel.extend({
      defaults: function() {
        return {
          'one': 3,
          'two': 4
        };
      }
    });
    model = new Defaulted({
      two: undefined
    });
    equal(model.get('one'), 3);
    equal(model.get('two'), 4);
  });

  it('change, hasChanged, changedAttributes, previous, previousAttributes', function() {
    var model = new BaseModel({
      name: 'Tim',
      age: 10
    });
    deepEqual(model.changedAttributes(), false);
    model.on('change', function() {
      ok(model.hasChanged('name'), 'name changed');
      ok(!model.hasChanged('age'), 'age did not');
      ok(_.isEqual(model.changedAttributes(), {
        name: 'Rob'
      }), 'changedAttributes returns the changed attrs');
      equal(model.previous('name'), 'Tim');
      ok(_.isEqual(model.previousAttributes(), {
        name: 'Tim',
        age: 10
      }), 'previousAttributes is correct');
    });
    equal(model.hasChanged(), false);
    equal(model.hasChanged(undefined), false);
    model.set({
      name: 'Rob'
    });
    equal(model.get('name'), 'Rob');
  });

  it('changedAttributes', function() {
    var model = new BaseModel({
      a: 'a',
      b: 'b'
    });
    deepEqual(model.changedAttributes(), false);
    equal(model.changedAttributes({
      a: 'a'
    }), false);
    equal(model.changedAttributes({
      a: 'b'
    }).a, 'b');
  });

  it('change with options', function() {
    var value;
    var model = new BaseModel({
      name: 'Rob'
    });
    model.on('change', function(model, options) {
      value = options.prefix + model.get('name');
    });
    model.set({
      name: 'Bob'
    }, {
      prefix: 'Mr. '
    });
    equal(value, 'Mr. Bob');
    model.set({
      name: 'Sue'
    }, {
      prefix: 'Ms. '
    });
    equal(value, 'Ms. Sue');
  });

  it('change after initialize', function() {
    var changed = 0;
    var attrs = {
      id: 1,
      label: 'c'
    };
    var obj = new BaseModel(attrs);
    obj.on('change', function() {
      changed += 1;
    });
    obj.set(attrs);
    equal(changed, 0);
  });

  it('validate', function() {
    var lastError;
    var model = new BaseModel();
    model.validate = function(attrs) {
      if (attrs.admin != this.get('admin')) {
        return 'Can\'t change admin status.';
      }
    };
    model.on('invalid', function(model, error) {
      lastError = error;
    });
    var result = model.set({
      a: 100
    });
    equal(result, model);
    equal(model.get('a'), 100);
    equal(lastError, undefined);
    result = model.set({
      admin: true
    });
    equal(model.get('admin'), true);
    result = model.set({
      a: 200,
      admin: false
    }, {
      validate: true
    });
    equal(lastError, 'Can\'t change admin status.');
    equal(result, false);
    equal(model.get('a'), 100);
  });

  it('validate on unset and clear', function() {
    var error;
    var model = new BaseModel({
      name: 'One'
    });
    model.validate = function(attrs) {
      if (!attrs.name) {
        error = true;
        return 'No thanks.';
      }
    };
    model.set({
      name: 'Two'
    });
    equal(model.get('name'), 'Two');
    equal(error, undefined);
    model.unset('name', {
      validate: true
    });
    equal(error, true);
    equal(model.get('name'), 'Two');
    model.clear({
      validate: true
    });
    equal(model.get('name'), 'Two');
    delete model.validate;
    model.clear();
    equal(model.get('name'), undefined);
  });

  it('validate with error callback', function() {
    var boundError;
    var model = new BaseModel();
    model.validate = function(attrs) {
      if (attrs.admin) {
        return 'Can\'t change admin status.';
      }
    };
    model.on('invalid', function() {
      boundError = true;
    });
    var result = model.set({
      a: 100
    }, {
      validate: true
    });
    equal(result, model);
    equal(model.get('a'), 100);
    equal(model.validationError, null);
    equal(boundError, undefined);
    result = model.set({
      a: 200,
      admin: true
    }, {
      validate: true
    });
    equal(result, false);
    equal(model.get('a'), 100);
    equal(model.validationError, 'Can\'t change admin status.');
    equal(boundError, true);
  });

  it('defaults always extend attrs (#459)', function() {
    BaseModel.extend({
      defaults: {
        one: 1
      },
      postInitialize: function() {
        equal(this.attributes.one, 1);
      }
    });
  });
  it('Inherit class properties', function() {
    var Parent = BaseModel.extend({
      // modified to be object rather than fn; fn is wrapped with debugger
      instancePropSame: {foo: 'bar'},
      instancePropDiff: function() {}
    }, {
      classProp: function() {}
    });
    var Child = Parent.extend({
      instancePropDiff: function() {}
    });

    var adult = new Parent;
    var kid = new Child;

    deepEqual(Child.classProp, Parent.classProp);
    notEqual(Child.classProp, undefined);
    // edited
    deepEqual(kid.instancePropSame, adult.instancePropSame);
    notEqual(kid.instancePropSame, undefined);

    notEqual(Child.prototype.instancePropDiff, Parent.prototype.instancePropDiff);
    notEqual(Child.prototype.instancePropDiff, undefined);
  });

  it('Nested change events don\'t clobber previous attributes', function() {
    new BaseModel()
      .on('change:state', function(model, newState) {
        equal(model.previous('state'), undefined);
        equal(newState, 'hello');
        // Fire a nested change event.
        model.set({
          other: 'whatever'
        });
      })
      .on('change:state', function(model, newState) {
        equal(model.previous('state'), undefined);
        equal(newState, 'hello');
      })
      .set({
        state: 'hello'
      });
  });

  it('hasChanged/set should use same comparison', function() {
    var changed = 0,
      model = new BaseModel({
        a: null
      });
    model.on('change', function() {
      ok(this.hasChanged('a'));
    })
      .on('change:a', function() {
        changed++;
      })
      .set({
        a: undefined
      });
    equal(changed, 1);
  });

  it('#582, #425, change:attribute callbacks should fire after all changes have occurred', function() {
    var model = new BaseModel;

    var assertion = function() {
      equal(model.get('a'), 'a');
      equal(model.get('b'), 'b');
      equal(model.get('c'), 'c');
    };

    model.on('change:a', assertion);
    model.on('change:b', assertion);
    model.on('change:c', assertion);

    model.set({
      a: 'a',
      b: 'b',
      c: 'c'
    });
  });

  it('#871, set with attributes property', function() {
    var model = new BaseModel();
    model.set({
      attributes: true
    });
    ok(model.has('attributes'));
  });

  it('set value regardless of equality/change', function() {
    var model = new BaseModel({
      x: []
    });
    var a = [];
    model.set({
      x: a
    });
    ok(model.get('x') === a);
  });

  it('set same value does not trigger change', function(done) {
    var model = new BaseModel({
      x: 1
    });
    model.on('change change:x', function() {
      ok(false);
    });
    model.set({
      x: 1
    });
    model.set({
      x: 1
    });
    done();
  });

  it('unset does not fire a change for undefined attributes', function() {
    var model = new BaseModel({
      x: undefined
    });
    model.on('change:x', function() {
      ok(false);
    });
    model.unset('x');
  });

  it('set: undefined values', function() {
    var model = new BaseModel({
      x: undefined
    });
    ok('x' in model.attributes);
  });

  it('hasChanged works outside of change events, and true within', function() {
    var model = new BaseModel({
      x: 1
    });
    model.on('change:x', function() {
      ok(model.hasChanged('x'));
      equal(model.get('x'), 1);
    });
    model.set({
      x: 2
    }, {
      silent: true
    });
    ok(model.hasChanged());
    equal(model.hasChanged('x'), true);
    model.set({
      x: 1
    });
    ok(model.hasChanged());
    equal(model.hasChanged('x'), true);
  });

  it('hasChanged gets cleared on the following set', function() {
    var model = new BaseModel;
    model.set({
      x: 1
    });
    ok(model.hasChanged());
    model.set({
      x: 1
    });
    ok(!model.hasChanged());
    model.set({
      x: 2
    });
    ok(model.hasChanged());
    model.set({});
    ok(!model.hasChanged());
  });

  it('save doesn\'t validate twice', function() {
    var model = new BaseModel();
    var times = 0;
    model.sync = function() {};
    model.validate = function() {
      ++times;
    };
    model.save({});
    equal(times, 1);
  });

  it('`hasChanged` for falsey keys', function() {
    var model = new BaseModel();
    model.set({
      x: true
    }, {
      silent: true
    });
    ok(!model.hasChanged(0));
    ok(!model.hasChanged(''));
  });

  it('`previous` for falsey keys', function() {
    var model = new BaseModel({
      0: true,
      '': true
    });
    model.set({
      0: false,
      '': false
    }, {
      silent: true
    });
    equal(model.previous(0), true);
    equal(model.previous(''), true);
  });

  it('nested `set` during `change:attr`', function() {
    var events = [];
    var model = new BaseModel();
    model.on('all', function(event) {
      events.push(event);
    });
    model.on('change', function() {
      model.set({
        z: true
      }, {
        silent: true
      });
    });
    model.on('change:x', function() {
      model.set({
        y: true
      });
    });
    model.set({
      x: true
    });
    deepEqual(events, ['change:y', 'change:x', 'change']);
    events = [];
    model.set({
      z: true
    });
    deepEqual(events, []);
  });

  it('nested `change` only fires once', function(done) {
    var model = new BaseModel();
    model.on('change', function() {
      value++;
      expect(value).to.equal(1);
      done();
      model.set({
        x: true
      });
    });
    model.set({
      x: true
    });
  });

  it('nested `set` during `change`', function() {
    var count = 0;
    var model = new BaseModel();
    model.on('change', function() {
      switch (count++) {
        case 0:
          deepEqual(this.changedAttributes(), {
            x: true
          });
          equal(model.previous('x'), undefined);
          model.set({
            y: true
          });
          break;
        case 1:
          deepEqual(this.changedAttributes(), {
            x: true,
            y: true
          });
          equal(model.previous('x'), undefined);
          model.set({
            z: true
          });
          break;
        case 2:
          deepEqual(this.changedAttributes(), {
            x: true,
            y: true,
            z: true
          });
          equal(model.previous('y'), undefined);
          break;
        default:
          ok(false);
      }
    });
    model.set({
      x: true
    });
  });

  it('nested `change` with silent', function() {
    var count = 0;
    var model = new BaseModel();
    model.on('change:y', function() {
      ok(false);
    });
    model.on('change', function() {
      switch (count++) {
        case 0:
          deepEqual(this.changedAttributes(), {
            x: true
          });
          model.set({
            y: true
          }, {
            silent: true
          });
          model.set({
            z: true
          });
          break;
        case 1:
          deepEqual(this.changedAttributes(), {
            x: true,
            y: true,
            z: true
          });
          break;
        case 2:
          deepEqual(this.changedAttributes(), {
            z: false
          });
          break;
        default:
          ok(false);
      }
    });
    model.set({
      x: true
    });
    model.set({
      z: false
    });
  });

  it('nested `change:attr` with silent', function() {
    var model = new BaseModel();
    model.on('change:y', function() {
      ok(false);
    });
    model.on('change', function() {
      model.set({
        y: true
      }, {
        silent: true
      });
      model.set({
        z: true
      });
    });
    model.set({
      x: true
    });
  });

  it('multiple nested changes with silent', function() {
    var model = new BaseModel();
    model.on('change:x', function() {
      model.set({
        y: 1
      }, {
        silent: true
      });
      model.set({
        y: 2
      });
    });
    model.on('change:y', function(model, val) {
      equal(val, 2);
    });
    model.set({
      x: true
    });
  });

  it('multiple nested changes with silent', function() {
    var changes = [];
    var model = new BaseModel();
    model.on('change:b', function(model, val) {
      changes.push(val);
    });
    model.on('change', function() {
      model.set({
        b: 1
      });
    });
    model.set({
      b: 0
    });
    deepEqual(changes, [0, 1]);
  });

  it('basic silent change semantics', function(done) {
    var model = new BaseModel;
    model.set({
      x: 1
    });
    model.on('change', function() {
      value++;
      expect(value).to.equal(1);
      done();
    });
    model.set({
      x: 2
    }, {
      silent: true
    });
    model.set({
      x: 1
    });
  });

  it('nested set multiple times', function(done) {
    var model = new BaseModel();
    model.on('change:b', function() {
      value++;
      expect(value).to.equal(1);
      done();
    });
    model.on('change:a', function() {
      model.set({
        b: true
      });
      model.set({
        b: true
      });
    });
    model.set({
      a: true
    });
  });

  it('#1122 - clear does not alter options.', function() {
    var model = new BaseModel();
    var options = {};
    model.clear(options);
    ok(!options.unset);
  });

  it('#1122 - unset does not alter options.', function() {
    var model = new BaseModel();
    var options = {};
    model.unset('x', options);
    ok(!options.unset);
  });

  it('#1355 - `options` is passed to success callbacks', function() {
    var model = new BaseModel();
    var opts = {
      success: function(model, resp, options) {
        ok(options);
      }
    };
    model.sync = function(method, model, options) {
      options.success();
    };
    model.save({
      id: 1
    }, opts);
    model.fetch(opts);
    model.destroy(opts);
  });

  it('#1433 - Save: An invalid model cannot be persisted.', function() {
    var model = new BaseModel;
    model.validate = function() {
      return 'invalid';
    };
    model.sync = function() {
      ok(false);
    };
    strictEqual(model.save(), false);
  });

  it('#1545 - `undefined` can be passed to a model constructor without coersion', function() {
    BaseModel.extend({
      defaults: {
        one: 1
      },
      postInitialize: function(attrs) {
        equal(attrs, undefined);
      }
    });
  });

  // failing
  // it('#1664 - Changing from one value, silently to another, back to original triggers a change.', function(done) {
  //   var model = new BaseModel({x: 1});
  //   model.on('change:x', function() {
  //     value++;
  //     expect(value).to.equal(1);
  //     done();
  //   });
  //   model.set({x: 2}, {silent: true});
  //   model.set({x: 3}, {silent: true});
  //   model.set({x: 1});
  // });

  it('#1664 - multiple silent changes nested inside a change event', function() {
    var changes = [];
    var model = new BaseModel();
    model.on('change', function() {
      model.set({
        a: 'c'
      }, {
        silent: true
      });
      model.set({
        b: 2
      }, {
        silent: true
      });
      model.unset('c', {
        silent: true
      });
    });
    model.on('change:a change:b change:c', function(model, val) {
      changes.push(val);
    });
    model.set({
      a: 'a',
      b: 1,
      c: 'item'
    });
    deepEqual(changes, ['a', 1, 'item']);
    deepEqual(model.attributes, {
      a: 'c',
      b: 2
    });
  });

  it('#1791 - `attributes` is available for `parse`', function() {
    var Model = BaseModel.extend({
      parse: function() {
        this.has('a');
      } // shouldn\'t throw an error
    });
    new Model(null, {
      parse: true
    });
  });

  it('silent changes in last `change` event back to original triggers change', function() {
    var changes = [];
    var model = new BaseModel();
    model.on('change:a change:b change:c', function(model, val) {
      changes.push(val);
    });
    model.on('change', function() {
      model.set({
        a: 'c'
      }, {
        silent: true
      });
    });
    model.set({
      a: 'a'
    });
    deepEqual(changes, ['a']);
    model.set({
      a: 'a'
    });
    deepEqual(changes, ['a', 'a']);
  });

  it('#1943 change calculations should use _.isEqual', function() {
    var model = new BaseModel({
      a: {
        key: 'value'
      }
    });
    model.set('a', {
      key: 'value'
    }, {
      silent: true
    });
    equal(model.changedAttributes(), false);
  });

  it('#1964 - final `change` event is always fired, regardless of interim changes', function(done) {
    var model = new BaseModel();
    model.on('change:property', function() {
      model.set('property', 'bar');
    });
    model.on('change', function() {
      value++;
      expect(value).to.equal(1);
      done();
    });
    model.set('property', 'foo');
  });

  it('isValid', function() {
    var model = new BaseModel({
      valid: true
    });
    model.validate = function(attrs) {
      if (!attrs.valid) {
        return 'invalid';
      }
    };
    equal(model.isValid(), true);
    equal(model.set({
      valid: false
    }, {
      validate: true
    }), false);
    equal(model.isValid(), true);
    model.set({
      valid: false
    });
    equal(model.isValid(), false);
    ok(!model.set('valid', false, {
      validate: true
    }));
  });

  it('#1179 - isValid returns true in the absence of validate.', function() {
    var model = new BaseModel();
    model.validate = null;
    ok(model.isValid());
  });

  it('#1961 - Creating a model with {validate:true} will call validate and use the error callback', function() {
    var Model = BaseModel.extend({
      validate: function(attrs) {
        if (attrs.id === 1) {
          return 'This shouldn\'t happen';
        }
      }
    });
    var model = new Model({
      id: 1
    }, {
      validate: true
    });
    equal(model.validationError, 'This shouldn\'t happen');
  });

  it('#2034 - nested set with silent only triggers one change', function(done) {
    var model = new BaseModel();
    model.on('change', function() {
      model.set({
        b: true
      }, {
        silent: true
      });
      value++;
      expect(value).to.equal(1);
      done();
    });
    model.set({
      a: true
    });
  });
});

/**
 * Backbone nested specs modified from backbone-nested-models:
 *    @author Bret Little, @license MIT
 *    Copyright (c) 2012 Bret Little
 *    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 *    associated documentation files (the 'Software'), to deal in the Software without restriction, including
 *    without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *    copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 *    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
describe('base_model.js backbone nested functionality', function() {
  var Book, book;
  var BaseCollection = BackboneAdaptor.Collection;
  beforeEach(function() {
    Book = BaseModel.extend({
      relations: {
        'author': BaseModel,
        'pages': BaseCollection
      }
    });

    book = new Book();

    book.set({
      'author': {
        'name': 'Heber J. Grant',
        'title': 'President',
        'age': '47'
      },
      'pages': [
        {
          number: 1,
          words: 500
        },
        {
          number: 2,
          words: 450
        }
      ]
    });
  });

  it('Should fire a nested change event', function() {
    var changeEvents = 0;
    book.on('change:pages:words', function() {
      changeEvents++;
    });
    book.get('pages').at(0).set({words: 1000});
    expect(changeEvents).to.equal(1);
    book.get('pages').at(0).set({words: 500});
    expect(changeEvents).to.equal(2);
  });

  it('Should not fire a nested destroy event', function() {
    var destroyEvents = 0;
    book.on('destroy', function() {
      destroyEvents++;
    });
    book.get('pages').at(0).destroy();
    expect(destroyEvents).to.equal(0);
  });

  it('Should not fire a nested add event', function() {
    var addEvents = 0;
    book.on('add', function() {
      addEvents++;
    });
    book.get('pages').add({
      number: 3,
      words: 250
    });
    expect(addEvents).to.equal(0);
  });

  it('Should fire a namespaced nested destroy event', function() {
    var destroyEvents = 0;
    book.on('destroy:pages', function() {
      destroyEvents++;
    });
    book.get('pages').at(0).destroy();
    expect(destroyEvents).to.equal(1);
  });

  it('Should fire a namespaced nested add event', function() {
    var addEvents = 0;
    book.on('add:pages', function() {
      addEvents++;
    });
    book.get('pages').add({
      number: 3,
      words: 250
    });
    expect(addEvents).to.equal(1);
  });

  it('Should fire a namespaced nested custom event', function() {
    var randomEvent = 0;
    book.on('randomEvent:pages', function() {
      randomEvent++;
    });
    book.get('pages').at(0).trigger('randomEvent');
    expect(randomEvent).to.equal(1);
  });


  it('Should build a model relation', function() {
    expect(book.get('author').get('name')).to.equal('Heber J. Grant');
    expect(book.get('author').get('title')).to.equal('President');
    expect(book.get('author').get('age')).to.equal('47');
  });

  it('Should build a collection relation', function() {
    expect(book.get('pages')).to.have.length(2);
    expect(book.get('pages').at(0).get('number')).to.equal(1);
    expect(book.get('pages').at(1).get('number')).to.equal(2);
    expect(book.get('pages').at(0).get('words')).to.equal(500);
    expect(book.get('pages').at(1).get('words')).to.equal(450);
  });

  it('Should provide backwards references to the parent models', function() {
    expect(book.get('author').parent).to.equal(book);
    expect(book.get('pages').at(0).collection.parent).to.equal(book);
  });

  it('Should merge in new properties into an existing relation', function() {
    var author = book.get('author');

    book.set({
      'author': {
        'city': 'SLC'
      }
    });

    expect(book.get('author')).to.equal(author);
    expect(book.get('author').get('name')).to.equal('Heber J. Grant');
    expect(book.get('author').get('city')).to.equal('SLC');
  });

  it('Should deconstruct model references', function() {
    var author = book.get('author');
    book.unset('author');

    expect(typeof author.parent).to.equal('undefined');
  });

  it('Should merge new models into a relation which is a collection', function() {
    book.set({
      'pages': [
        {
          number: 3,
          words: 600
        }
      ]
    });

    expect(book.get('pages')).to.have.length(3);
  });

  it('Should merge values into models which already exist in a sub collection', function() {
    book.set({
      'pages': [
        {
          id: 1,
          number: 3,
          words: 600
        }
      ]
    });


    book.set({
      'pages': [
        {
          id: 1,
          test: 'test'
        }
      ]
    });

    expect(book.get('pages')).to.have.length(3);
    expect(book.get('pages').at(2).get('test')).to.equal('test');
    expect(book.get('pages').at(2).get('words')).to.equal(600);
  });

  it('Should remove models which no longer exist in a sub collection', function() {
    book.set({
      'pages': [
        {
          id: 1,
          number: 3,
          words: 600
        }
      ]
    });


    book.set({
      'pages': [
        {
          id: 2,
          test: 'test'
        }
      ]
    });

    expect(book.get('pages')).to.have.length(3);
    expect(book.get('pages').at(2).get('test')).to.equal('test');
    expect(book.get('pages').at(2).get('words')).not.to.equal(600);
    expect(book.get('pages').at(2).id).to.equal(2);
  });
  // throws exception in debug build
  // it('Should trigger reset events on nested collection relations', function(done) {
  //       var Things = BaseCollection.extend({
  //     model: Thing,
//
  //     postInitialize: function() {
  //       this.listenTo('reset', function() {
  //         count++;
  //         expect(count).to.equal(1);
  //         done();
  //       });
  //     }
  //   });
//
  //   var Bucket = BaseModel.extend({
  //     relations: {
  //       'things': Things
  //     }
  //   });
//
  //   var Buckets = BaseCollection.extend({
  //     model: Bucket
  //   });
//
  //   var buckets = new Buckets();
  //   buckets.reset([
  //     {
  //       name: 'a',
  //       things: [{num: 1}, {num: 2}]
  //     },
  //     {
  //       name: 'b',
  //       things: [{num: 1}, {num: 2}]
  //     }
  //   ]);
//
  // });

  it('Should recursively call .toJSON', function() {
    var json = book.toJSON();
    expect(json.pages[0].number).to.equal(1);
  });

});

/**
 * Derived and session property unit tests modified from ampersand-state
 * https://github.com/AmpersandJS/ampersand-state/blob/master/test/basics.js
 *    @license MIT
 *    Copyright © 2014 &yet, LLC and AmpersandJS contributors
 *    Permission is hereby granted, free of charge, to any person obtaining a
 *    copy of this software and associated documentation files (the
 *    "Software"), to deal in the Software without restriction, including
 *    without limitation the rights to use, copy, modify, merge, publish,
 *    distribute, sublicense, and/or sell copies of the Software, and to
 *    permit persons to whom the Software is furnished to do so, subject to
 *    the following conditions:
 *    The above copyright notice and this permission notice shall be included
 *    in all copies or substantial portions of the Software.*
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 *    OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 *    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 *    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

describe('base_model.js special properties', function() {
  var Person;
  beforeEach(function() {
    Person = BaseModel.extend({
      defaults: {name: ''}
    });
  });
  afterEach(function() {
    Person = undefined;
  });
  it('should fire events for cached derived properties on dependency change', function() {
    var count = 0;
    var NewPerson = Person.extend({
      derived: {
        greeting: {
          deps: ['name'],
          fn: function() {
            count++;
            return 'hi, ' + this.get('name') + '!';
          }
        }
      }
    });
    var person = new NewPerson({name: 'world'});
    expect(person.get('greeting')).to.equal('hi, world!');

    // use again, should not increment counter
    person.get('greeting');
    expect(count, 1);

    person.set('name', 'something');
    expect(person.get('greeting')).to.equal('hi, something!');
    // reference again
    person.get('greeting');
    expect(count).to.equal(2);
  });
  it('shouldn\'t fire events for cached derived properties if result is same', function () {
    var NewPerson = Person.extend({
      derived: {
        greeting: {
          deps: ['name'],
          fn: function () {
            return 'hi, ' + this.get('name') + '!';
          }
        }
      }
    });
    var person = new NewPerson({name: 'world'});
    person.on('change:greeting', function () {
      // shouldn't fire if value is unchanged same value
      expect(true).to.equal(false);
    });
    person.set('name', 'world');
    expect(person.get('name')).to.equal('world');
  });
  it('should exclude session properties from toJSON', function () {
    var Bar = BaseModel.extend({
      session: ['active']
    });
    var bar = new Bar({name: 'hi', active: true});
    expect(bar.toJSON()).to.deep.equal({name: 'hi'});
  });
});
