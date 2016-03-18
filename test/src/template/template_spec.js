/**
 * template_spec.js
 *
 * Templates modified from qunit tests in https://github.com/thegrandpoobah/mustache.js
 * which forked from mustache unit tests, licensed @MIT:
 *  Copyright (c) 2009 Chris Wanstrath (Ruby)
 *  Copyright (c) 2010 Jan Lehnardt (JavaScript)
 *  Copyright (c) 2011 Vastardis Capital Services (Compiler)*
 *  Permission is hereby granted, free of charge, to any person obtaining
 *  a copy of this software and associated documentation files (the
 *  "Software"), to deal in the Software without restriction, including
 *  without limitation the rights to use, copy, modify, merge, publish,
 *  distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to
 *  the following conditions:*
 *  The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the Software.*
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 *  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 *  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 *  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @author    Andrew Rota <anrota@wayfair.com>
 */
'use strict';

// Our renderer has minor whitespace issues for Mustache Spec.
// Tests whose expected value have been changed are marked with "@adjusted"

var vdomToDom = require('../../../src/tungsten').toDOM;
var Context = require('../../../src/template/template_context');
var compiler = require('../../../precompile/tungsten_template/inline');

// Using simplified lookup functions
Context.setAdapterFunctions({
  initialize: function(view, parentContext) {
    if (view == null) {
      view = {};
    }
    this.parent = parentContext;
  },
  lookupValue: function(view, name) {
    var value = null;
    if (view && view[name] != null) {
      value = view[name];
    }
    return value;
  }
});

function getTemplate(templateStr, partials) {
  return compiler(templateStr || '', partials || {});
}
var d = document.createElement('div');
function domToString(dom) {
  var htmlString = '';
  if (dom) {
    if (dom.nodeType === 3) {
      d.textContent = dom.nodeValue;
      htmlString += d.innerHTML;
    } else if (dom.nodeType === 1) {
      htmlString += dom.outerHTML;
    } else if (dom.nodeType === 11) {
      htmlString += domToString(dom.childNodes);
    } else if (dom.length) {
      for (var i = 0; i < dom.length; i++) {
        htmlString += domToString(dom[i]);
      }
    }
  }
  return htmlString;
}

function toHtmlViaVdom(templateStr, data, partials) {
  var template = getTemplate(templateStr, partials);
  var docFrag = vdomToDom(template.toVdom(data));
  return domToString(docFrag.childNodes);
}
toHtmlViaVdom.suiteName = 'Vdom Stack';
toHtmlViaVdom.parsesTriple = true;
toHtmlViaVdom.entities = {
  escaped: {
    amp: '&amp;',
    lt: '&lt;',
    gt: '&gt;',
    quote: '"'
  },
  unescaped: {
    amp: '&amp;',
    lt: '&lt;',
    gt: '&gt;',
    quote: '"'
  }
};

function toHtmlViaDom(templateStr, data, partials) {
  var template = getTemplate(templateStr, partials);
  return domToString(template.toDom(data));
}
toHtmlViaDom.suiteName = 'Dom Stack';
toHtmlViaDom.parsesTriple = true;
toHtmlViaDom.entities = {
  escaped: {
    amp: '&amp;',
    lt: '&lt;',
    gt: '&gt;',
    quote: '"'
  },
  unescaped: {
    amp: '&amp;',
    lt: '&lt;',
    gt: '&gt;',
    quote: '"'
  }
};

function toHtmlViaString(templateStr, data, partials) {
  var template = getTemplate(templateStr, partials);
  return template.toString(data);
}
toHtmlViaString.suiteName = 'HtmlString Stack';
toHtmlViaString.parsesTriple = false;
toHtmlViaString.entities = {
  escaped: {
    amp: '&amp;',
    lt: '&lt;',
    gt: '&gt;',
    quote: '&quot;'
  },
  unescaped: {
    amp: '&',
    lt: '<',
    gt: '>',
    quote: '"'
  }
};

function compileOnly(templateStr) {
  return getTemplate(templateStr, {}).templateObj;
}
toHtmlViaString.compile = compileOnly;
toHtmlViaDom.compile = compileOnly;
toHtmlViaVdom.compile = compileOnly;

var specs = require('./get_template_spec_for_renderer');
specs(toHtmlViaString);
specs(toHtmlViaDom);
specs(toHtmlViaVdom);

describe('html comments', function() {
  var HtmlCommentWidget = require('../../../src/template/widgets/html_comment');
  it('can be parsed', function() {
    var content = ' FOO ';
    var template = compiler('<!--' + content + '-->');
    var output = template.toVdom();
    expect(output).to.be.instanceof(HtmlCommentWidget);
    expect(output.text).to.equal(content);
  });
  it('can contain mustache', function() {
    var template = compiler('<!--{{foo}}-->');
    var data = { foo: 'FOO' };
    var output = template.toVdom(data);
    expect(output).to.be.instanceof(HtmlCommentWidget);
    expect(output.text).to.equal(data.foo);
  });
});

describe('textarea value sets', function() {
  var TEST_VALUE = 'testvalue';
  var template = compiler('<textarea>{{value}}</textarea>');
  it('should render to vdom with the value property', function() {
    var output = template.toVdom({value: TEST_VALUE});
    expect(output.children.length).to.equal(0);
    expect(output.properties.value).to.equal(TEST_VALUE);
  });
  it('should render to dom with the value property', function() {
    var output = template.toDom({value: TEST_VALUE});
    expect(output.tagName.toLowerCase()).to.equal('textarea');
    expect(output.childNodes.length).to.equal(0);
    expect(output.value).to.equal(TEST_VALUE);
  });
  it('should render to string with a childNode', function() {
    var output = template.toString({value: TEST_VALUE});
    expect(output).to.equal('<textarea>' + TEST_VALUE + '</textarea>');
  });
});
describe('wrap', function() {
  it('should be able to access the adaptor\'s wrap function', function() {
    var template = getTemplate('<div>{{value}}</div>');
    var divWrappedTemplate = template.wrap();
    var pWrappedTemplate = template.wrap('p');
    expect(divWrappedTemplate.templateObj.e).to.equal('div');
    expect(pWrappedTemplate.templateObj.e).to.equal('p');
  });
});
describe('attachView', function() {
  var template = getTemplate('<div>{{value}}</div>');
  var template2 = getTemplate('<div>{{value}}</div>');
  template2.view = {el: {nodeName: 'div'}};
  var fakeWidgetConstructor = function() {
    return {};
  };
  it('should be able to access the adaptor\'s attachView function', function() {
    var output = template.attachView(template2.view, fakeWidgetConstructor);
    expect(output.view).to.deep.equal(template2.view);
  });
  it('should not modify the original template', function() {
    var template1 = getTemplate('<div class="js-child"></div>');
    var template2 = getTemplate('<div><div class="js-child"></div></div>');
    var widgetConstructor = function() { return {}; };
    var childView = function() {};
    childView.tungstenView = true;
    var view = {
      el: {nodeName: false},
      childViews: {
        'js-child': childView
      }
    };

    var output1 = template1.attachView(view, fakeWidgetConstructor);
    var output2 = template2.attachView(view, fakeWidgetConstructor);
    expect(template1.templateObj[0].t).to.equal(7);
    expect(output1.templateObj[0].type).to.equal('WidgetConstructor');
    expect(template2.templateObj[0].f[0].t).to.equal(7);
    expect(output2.templateObj[0].f[0].type).to.equal('WidgetConstructor');
  });
});
