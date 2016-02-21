/**
 * Exposes bits of the virtual-dom library for use in Tungsten
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */
/**
 * Exposes bits of the virtual-dom library for use in Tungsten
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */
'use strict';

import vdom from 'virtual-dom';
import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import isVNode from 'virtual-dom/vnode/is-vnode';
import isVText from 'virtual-dom/vnode/is-vtext';
import isWidget from 'virtual-dom/vnode/is-widget';
import isHook from 'virtual-dom/vnode/is-vhook';

module.exports = {
  vdom: vdom,
  VNode: VNode,
  VText: VText,
  isVNode: isVNode,
  isVText: isVText,
  isWidget: isWidget,
  isHook: isHook
};