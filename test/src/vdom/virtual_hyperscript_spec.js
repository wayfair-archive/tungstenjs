'use strict';
var h = require('../../../src/vdom/virtual_hyperscript');
/**
 * Virtual Hyperscript tests modified from virtual-hyperscript
 * at https://github.com/Raynos/virtual-hyperscript/blob/master/test/h.js
 *    Copyright (c) 2014 Raynos.
 *    Permission is hereby granted, free of charge, to any person obtaining a copy
 *    of this software and associated documentation files (the "Software"), to deal
 *    in the Software without restriction, including without limitation the rights
 *    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *    copies of the Software, and to permit persons to whom the Software is
 *    furnished to do so, subject to the following conditions:
 *    The above copyright notice and this permission notice shall be included in
 *    all copies or substantial portions of the Software.
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *    THE SOFTWARE.
 */
describe('virtual_hyperscript public API', function() {
  it('should be a function', function() {
    expect(h).to.be.a('function');
  });
  it('should accept three arguments', function() {
    expect(h).to.have.length(3);
  });
  it('should returns a vnode', function() {
    expect(h('div').tagName).to.equal('div');
  });
  it('should have props', function() {
    expect(h('div', {
      foo: 'bar'
    }).properties.foo).to.equal('bar');
  });
  it('should work with text', function() {
    var node = h('div', 'text');
    expect(node.children[0].text).to.equal('text');
  });
  it('should work with key', function() {
    var node = h('div', {key: 'bar'});
    expect(node.key).to.equal('bar');
  });
  it('should work with data-', function() {
    var node = h('div', {'data-foo': 'bar'});
    expect(node.properties['data-foo']).to.equal('bar');
  });
  it('should work with child', function() {
    var node = h('div', h('span'));
    expect(node.children[0].tagName).to.equal('span');
  });
  it('should work with children', function() {
    var node = h('div', [h('span')]);
    expect(node.children[0].tagName).to.equal('span');
  });
  it('should work with null', function() {
    var node = h('div', null);
    var node2 = h('div', [null]);
    expect(node.children).to.have.length(0);
    expect(node2.children).to.have.length(0);
  });
  it('should work with undefined', function() {
    var node = h('div', undefined);
    var node2 = h('div', [undefined]);
    expect(node.children).to.have.length(0);
    expect(node2.children).to.have.length(0);
  });
  it('should work with namespace', function() {
    var node = h('div', { namespace: 'http://www.w3.org/2000/svg' });
    expect(node.namespace = 'http://www.w3.org/2000/svg');
  });
  it('should work with two ids', function() {
    var node = h('#foo', {id: 'bar'});
    expect(node.properties.id).to.equal('bar');
  });
});