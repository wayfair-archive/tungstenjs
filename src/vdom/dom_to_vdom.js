/*!
 * Forked from vdom-virtualize@0.5.1 by Marcel Klehr <mklehr@gmx.net>
 *
 * (MIT LICENSE)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

var _ = require('underscore');
var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');

/**
 * DOMNode property white list
 * Taken from https://github.com/Raynos/react/blob/dom-property-config/src/browser/ui/dom/DefaultDOMPropertyConfig.js
 */
var props = [
  'accept', 'accessKey', 'action', 'alt', 'async', 'autoComplete', 'autoPlay', 'cellPadding',
  'cellSpacing', 'checked', 'className', 'colSpan', 'content', 'contentEditable', 'controls',
  'crossOrigin', 'data', 'dataset', 'defer', 'dir', 'download', 'draggable', 'encType', 'formNoValidate',
  'href', 'hrefLang', 'htmlFor', 'httpEquiv', 'icon', 'id', 'label', 'lang', 'list', 'loop', 'max',
  'mediaGroup', 'method', 'min', 'multiple', 'muted', 'name', 'noValidate', 'pattern', 'placeholder',
  'poster', 'preload', 'radioGroup', 'readOnly', 'rel', 'required', 'rowSpan', 'sandbox', 'scope',
  'scrollLeft', 'scrolling', 'scrollTop', 'selected', 'span', 'spellCheck', 'src', 'srcDoc', 'srcSet',
  'start', 'step', 'style', 'tabIndex', 'target', 'title', 'type', 'value',

  // Non-standard Properties
  'autoCapitalize', 'autoCorrect', 'property', 'attributes'
];

function getElementProperties(el) {
  var obj = {}

  _.forEach(props, function(propName) {
    if(!el[propName]) return

    // Special case: style
    // .style is a DOMStyleDeclaration, thus we need to iterate over all
    // rules to create a hash of applied css properties.
    //
    // You can directly set a specific .style[prop] = value so patching with vdom
    // is possible.
    if("style" == propName) {
      var css = {}
        , styleProp
      for(var i=0; i<el.style.length; i++) {
        styleProp = el.style[i]
        css[styleProp] = el.style.getPropertyValue(styleProp) // XXX: add support for "!important" via getPropertyPriority()!
      }

      obj[propName] = css
      return
    }

    // Special case: dataset
    // we can iterate over .dataset with a simple for..in loop.
    // The all-time foo with data-* attribs is the dash-snake to camelCase
    // conversion.
    // However, I'm not sure if this is compatible with h()
    //
    // .dataset properties are directly accessible as transparent getters/setters, so
    // patching with vdom is possible.
    if("dataset" == propName) {
      var data = {}
      for(var p in el.dataset) {
        data[p] = el.dataset[p]
      }

      obj[propName] = data
      return
    }

    // Special case: attributes
    // some properties are only accessible via .attributes, so
    // that's what we'd do, if vdom-create-element could handle this.
    if("attributes" == propName) return
    if("tabIndex" == propName && el.tabIndex === -1) return


    // default: just copy the property
    obj[propName] = el[propName]
    return
  })

  return obj
}

function createFromTextNode(tNode) {
  return new VText(tNode.nodeValue);
}

function createFromElement(el) {
  var tagName = el.tagName,
    namespace = el.namespaceURI === 'http://www.w3.org/1999/xhtml' ? null : el.namespaceURI,
    properties = getElementProperties(el),
    children = [];

  for (var i = 0; i < el.childNodes.length; i++) {
    children.push(createVNode(el.childNodes[i] ));
  }

  var vnode = new VNode(tagName, properties, children, null, namespace);
  return vnode;
}

function createVNode(domNode) {
  if (domNode.nodeType === 1) {
    return createFromElement(domNode);
  }
  if (domNode.nodeType === 3) {
    return createFromTextNode(domNode);
  }
}

module.exports = createVNode;
