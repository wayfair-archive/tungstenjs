'use strict';

var htmlParser = require('../../../src/template/html_parser');
var DefaultStack = require('../../../src/template/stacks/default');

describe('html_parser public api', function() {
  it('should be a function', function() {
    expect(htmlParser).to.be.a('function');
    expect(htmlParser).to.have.length(2);
  });
  it('can be called with one argument and receive output', function() {
    var str = 'testing';
    expect(htmlParser(str)).to.equal(str);
  });
  it('can be passed a stack and receive no output', function() {
    var str = 'testing';
    var stack = new DefaultStack(true);
    var output = htmlParser(str, stack);
    expect(output).to.be.undefined;
    var stackOutput = stack.getOutput();
    expect(stackOutput).to.equal(str);
  });
  it('can parse HTML', function() {
    var output = htmlParser('<div class="foo"></div>');
    expect(output).to.be.a('object');
    expect(output).not.to.be.undefined;
    expect(output.tagName).to.equal('div');
    expect(output.properties).to.be.a('object');
    expect(output.properties.attributes).to.be.a('object');
    expect(output.properties.attributes.class).to.equal('foo');
  });
  it('can parse HTML comments', function() {
    var content = 'foo';
    var output = htmlParser('<!--' + content + '-->');
    expect(output).to.be.a('object');
    expect(output.type).to.equal('comment');
    expect(output.text).to.equal(content);
  });
});
