'use strict';

var AmpersandAdaptor = require('../../../adaptors/ampersand');
var BaseModel = AmpersandAdaptor.Model;
var BaseCollection = AmpersandAdaptor.Collection;
var Ampersand = AmpersandAdaptor.Ampersand;
var logger = require('../../../src/utils/logger');

describe('base_model.js static api', function() {
  describe('extend', function () {
    it('should be a function', function() {
      expect(BaseModel.extend).to.be.a('function');
      expect(BaseModel.extend).to.have.length(1);
    });
    it('should be different than Ampersand\'s', function() {
      expect(BaseModel.extend).not.to.equal(Ampersand.Model.extend);
    });
    it('should call extend', function() {
      spyOn(Ampersand.Model, 'extend');
      BaseModel.extend({});
      jasmineExpect(Ampersand.Model.extend).toHaveBeenCalled();
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
        initialize: initFn,
        debugName: 'FOOBAR'
      });
      jasmineExpect(logger.warn).toHaveBeenCalled();
      expect(logger.warn.calls.argsFor(0)[0]).to.contain(' for model "FOOBAR"');
    });
    /* develblock:end */
  });
});

describe('base_model.js constructed api', function() {
  describe('children', function() {
    it('should set properties for event bubbling', function() {
      var TestModel = BaseModel.extend({
        children: {
          'ch1': BaseModel,
          'ch2': BaseModel
        }
      });
      var model = new TestModel();
      expect(model.ch1.parentProp).to.equal('ch1');
      expect(model.ch1.parent).to.equal(model);
      expect(model.ch2.parentProp).to.equal('ch2');
      expect(model.ch2.parent).to.equal(model);
    });
  });
  describe('collections', function() {
    it('should set properties for event bubbling', function() {
      var TestModel = BaseModel.extend({
        collections: {
          'cl1': BaseCollection,
          'cl2': BaseCollection
        }
      });
      var model = new TestModel();
      expect(model.cl1.parentProp).to.equal('cl1');
      expect(model.cl1.parent).to.equal(model);
      expect(model.cl2.parentProp).to.equal('cl2');
      expect(model.cl2.parent).to.equal(model);
    });
  });
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
    it('should reset a model to the given state', function() {
      var TestModel = BaseModel.extend({
        props: {
          p1: 'string',
          p2: 'string'
        }
      });
      var model = new TestModel({
        p1: 'p1',
        p2: 'p2'
      });
      expect(model.toJSON()).to.eql({
        p1: 'p1',
        p2: 'p2'
      });
      model.reset({
        p1: 'p2'
      });
      expect(model.toJSON()).to.eql({p1: 'p2'});
    });
  });
  describe('reset', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.reset).to.be.a('function');
      expect(BaseModel.prototype.reset).to.have.length(2);
    });
  });
  describe('postInitialize', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.postInitialize).to.be.a('function');
      expect(BaseModel.prototype.postInitialize).to.have.length(0);
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
        cid: 'state1'
      });

      expect(result).to.equal('state1');
    });
    it('should return the debugName', function() {
      var result = BaseModel.prototype.getDebugName.call({
        cid: 'state1',
        debugName: 'FOOBAR'
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
      var TestCollection = BaseCollection.extend({});
      var TestSubModel = BaseModel.extend({});

      var TestModel = BaseModel.extend({
        collections: {
          'cl1': TestCollection,
          'cl2': TestCollection
        },
        children: {
          'ch1': TestSubModel,
          'ch2': TestSubModel
        }
      });
      var model = new TestModel();
      var children = model.getChildren();
      expect(children).to.have.length(4);
      expect(children).to.include.members([model.cl1, model.cl2, model.ch1, model.ch2]);
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
    it('should return an array of properties', function() {
      var TestModel = BaseModel.extend({
        collections: {
          'cl1': BaseCollection
        },
        children: {
          'ch1': BaseModel
        },
        props: {
          prop: 'string'
        }
      });
      var model = new TestModel({
        prop: 'test'
      });

      spyOn(model.ch1, 'getDebugName').and.returnValue('ModelName');
      spyOn(model.cl1, 'getDebugName').and.returnValue('CollectionName');

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

      var expectedProperties = [{
        key: 'prop',
        data: {
          isEditable: true,
          isEditing: false,
          value: 'test',
          displayValue: '"test"'
        }
      }];

      expect(properties.normal).to.eql(expectedProperties);
      expect(properties.relational).to.eql(expectedRelations);
    });
  });
  /* develblock:end */
});

/**
 * Ampersand model unit tests modified from ampersand-state
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
describe('base_model.js ampersand functionality', function() {
  var Person;
  beforeEach(function() {
    Person = BaseModel.extend({
      props: {
        name: 'string'
      }
    });
  });
  afterEach(function() {
    Person = undefined;
  });
  it('init with nothing should be okay', function() {
    // extend requires {} for debug
    var EmptyModel = BaseModel.extend({});
    var something = new EmptyModel();
    something.foo = 'bar';
    expect(!!something).to.equal(true);
    expect(something.foo).to.equal('bar');
  });
  it('init with values', function() {
    var person = new Person({name: 'foo'});
    expect(!!person).to.equal(true);
    expect(person.name).to.equal('foo');
  });

  it('after initialized change should be empty until a set op', function() {
    var person = new Person({name: 'phil'});
    expect(person._changed).to.deep.equal({});
    expect(!!person.changedAttributes()).to.equal(false);
  });

  it('extended object maintains existing props', function() {
    var AwesomePerson = Person.extend({
      props: {
        awesomeness: 'number'
      }
    });

    var awesome = new AwesomePerson({
      name: 'Captain Awesome',
      awesomeness: 11
    });

    expect(awesome.name).to.equal('Captain Awesome');
    expect(awesome.awesomeness).to.equal(11);
  });

  it('extended object maintains existing methods', function() {
    var NewPerson = BaseModel.extend({
      props: {
        awesomeness: 'number'
      },
      isTrulyAwesome: function() {
        if (this.awesomeness > 10) {
          return true;
        }
      }
    });
    var AwesomePerson = NewPerson.extend({});
    var awesome = new AwesomePerson({
      awesomeness: 11
    });
    expect(!!awesome.isTrulyAwesome()).to.equal(true);
  });
  it('instanceof checks should pass for all parents in the chain', function() {
    var P1 = Person.extend({});
    var P2 = P1.extend({});
    var P3 = P2.extend({});
    var p1 = new P1();
    var p2 = new P2();
    var p3 = new P3();
    expect(!!(p1 instanceof Person)).to.equal(true);
    expect(!!(p2 instanceof Person)).to.equal(true);
    expect(!!(p3 instanceof Person)).to.equal(true);
    expect(!!(p1 instanceof P2)).to.equal(false);
    expect(!!(p2 instanceof P2)).to.equal(true);
    expect(!!(p3 instanceof P2)).to.equal(true);
    expect(!!(p2 instanceof P3)).to.equal(false);
    expect(!!(p3 instanceof P3)).to.equal(true);

    // all of them should have the isState flag too
    expect(!!(p1.isState)).to.equal(true);
    expect(!!(p2.isState)).to.equal(true);
    expect(!!(p3.isState)).to.equal(true);

    // shouldn't be possible to change
    p1.isState = false;
    p2.isState = false;
    p3.isState = false;
    expect(!!(p1.isState)).to.equal(true);
    expect(!!(p2.isState)).to.equal(true);
    expect(!!(p3.isState)).to.equal(true);

  });
});
