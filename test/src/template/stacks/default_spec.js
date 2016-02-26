var DefaultStack = require('../../../../src/template/stacks/default');

define('default_stack private functions', function() {
  describe('doesSupportWhitespaceTextNodes', function() {
    it('should be a function', function() {
      expect(DefaultStack.doesSupportWhitespaceTextNodes).to.be.a('function');
      expect(DefaultStack.doesSupportWhitespaceTextNodes).to.have.length(0);
    });
    it('should return true if in node', function() {
      var doc = global.document;
      global.document = undefined;
      expect(DefaultStack.doesSupportWhitespaceTextNodes()).to.equal(true);
      global.document = doc;
    });
  });

  var stack;
  beforeEach(function() {
    stack = new DefaultStack(true);
  });
  afterEach(function() {
    stack = null;
  });
  describe('_closeElem', function() {
    var currentVal = DefaultStack.supportsWhitespaceTextNodes;
    afterEach(function() {
      DefaultStack.supportsWhitespaceTextNodes = currentVal;
    });
    it('should be a function', function() {
      expect(stack._closeElem).to.be.a('function');
      expect(stack._closeElem).to.have.length(1);
    });
    it('should strip whitespace text nodes if not supported', function() {
      DefaultStack.supportsWhitespaceTextNodes = false;
      var whitespaceValue = '   ';
      var nonWhitespaceValue = 'abc';
      var nonStringValue = {};
      var node = {
        type: 'node',
        children: [whitespaceValue, nonWhitespaceValue, nonStringValue]
      };
      stack._closeElem(node);
      expect(node.children).to.have.length(2);
      expect(node.children).to.deep.equal([nonWhitespaceValue, nonStringValue]);
    });
    it('should preserve whitespace text nodes if supported', function() {
      DefaultStack.supportsWhitespaceTextNodes = true;
      var whitespaceValue = '   ';
      var nonWhitespaceValue = 'abc';
      var nonStringValue = {};
      var node = {
        type: 'node',
        children: [whitespaceValue, nonWhitespaceValue, nonStringValue]
      };
      stack._closeElem(node);
      expect(node.children).to.have.length(3);
      expect(node.children).to.deep.equal([whitespaceValue, nonWhitespaceValue, nonStringValue]);
    });
    it('should remove empty contents', function() {
      DefaultStack.supportsWhitespaceTextNodes = true;
      var node = {
        type: 'node',
        children: ['']
      };
      stack._closeElem(node);
      expect(node.children).to.have.length(0);
    });
  });
  describe('createObject', function() {
    it('should be a function', function() {
      expect(stack.createObject).to.be.a('function');
      expect(stack.createObject).to.have.length(2);
    });
    it('should assign an ID to widgets', function() {
      var node = { type: 'Widget' };
      stack.createObject(node);
      expect(node.id).not.to.be.undefined;
    });
  });
  describe('openElement', function() {
    it('should be a function', function() {
      expect(stack.openElement).to.be.a('function');
      expect(stack.openElement).to.have.length(2);
    });
    it('should return an element', function() {
      var attrs = {};
      var elem = stack.openElement('div', attrs);
      expect(elem.tagName).to.equal('div');
      expect(elem.properties.attributes).to.equal(attrs);
      expect(elem.id).not.to.be.undefined;
    });
  });
  describe('closeElement', function() {
    it('should be a function', function() {
      expect(stack.closeElement).to.be.a('function');
      expect(stack.closeElement).to.have.length(1);
    });
    beforeEach(function() {
      console.warn.calls.reset();
    });
    it('should warn when closing an un-opened element', function() {
      stack.closeElement({ tagName: 'div', id: 0 });
      jasmineExpect(console.warn).toHaveBeenCalled();
    });
    it('should warn when closing an unpaired element', function() {
      var elem = stack.openElement('div', {});
      stack.closeElement({ tagName: 'div', id: elem.id + '.1' });
      jasmineExpect(console.warn).toHaveBeenCalled();
    });
    it('should try to compensate for an unpaired close tag', function() {
      stack.openElement('div', {});
      stack.openElement('span', {});
      stack.closeElement({ tagName: 'div' });
      jasmineExpect(console.warn).toHaveBeenCalled();
      expect(stack.result).to.have.length(1);
      expect(stack.result[0].children).to.have.length(1);
    });
    it('should deal with a stray close p tag', function() {
      stack.closeElement({ tagName: 'p', id: 0 });
      jasmineExpect(console.warn).not.toHaveBeenCalled();
      expect(stack.result).to.have.length(1);
    });
  });
  describe('getOutput', function() {
    it('should be a function', function() {
      expect(stack.getOutput).to.be.a('function');
      expect(stack.getOutput).to.have.length(0);
    });
    it('should close stray open elements', function() {
      var elem = stack.openElement('div', {});
      stack.closeElement(elem);
      stack.openElement('div', {});
      expect(stack.result).to.have.length(1);
      expect(stack.stack).to.have.length(1);
      var result = stack.getOutput();
      expect(result).to.have.length(2);
    });
  });
});
