'use strict';

function tag(tagName) {
  return '<span class="TemplateString_tag">' + tagName + '</span>';
}
function attrName(name) {
  return '<span class="TemplateString_attrName">' + name + '</span>';
}
function attrValue(value) {
  return '<span class="TemplateString_attrValue">' + value + '</span>';
}
function attribute(name, value) {
  return attrName(name) + '=' + attrValue('&quot;' + value + '&quot;');
}
function comment(value) {
  return '<span class="TemplateString_comment">&lt;!--' + value + '--&gt;</span>';
}
function mustache(value, data) {
  var dataStr = '';
  if (data) {
    dataStr = ' data-value="' + encodeURIComponent(JSON.stringify(data)) + '"';
  }
  return '<span class="TemplateString_mustache js-mustache"' + dataStr + '>' + value + '</span>';
}

module.exports = {
  tag,
  attrName,
  attrValue,
  attribute,
  comment,
  mustache
};
