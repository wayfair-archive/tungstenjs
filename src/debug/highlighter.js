'use strict';

/**
 * Chrome DevTools-esque plugin to highlight DOM elements from debugger panel
 */


var isNode = require('./is_node');
var highlightCSS = document.createElement('style');
highlightCSS.innerHTML = isNode ? '' : require('!!tungsten_debug?static!./highlighter.css');
document.head.appendChild(highlightCSS);

var overlayEl = document.createElement('div');
overlayEl.id = 'tungstenDebugOverlay';

var targetClass = 'tungstenDebugTarget';
var highlightClass = 'tungstenDebugHighlight';
var wrapperClass = 'tungstenDebugHighlight tungstenDebugHighlightWrapper';

var highlightElements = [];
function ensureHighlightElements(num) {
  for (var i = highlightElements.length; i < num; i++) {
    var highlightEl = document.createElement('div');
    highlightEl.className = highlightClass;
    highlightElements[i] = highlightEl;
    overlayEl.appendChild(highlightEl);
  }
}

var targetElements = [];
function ensureTargetElements(num) {
  for (var i = targetElements.length; i < num; i++) {
    var targetEl = document.createElement('div');
    targetEl.className = targetClass;
    targetElements[i] = targetEl;
    overlayEl.appendChild(targetEl);
  }
}

document.body.appendChild(overlayEl);

function setElementBox(elem, targetEl, label) {
  var box = targetEl.getBoundingClientRect();
  elem.style.display = 'block';
  // height and width are IE9+, so just math them
  elem.style.height = (box.bottom - box.top) + 'px';
  elem.style.width = (box.right - box.left) + 'px';
  elem.style.left = box.left + 'px';
  elem.style.top = box.top + 'px';
  elem.setAttribute('data-label', label);
}

function unhighlightInner() {
  for (var i = highlightElements.length; i--;) {
    highlightElements[i].style.display = 'none';
  }
}

var overlayShown = false;
function unhighlight() {
  if (!overlayShown) {
    overlayEl.style.display = 'none';
  }
  overlayEl.className = '';
  unhighlightInner();
}

function highlight(el, label) {
  unhighlightInner();
  if (el) {
    overlayEl.style.display = '';
    overlayEl.className = 'tungstenDebugOverlayHover';
    if (el.length && !label) {
      // highlight multiple
      var numElems = el.length - 1;
      ensureHighlightElements(numElems + 1);
      for (var i = 0; i <= numElems; i++) {
        highlightElements[i].className = i === numElems ? highlightClass : wrapperClass;
        setElementBox(highlightElements[i], el[i][0], el[i][1]);
      }
    } else {
      ensureHighlightElements(1);
      setElementBox(highlightElements[0], el, label);
    }
  }
}

function indicateTargets(elems) {
  ensureTargetElements(elems.length);
  for (var i = 0; i < elems.length; i++) {
    setElementBox(targetElements[i], elems[i]);
  }
}

function hideTargets() {
  for (var i = targetElements.length; i--;) {
    targetElements[i].style.display = 'none';
  }
}

function showOverlay() {
  overlayShown = true;
  unhighlightInner();
  overlayEl.style.display = '';
}

function hideOverlay() {
  overlayShown = false;
  unhighlight();
}
unhighlight();
overlayEl.tabindex = -1;

module.exports = {
  highlight: highlight,
  unhighlight: unhighlight,
  showOverlay: showOverlay,
  hideOverlay: hideOverlay,
  indicateTargets: indicateTargets,
  hideTargets: hideTargets
};
