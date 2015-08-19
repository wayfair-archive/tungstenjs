/**
 * Exposes bits of the virtual-dom library for use in Tungsten
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */
'use strict';

var vdom = require('virtual-dom');
var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');
var isVNode = require('virtual-dom/vnode/is-vnode');
var isVText = require('virtual-dom/vnode/is-vtext');
var isWidget = require('virtual-dom/vnode/is-widget');
var isHook = require('virtual-dom/vnode/is-vhook');

module.exports = {
  vdom: vdom,
  VNode: VNode,
  VText: VText,
  isVNode: isVNode,
  isVText: isVText,
  isWidget: isWidget,
  isHook: isHook
};