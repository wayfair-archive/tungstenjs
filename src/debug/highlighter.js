'use strict';

/**
 * Chrome DevTools-esque plugin to highlight DOM elements from debugger panel
 */

var highlightCSS = document.createElement('style');
highlightCSS.innerHTML = require('!!tungsten_debug?static!./highlighter.css');
document.head.appendChild(highlightCSS);

var overlayEl = document.createElement('div');
overlayEl.id = 'tungstenDebugOverlay';

var highlightEl = document.createElement('div');
highlightEl.id = 'tungstenDebugHighlight';

overlayEl.appendChild(highlightEl);
document.body.appendChild(overlayEl);

function highlightBox(box, label) {
  highlightEl.style.display = 'block';
  highlightEl.style.height = box.height + 'px';
  highlightEl.style.width = box.width + 'px';
  highlightEl.style.left = box.left + 'px';
  highlightEl.style.top = box.top + 'px';
  highlightEl.setAttribute('data-label', label);
}

var highlightedElement;

function highlight(el, label) {
  if (el) {
    highlightedElement = el;
    overlayEl.style.display = '';
    highlightBox(el.getBoundingClientRect(), label);
  } else {
    highlightedElement = null;
    highlightEl.style.display = 'none';
    overlayEl.style.display = 'none';
  }
}

overlayEl.tabindex = -1;

module.exports = highlight;
