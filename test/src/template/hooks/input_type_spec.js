/* eslint-disable new-cap */
'use strict';

var InputTypeHook = require('../../../../src/template/hooks/input_type.js');

describe('input_type.js', function() {

  it('should be a function', function() {
    expect(InputTypeHook).to.be.a('function');
    expect(InputTypeHook).to.have.length(1);
  });

  it('should have correct type', function() {
    expect(InputTypeHook.prototype.type).to.equal('InputTypeHook');
  });

  describe('constructor', function() {
    it('constructs with new', function() {
      var hook = new InputTypeHook();
      expect(hook).to.be.instanceof(InputTypeHook);
    });
    it('constructs without new', function() {
      var hook = InputTypeHook();
      expect(hook).to.be.instanceof(InputTypeHook);
    });
  });

  describe('hook', function() {
    beforeEach(function() {
      // Input mock with some call tracking
      this.mockInput = Object.defineProperties({}, {
        'calls': {
          value: {
            // default type value
            value: 'text',
            setCount: 0,
            getCount: 0,
            calledWith: []
          },
          writable: true
        },
        'tagName': {
          value: 'INPUT',
          enumerable: true
        },
        'type': {
          enumerable: true,
          get: function() {
            this.calls.getCount++;
            return this.calls.value;
          },
          set: function(newType) {
            this.calls.setCount++;
            this.calls.calledWith.push(newType);
            this.calls.value = newType;
          }
        }
      });
    });

    it('should be a function', function() {
      expect(InputTypeHook.prototype.hook).to.be.a('function');
      expect(InputTypeHook.prototype.hook).to.have.length(2);
    });

    it('should fallback to "text" type', function() {
      // instantiate a hook with unsupported input type
      var hook = InputTypeHook('calendar');
      // tell hook to look for [type] attribute
      hook.hook(this.mockInput, 'type');

      // expect input type to fall back to "text"
      expect(this.mockInput.type).to.equal('text');
      // expect one assignment with "text" value
      expect(this.mockInput.calls.setCount).to.equal(1);
      expect(this.mockInput.calls.calledWith).to.deep.equal(['text']);
    });

    it('should not fallback to "text" type', function() {
      // instantiate a hook with supported input type
      var hook = InputTypeHook('file');
      // tell hook to look for [type] attribute
      hook.hook(this.mockInput, 'type');

      // expect input type to fall back to "text"
      expect(this.mockInput.type).to.equal('file');
      // expect one assignment with "file" value
      expect(this.mockInput.calls.setCount).to.equal(1);
      expect(this.mockInput.calls.calledWith).to.deep.equal(['file']);
    });

    it('should not do anything', function() {
      // instantiate a hook with default input type
      var hook = InputTypeHook('text');
      // tell hook to look for [type] attribute
      hook.hook(this.mockInput, 'type');

      // expect input type to stay "text"
      expect(this.mockInput.type).to.equal('text');
      // expect no type assignments
      expect(this.mockInput.calls.setCount).to.equal(0);
      expect(this.mockInput.calls.calledWith).to.be.empty;
    });
  });
});
