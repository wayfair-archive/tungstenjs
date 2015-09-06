'use strict';

var AmpersandAdaptor = require('../../../adaptors/ampersand');
var BaseModel = AmpersandAdaptor.Model;
var Ampersand = AmpersandAdaptor.Ampersand;

describe('base_model.js public api', function() {
  describe('extend', function() {
    it('should be a function', function() {
      expect(BaseModel.extend).to.be.a('function');
    });
    it('should accept one argument', function() {
      expect(BaseModel.extend.length).to.equal(1);
    });
    it('should be different than Ampersand\'s', function() {
      expect(BaseModel.extend).not.to.equal(Ampersand.Model.extend);
    });
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
      expect(BaseModel.prototype.set.length).to.equal(3);
    });
  });
  describe('postInitialize', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.postInitialize).to.be.a('function');
      expect(BaseModel.prototype.postInitialize.length).to.equal(0);
    });
  });
  describe('trigger', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.trigger).to.be.a('function');
      expect(BaseModel.prototype.trigger.length).to.equal(0);
    });
  });
  describe('reset', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.reset).to.be.a('function');
      expect(BaseModel.prototype.reset.length).to.equal(2);
    });
  });

  /* develblock:start */
  describe('initDebug', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.initDebug).to.be.a('function');
      expect(BaseModel.prototype.initDebug.length).to.equal(0);
    });
  });
  describe('getDebugName', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getDebugName).to.be.a('function');
      expect(BaseModel.prototype.getDebugName.length).to.equal(0);
    });
  });
  describe('getChildren', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getChildren).to.be.a('function');
      expect(BaseModel.prototype.getChildren.length).to.equal(0);
    });
  });
  describe('getFunctions', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getFunctions).to.be.a('function');
      expect(BaseModel.prototype.getFunctions.length).to.equal(2);
    });
  });
  describe('getPropertiesArray', function() {
    it('should be a function', function() {
      expect(BaseModel.prototype.getPropertiesArray).to.be.a('function');
      expect(BaseModel.prototype.getPropertiesArray.length).to.equal(0);
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
  it('init with nothing should be okay', function () {
    // extend requires {} for debug
    var EmptyModel = BaseModel.extend({});
    var something = new EmptyModel();
    something.foo = 'bar';
    expect(!!something).to.equal(true);
    expect(something.foo).to.equal('bar');
  });
  it('init with values', function () {
    var person = new Person({name: 'foo'});
    expect(!!person).to.equal(true);
    expect(person.name).to.equal('foo');
  });

  it('after initialized change should be empty until a set op', function () {
    var person = new Person({name: 'phil'});
    expect(person._changed).to.deep.equal({});
    expect(!!person.changedAttributes()).to.equal(false);
  });

  it('extended object maintains existing props', function () {
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

  it('extended object maintains existing methods', function () {
    var NewPerson = BaseModel.extend({
      props: {
        awesomeness: 'number'
      },
      isTrulyAwesome: function () {
        if (this.awesomeness > 10) return true;
      }
    });
    var AwesomePerson = NewPerson.extend({});
    var awesome = new AwesomePerson({
      awesomeness: 11
    });
    expect(!!awesome.isTrulyAwesome()).to.equal(true);
  });
  it('instanceof checks should pass for all parents in the chain', function () {
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