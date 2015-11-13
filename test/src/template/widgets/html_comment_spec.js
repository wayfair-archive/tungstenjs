'use strict';

var HTMLCommentWidget = require('../../../../src/template/widgets/html_comment.js');

describe('html_comment.js public API', function() {
  it('should be a function', function() {
    expect(HTMLCommentWidget).to.be.a('function');
    expect(HTMLCommentWidget).to.have.length(1);
  });
  describe('html_comment prototype', function() {
    var comment, text;
    beforeEach(function() {
      text = 'comment';
      comment = new HTMLCommentWidget(text);
    });
    it('should have a property text', function() {
      expect(comment.text).to.equal(text);
    });
    it('should have a property type', function() {
      expect(comment.type).to.equal('Widget');
    });
    describe('HtmlComment.init', function() {
      it('should have an init function', function() {
        expect(comment.init).to.be.a('function');
        expect(comment.init).to.have.length(0);
        expect(comment.init).to.equal(HTMLCommentWidget.prototype.init);
      });
      it('should create an HTML comment node', function() {
        var output = comment.init();
        expect(output.nodeType).to.equal(document.COMMENT_NODE);
        expect(output.nodeValue).to.equal(text);
      });
    });
    describe('HtmlComment.update', function() {
      it('should have an update function', function() {
        expect(comment.update).to.be.a('function');
        expect(comment.update).to.have.length(2);
        expect(comment.update).to.equal(HTMLCommentWidget.prototype.update);
      });
      it('should update a node', function() {
        var prev = new HTMLCommentWidget('old value');
        var elem = prev.init();
        comment.update(prev, elem);
        expect(elem.nodeValue).to.equal(text);
      });
      it('should not a node if the values match', function() {
        var oldValue = 'old value';
        var prev = new HTMLCommentWidget(oldValue);
        var elem = prev.init();
        comment.update(comment, elem);
        expect(elem.nodeValue).to.equal(oldValue);
      });
    });
    /* develblock:start */
    describe('HtmlComment.templateToString', function() {
      it('should have a templateToString function', function() {
        expect(comment.templateToString).to.be.a('function');
        expect(comment.templateToString).to.have.length(1);
        expect(comment.templateToString).to.equal(HTMLCommentWidget.prototype.templateToString);
      });
      it('should be able to create an escaped string', function() {
        expect(comment.templateToString(true)).to.equal('&lt;!-- ' + text + ' --&gt;');
      });
      it('should be able to create an unescaped string', function() {
        expect(comment.templateToString(false)).to.equal('<!-- ' + text + ' -->');

      });
    });
    /* develblock:end */
  });
});
