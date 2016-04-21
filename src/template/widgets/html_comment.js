/**
 * Widget wrapper for HTML Comment
 * Widgets in Virtual-Dom have three lifecycle methods: init, update, destroy
 * 'init' is called when the new VTree contains a widget that the old VTree does not
 * 'update' is called when the old and the new VTree contains a widget at the same position
 * 'destroy' is called when the old VTree contains a widget that the new VTree does not
 *
 * @author    Matt DeGennaro <mdegennaro@wayfair.com>
 */

'use strict';
var document = require('global/document');

/**
 * Wrapper Widget for child views
 * @param {String} text    Text of comment
 */
function HTMLCommentWidget(text) {
  this.text = text.toString();
}

/**
 * Type indicator for Virtual-Dom
 * @type {String}
 */
HTMLCommentWidget.prototype.type = 'Widget';

/**
 * Render the view's template to DOM nodes and attach a view to it
 * @return {Element} DOM node with the child view attached
 */
HTMLCommentWidget.prototype.init = function init() {
  return document.createComment(this.text);
};

/**
 * Updates an existing childView
 * @param  {BackboneViewWidget} prev Widget instance from old VTree
 * @param  {Element}            elem DOM node to act upon
 */
HTMLCommentWidget.prototype.update = function update(prev, elem) {
  if (this.text !== prev.text) {
    elem.nodeValue = this.text;
  }
};

if (typeof TUNGSTENJS_DEBUG_MODE !== 'undefined') {
  HTMLCommentWidget.prototype.templateToString = function() {
    return '<span class="TemplateString_comment">&lt;!-- ' + this.text + ' --&gt;</span>';
  };
}

module.exports = HTMLCommentWidget;
