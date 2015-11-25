'use strict';

var sharedUtils = require('../../precompile/tungsten_template/shared_utils.js');

describe('shared_utils.js public api', function() {
  describe('compileTemplate', function() {
    it('should be a function', function() {
      expect(sharedUtils.compileTemplate).to.be.a('function');
      expect(sharedUtils.compileTemplate).to.have.length(2);
    });

    function testTemplate(templateStr) {
      return function() {
        sharedUtils.compileTemplate(templateStr);
      };
    }
    it('should compile valid templates', function() {
      expect(testTemplate('<div></div>')).not.to.throw(/^Compilation error:/);
      expect(testTemplate('<div>{{a}}</div>')).not.to.throw(/^Compilation error:/);
      expect(testTemplate('<div><p>{{a}}</p></div>')).not.to.throw(/^Compilation error:/);
      expect(testTemplate('<span>{{#a}}{{/a}}</div>')).not.to.throw(/^Compilation error:/);
    });
    it('should fail to compile invalid templates', function() {
      expect(testTemplate('<span>{{#a}}')).to.throw(/^Compilation error:/);
      expect(testTemplate('<div>{{a}</div>')).to.throw(/^Compilation error:/);
      expect(testTemplate('<div{{a}}</div>')).to.throw(/^Compilation error:/);
    });
  });

  describe('findPartials', function() {
    it('should be a function', function() {
      expect(sharedUtils.findPartials).to.be.a('function');
      expect(sharedUtils.findPartials).to.have.length(1);
    });
    it('should identify partials inside a compiled template', function() {
      var templateStr = '';
      var partialNames = ['p1', 'p2', 'p3'];
      partialNames.forEach(function(partial) {
        templateStr += '<div>{{> ' + partial + ' }}</div>';
        templateStr += '{{#a}}{{> ' + partial + ' }}{{/a}}';
      });
      var template = sharedUtils.compileTemplate(templateStr);
      var foundPartials = sharedUtils.findPartials(template);
      expect(foundPartials).to.have.length(partialNames.length);
      expect(foundPartials).to.have.members(partialNames);
    });
  });

  describe('handleDynamicComments', function() {
    it('should be a function', function() {
      expect(sharedUtils.handleDynamicComments).to.be.a('function');
      expect(sharedUtils.handleDynamicComments).to.have.length(1);
    });
    it('should compile mustache inside commends', function() {
      var template = sharedUtils.compileTemplate('<!--{{a}}-->');
      expect(template).to.deep.equal([{
        t: 9,
        c: [{
          t: 2,
          r: 'a'
        }]
      }]);
    });
  });

  describe('parseInterpolatorString', function() {
    it('should be a function', function() {
      expect(sharedUtils.parseInterpolatorString).to.be.a('function');
      expect(sharedUtils.parseInterpolatorString).to.have.length(1);
    });
    it('should handle unexpected values', function() {
      expect(sharedUtils.parseInterpolatorString()).to.equal('');
      expect(sharedUtils.parseInterpolatorString({})).to.equal('');
    });
    it('should handle normal values', function() {
      var template = sharedUtils.compileTemplate('{{> abc}}');
      var partial = template[0];

      expect(partial).to.deep.equal({
        t: 8,
        r: 'abc'
      });
      expect(sharedUtils.parseInterpolatorString(partial)).to.equal('abc');
    });
    it('should handle dynamic values', function() {
      var template = sharedUtils.compileTemplate('{{> a/b/c}}');
      var partial = template[0];

      expect(partial).to.deep.equal({
        t: 8,
        x: {
          r: ['a', 'b', 'c'],
          s: '_0/_1/_2'
        }
      });
      expect(sharedUtils.parseInterpolatorString(partial)).to.equal('a/b/c');
    });
  });
});
