var DomStack = require('../../../../src/template/stacks/dom');
var compiler = require('../../../../precompile/tungsten_template/inline');
describe('DomStack', function() {
  it('should be a function', function() {
    expect(DomStack).to.be.a('function');
    expect(DomStack).to.have.length(2);
  });
  it('should flatten strings', function() {
    // Adding Mustache comment to compile template without needed lookup data
    var template = compiler(`<div>\nasdf\n{{!foo}}\n\n</div>`);
    var output = template.toDom({});
    expect(output.nodeType).to.equal(1); // 1 === Node.ELEMENT_NODE
    expect(output.childNodes.length).to.equal(1);
  });
  it('should flatten top level strings', function() {
    var template = compiler(`\nasdf\n{{!foo}}\n\n`);
    var output = template.toDom({});
    expect(output.nodeType).to.equal(3); // 3 === Node.TEXT_NODE
  });
});
