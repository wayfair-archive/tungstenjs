'use strict';

var ractiveAdaptor = require('../../../src/template/ractive_adaptor');
var ractiveTypes = require('../../../src/template/ractive_types');

var compiler = require('../../../precompile/tungsten_template/inline');
function getTemplate(templateStr, partials) {
  return compiler(templateStr || '', partials || {});
}


describe('ractive_adaptor.js public API', function() {
  describe('render', function() {
    var render = ractiveAdaptor.render;
    it('should be a function', function() {
      expect(render).to.be.a('function');
    });
    it('should not render undefined templates', function() {
      expect(render({})).to.equal(undefined);
    });
  });

  describe('attach', function() {
    var attach = ractiveAdaptor.attach;
    it('should be a function', function() {
      expect(attach).to.be.a('function');
    });
    it('should attempt to attach widgets', function() {
      var template = getTemplate('<div class="js-test {{foo}}">{{value}}</div><div class="js-not-test">{{value}}</div>');
      var template2 = getTemplate('<div><span class="js-testChildView1">{{value}}</span></div>');
      template2.view = {
        el: { nodeName: 'div' },
        childViews: {
          'js-test': function() {}
        }
      };
      var fakeWidgetConstructor = jasmine.createSpy('fakeWidgetConstructor').and.returnValue({});
      attach(template.templateObj, template2.view, fakeWidgetConstructor, {});
      expect(fakeWidgetConstructor.calls.count()).to.equal(1);
      fakeWidgetConstructor.calls.reset();
    });

  });

  describe('wrap', function() {
    var wrap = ractiveAdaptor.wrap;
    it('should be a function', function() {
      expect(wrap).to.be.a('function');
    });
    it('should wrap an element', function() {
      var template = getTemplate('<div>{{value}}</div>');
      var wrappedObj = wrap(template.templateObj);
      expect(wrappedObj.t).to.equal(ractiveTypes.ELEMENT);
      expect(wrappedObj.wrapped).to.equal(true);
      expect(wrappedObj.f).to.deep.equal(template.templateObj);
    });
    it('should wrap in a div by default', function() {
      var template = getTemplate('<div>{{value}}</div>');
      var wrappedObj = wrap(template.templateObj);
      expect(wrappedObj.e).to.equal('div');
    });
    it('should wrap a template in a chosen tag', function() {
      var TEST_TAG = 'p';
      var template = getTemplate('<div>{{value}}</div>');
      var wrappedObj = wrap(template.templateObj, TEST_TAG);
      expect(wrappedObj.e).to.equal(TEST_TAG);
    });
    it('should wrap the top-level element from a previous wrapping', function() {
      var template = getTemplate('<div>{{value}}</div>');
      var wrappedObj = wrap(template.templateObj);
      var wrappedObj2 = wrap(wrappedObj);
      expect(wrappedObj2.f).to.deep.equal(template.templateObj);
    });
  });
});
