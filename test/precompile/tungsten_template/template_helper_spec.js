'use strict';
var templateHelper = require('../../../precompile/tungsten_template/template_helper');
var Template = require('../../../src/template/template');

describe('template_helper public API', function() {
  describe('compileTemplates', function() {
    it('should be a function', function() {
      expect(templateHelper.compileTemplates).to.be.a.function;
      expect(templateHelper.compileTemplates).to.have.length(1);
    });
    it('can take a string', function() {
      var src = '<div>{{foo}}</div>';
      var template = templateHelper.compileTemplates(src);
      expect(template).to.be.an.instanceof(Template);
      expect(template.toSource()).to.equal(src);
    });
    it('can take a object', function() {
      var src = {
        foo: '<div>{{foo}}</div>',
        bar: '<div>{{bar}}</div>'
      };
      var templates = templateHelper.compileTemplates(src);
      expect(templates).to.have.keys(['foo', 'bar']);

      expect(templates.foo).to.be.an.instanceof(Template);
      expect(templates.foo.toSource()).to.equal(src.foo);

      expect(templates.bar).to.be.an.instanceof(Template);
      expect(templates.bar.toSource()).to.equal(src.bar);
    });
  });
});
