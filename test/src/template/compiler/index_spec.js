var compiler = require('../../../../src/template/compiler/index');
var compilerOptions;

describe('compiler', function() {
  it('should be a function', function() {
    expect(compiler).to.be.a.function;
    expect(compiler).to.have.length(2);
  });
  beforeEach(function() {
    compilerOptions = {
      strict: false,
      preserveWhitespace: true,
      logger: {
        warning: jasmine.createSpy('warn'),
        exception: jasmine.createSpy('exception')
      }
    };
  });
  afterEach(function() {
    compilerOptions = null;
  });
  it('should warn about closing tags for void elements', function() {
    compiler('<br></br>', compilerOptions);
    jasmineExpect(compilerOptions.logger.warning).toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).not.toHaveBeenCalled();
  });
  it('should error for unpaired tags', function() {
    compiler('<div></span>', compilerOptions);
    jasmineExpect(compilerOptions.logger.warning).not.toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).toHaveBeenCalled();
  });
  it('should error for unexpected mustache', function() {
    // $ is a hogan tag, so it will be parsed into something
    compiler('{{$foo}}{{/foo}}', compilerOptions);
    jasmineExpect(compilerOptions.logger.warning).not.toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).toHaveBeenCalled();
  });
  it('should error for unpaired tags', function() {
    compiler('</span>', compilerOptions);
    jasmineExpect(compilerOptions.logger.warning).not.toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).toHaveBeenCalled();
  });
  it('should correctly parse boolean attributes followed by mustache', function() {
    var template = '<input checked {{{attrs}}}>';
    var output = compiler(template, compilerOptions);
    jasmineExpect(compilerOptions.logger.warning).not.toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).not.toHaveBeenCalled();
    expect(output.templateObj[0].a.checked).to.be.true;
    expect(output.template.toSource()).to.equal(template);
  });
  it('should warn if a mustache string is used mid-attribute name', function() {
    compiler('<input data-{{{foo}}}="bar">', compilerOptions);
    jasmineExpect(compilerOptions.logger.warning).toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).not.toHaveBeenCalled();
  });
  it('should handle mustache strings in html comments', function() {
    var templates = [
      '<!-- {{foo}} -->',
      '<!-- {{#foo}} bar {{/foo}} -->',
      '<!-- baz {{foo}} bar -->'
    ];
    var outputs = templates.map(function(template) {
      return compiler(template, compilerOptions);
    });
    jasmineExpect(compilerOptions.logger.warning).not.toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).not.toHaveBeenCalled();
    for (var i = 0; i < templates.length; i++) {
      expect(outputs[i].template.toSource()).to.equal(templates[i]);
    }
  });
  it('should parse control comments', function() {
    var commentOnlyTemplate = '{{!foobar}}';
    var controlCommentTemplate = '{{!w/foobar}}';
    var commentOnly = compiler(commentOnlyTemplate, compilerOptions);
    var controlComment = compiler(controlCommentTemplate, compilerOptions);
    jasmineExpect(compilerOptions.logger.warning).not.toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).not.toHaveBeenCalled();
    expect(commentOnly.templateObj).to.have.length(0);
    expect(controlComment.templateObj).to.have.length(1);
    expect(commentOnly.template.toSource()).not.to.equal(commentOnlyTemplate);
    expect(controlComment.template.toSource()).to.equal(controlCommentTemplate);
  });
  it('should parse dynamicAttributes', function() {
    var output = compiler('<div {{#foo}}bar="baz"{{/foo}}></div>', compilerOptions);
    jasmineExpect(compilerOptions.logger.warning).not.toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).not.toHaveBeenCalled();
    expect(output.templateObj[0].m).to.have.length(1);
  });
  it('should normalize whitespace inside mustache tags', function() {
    var output = compiler('{{ > foo/bar }}', compilerOptions);
    jasmineExpect(compilerOptions.logger.warning).not.toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).not.toHaveBeenCalled();
    expect(output.templateObj).to.have.length(1);
    expect(output.template.toSource()).to.equal('{{>foo/bar}}');
  });
  it('should leave declared lambdas unparsed', function() {
    compilerOptions.lambdas = ['foo'];
    var output = compiler('<div>{{#foo}}</span><span>{{/foo}}</div>', compilerOptions);
    jasmineExpect(compilerOptions.logger.warning).not.toHaveBeenCalled();
    jasmineExpect(compilerOptions.logger.exception).not.toHaveBeenCalled();
    _console.log(output.templateObj);
    // expect(output.templateObj).to.have.length(1);
    // expect(output.template.toSource()).to.equal('{{>foo/bar}}');
  });
});
