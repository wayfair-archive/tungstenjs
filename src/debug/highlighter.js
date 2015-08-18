'use strict';

/**
 * Chrome DevTools-esque plugin to highlight DOM elements from debugger panel
 */

var highlightCSS = document.createElement('style');
highlightCSS.innerHTML = require('!!tungsten_debug?static!./highlighter.css');
document.head.appendChild(highlightCSS);

var overlayEl = document.createElement('div');
overlayEl.id = 'tungstenDebugOverlay';

var highlightClass = 'tungstenDebugHighlight';
var wrapperClass = 'tungstenDebugHighlight tungstenDebugHighlightWrapper';

var highlightElements = (function(num) {
  var elems = new Array(num);
  for (var i = 0; i < num; i++) {
    var highlightEl = document.createElement('div');
    highlightEl.className = highlightClass;
    elems[i] = highlightEl;
    overlayEl.appendChild(highlightEl);
  }
  return elems;
})(20);

document.body.appendChild(overlayEl);

function highlightBox(highlightEl, box, label) {
  highlightEl.style.display = 'block';
  highlightEl.style.height = box.height + 'px';
  highlightEl.style.width = box.width + 'px';
  highlightEl.style.left = box.left + 'px';
  highlightEl.style.top = box.top + 'px';
  highlightEl.setAttribute('data-label', label);
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
  unhighlightInner();
}

function highlight(el, label) {
  unhighlightInner();
  if (el) {
    overlayEl.style.display = '';
    if (el.length && !label) {
      // highlight multiple
      var numElems = el.length - 1;
      for (var i = 0; i <= numElems; i++) {
        highlightElements[i].className = i === numElems ? highlightClass : wrapperClass;
        highlightBox(highlightElements[i], el[i][0].getBoundingClientRect(), el[i][1]);
      }
    } else {
      highlightBox(highlightElements[0], el.getBoundingClientRect(), label);
    }
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
  hideOverlay: hideOverlay
};
