/**
 * Forked from virtual-dom
 * @source https://github.com/Matt-Esch/virtual-dom/blob/master/virtual-hyperscript/index.js
 *
 * @license MIT
 *
 * Copyright (c) 2014 Matt-Esch.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/**
 * Forked from virtual-dom
 * @source https://github.com/Matt-Esch/virtual-dom/blob/master/virtual-hyperscript/index.js
 *
 * @license MIT
 *
 * Copyright (c) 2014 Matt-Esch.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

'use strict';

import vdomImpl from './virtual_dom_implementation';
import isArray from 'x-is-array';
import ObjectPool from './../utils/object_pool';

var vnodePool = new ObjectPool(2000, vdomImpl.VNode, 'vdom');
vnodePool.preallocate(100);
// vtext only has one property that's guaranteed to be overwritten by the constructor
var vtextPool = new ObjectPool(1000, vdomImpl.VText);
vnodePool.preallocate(20);

function isChild(x) {
  return vdomImpl.isVNode(x) || vdomImpl.isVText(x) || vdomImpl.isWidget(x);
}

function isChildren(x) {
  return typeof x === 'string' || isArray(x) || isChild(x);
}

function addChild(c, childNodes) {
  if (typeof c === 'string') {
    childNodes.push(vtextPool.allocate(c));
  } else if (isChild(c)) {
    childNodes.push(c);
  } else if (isArray(c)) {
    for (var i = 0; i < c.length; i++) {
      addChild(c[i], childNodes);
    }
  } else if (c === null || c === undefined) {
    return;
  }
}

function h(tagName, properties, children) {
  var childNodes = [];
  var props, key, namespace;

  if (!children && isChildren(properties)) {
    children = properties;
    props = {};
  }

  props = props || properties || {};

  // support keys
  if (props.hasOwnProperty('key')) {
    key = props.key;
    props.key = undefined;
  }

  // support namespace
  if (props.hasOwnProperty('namespace')) {
    namespace = props.namespace;
    props.namespace = undefined;
  }

  if (children !== undefined && children !== null) {
    addChild(children, childNodes);
  }

  // Call constructor with allocated node
  return vnodePool.allocate(tagName, props, childNodes, key, namespace);
}

vdomImpl.VNode.prototype.recycleObj = function() {
  if (this.children) {
    for (var i = this.children.length; i--;) {
      if (typeof this.children[i].recycle === 'function') {
        this.children[i].recycle();
      }
    }
    this.children.length = 0;
  }
};

module.exports = h;