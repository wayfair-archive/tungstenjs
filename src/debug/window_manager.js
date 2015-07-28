'use strict';

var debugPane = document.createElement('div');
debugPane.id = 'tungsten-debug-panel';

var label = document.createElement('h2');
label.innerHTML = 'Tungsten Debug Panel';

var style = document.createElement('style');
var css = '#tungsten-debug-panel {' +
  'border-top: 1px solid #000;' +
  'background-color:#fff;' +
  'position:fixed;' +
  'left:0;' +
  'width:100%;' +
  'word-wrap:break-word;' +
  'padding:10px;' +
  'box-sizing:border-box;' +
  'height:5%;' +
  'bottom:0;' +
  'overflow:auto;' +
  'transition:height 0.5s;' +
  'z-index:1000000000' +
'}';
css += '#tungsten-debug-panel:hover {height:50%}';
css += '#tungsten-debug-panel h2 {margin:0 0 10px}';
css += '#tungsten-debug-panel .template ins {color:#24D445}';
css += '#tungsten-debug-panel .template del {color:#EC2D2D}';
css += '#tungsten-debug-panel .child-container:not(:empty):before {content:"Children:";display:block}';
css += '#tungsten-debug-panel .child-container {margin-left: 10px}';
css += '#tungsten-debug-panel details details {padding-left:15px}';
css += '#tungsten-debug-panel-placeholder {height:5%;width:1px;position:absolute}';
style.innerHTML = css;

var debugWrapper = document.createElement('div');

debugPane.appendChild(label);
debugPane.appendChild(style);
debugPane.appendChild(debugWrapper);
document.body.appendChild(debugPane);

var placeholder = document.createElement('div');
placeholder.id = 'tungsten-debug-panel-placeholder';
document.body.appendChild(placeholder);

function getExpandable(name) {
  var details = document.createElement('details');
  var summary = document.createElement('summary');
  summary.innerHTML = name;
  details.appendChild(summary);
  return details;
}

var debugPanel = {};
function getDebugPanel(view) {
  var debugName = view.getDebugName();
  var wrapper = debugWrapper;
  if (view.parentView) {
    wrapper = getDebugPanel(view.parentView);
    wrapper = wrapper.getElementsByClassName('child-container')[0];
  }
  if (debugPanel[debugName] == null) {
    var details = getExpandable(debugName);

    var templateWrapper = getExpandable('Template validation');
    var templateDiff = document.createElement('pre');
    templateDiff.className = 'template';
    templateDiff.appendChild(document.createElement('code'));
    templateWrapper.appendChild(templateDiff);

    var childContainer = document.createElement('div');
    childContainer.className = 'child-container';

    details.appendChild(templateWrapper);
    details.appendChild(childContainer);
    wrapper.appendChild(details);

    debugPanel[debugName] = details;
  }

  return debugPanel[debugName];
}

var diffText = require('./text_diff');
exports.validateVdom = function(view, expected, actual) {
  var output = getDebugPanel(view);
  output.style.display = 'none';
  var diff = diffText(expected.toLowerCase(), actual.toLowerCase());
  output.getElementsByTagName('code')[0].innerHTML = diff;
  output.style.display = '';
};

exports.removeDebugPanel = function(view) {
  var debugName = view.getDebugName();
  var panel = debugPanel[debugName];
  if (panel) {
    panel.parentNode.removeChild(panel);
    debugPanel[debugName] = null;
  }
};