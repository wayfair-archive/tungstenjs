'use strict';

var htmlparser = require('htmlparser2');
var virtualHyperscript = require('../vdom/virtual_hyperscript');
var HTMLCommentWidget = require('./widgets/html_comment');

var result = [];
var stack = [];

/**
 * When an element is resolved, push it to the result or the parent item on the stack
 * @param  {Object} obj Text / Widget / or Tungsten node
 * @return {[type]}     [description]
 */
function closeElem(obj) {
  // if this is an element, create a VNode now so that count is set properly
  if (obj.tagName) {
    obj = virtualHyperscript(obj.tagName, obj.properties, obj.children);
  }

  var pushingTo;
  if (stack.length > 0) {
    pushingTo = stack[stack.length - 1].children;
  } else {
    pushingTo = result;
  }

  // Combine adjacent strings
  if (typeof obj === 'string' && typeof pushingTo[pushingTo.length - 1] === 'string') {
    pushingTo[pushingTo.length - 1] += obj;
  } else {
    pushingTo.push(obj);
  }
}

var parser = new htmlparser.Parser({
    onopentag: function(name, attributes) {
      var properties = {
        attributes: attributes
      };
      if (!attributes.contenteditable) {
        properties.contentEditable = 'inherit';
      }

      stack.push({
        tagName: name,
        properties: properties,
        children: []
      });
    },
    oncomment: function(text) {
      closeElem(new HTMLCommentWidget(text));
    },
    ontext: function(text) {
      closeElem(text);
    },
    onclosetag: function() {
      closeElem(stack.pop());
    }
}, {decodeEntities: true});

module.exports = function(html)  {
  result = [];
  stack = [];
  parser.write(html);
  parser.end();
  return result.length === 1 ? result[0] : result;
};
