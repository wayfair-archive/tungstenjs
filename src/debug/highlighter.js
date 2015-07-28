'use strict';

var highlightCSS = document.createElement('style');
highlightCSS.innerHTML = '#tungstenDebugOverlay{position:fixed;background-color:rgba(255,255,255,0.005);top:0;left:0;height:100%;width:100%;z-index:5000;pointer-events:none}' +
  '#tungstenDebugHighlight{position:relative;left:-10000px;background-color:rgba(200,0,0,0.5);pointer-events:none}' +
  '#tungstenDebugHighlight:after{content:attr(data-label);background-color:#FFFF80;border:1px solid #000;padding:5px;display:block;position:absolute;bottom:-2em;white-space: nowrap;z-index:5001}';
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
overlayEl.focus();

module.exports = highlight;
