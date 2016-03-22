var VdomStack = require('../../../../src/template/stacks/vdom');
var tungsten = require('../../../../src/tungsten');
describe('processObject', function() {
  var stack, props, children;
  beforeEach(function() {
    stack = new VdomStack(), props = {}, children = [{}];
  });
  afterEach(function() {
    stack = null, props = null, children = null;
  });
  it('should be a function', function() {
    expect(stack.processObject).to.be.a('function');
    expect(stack.processObject).to.have.length(1);
  });
  it('should call tungsten.createVNode', function() {
    spyOn(tungsten, 'createVNode');
    stack.processObject({type: 'node', properties: props, tagName: 'div', children: children});
    jasmineExpect(tungsten.createVNode.calls.mostRecent().args[0]).toEqual('div');
    jasmineExpect(tungsten.createVNode.calls.mostRecent().args[1]).toEqual(props);
    jasmineExpect(tungsten.createVNode.calls.mostRecent().args[2]).toEqual(children);
    tungsten.createVNode.calls.reset();
  });
  it('should not pass through children if node type is noscript', function() {
    spyOn(tungsten, 'createVNode');
    stack.processObject({type: 'node', properties: props, tagName: 'noscript', children: children});
    jasmineExpect(tungsten.createVNode.calls.mostRecent().args[0]).toEqual('noscript');
    jasmineExpect(tungsten.createVNode.calls.mostRecent().args[1]).toEqual(props);
    jasmineExpect(JSON.stringify(tungsten.createVNode.calls.mostRecent().args[2])).toEqual(JSON.stringify([]));
    tungsten.createVNode.calls.reset();
  });
});
