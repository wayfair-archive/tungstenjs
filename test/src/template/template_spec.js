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

// Ractive's parser has minor whitespace issues for Mustache Spec.
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

    if (typeof value === 'function') {
      value = value.call(view);
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

var Hogan = require('hogan.js');
var _ = require('underscore');
function toHtmlViaHogan(templateStr, data, partials) {
  var template = Hogan.compile(templateStr || '');
  var partialTemplates = {};
  _.each(partials, function(str, name) {
    partialTemplates[name] = Hogan.compile(str);
  });
  return template.render(data || {}, partialTemplates);
}
toHtmlViaHogan.suiteName = 'Hogan.js';
toHtmlViaHogan.parsesTriple = false;
toHtmlViaHogan.entities = {
  escaped: {
    amp: '&amp;',
    lt: '&lt;',
    gt: '&gt;',
    quote: '&quot;',
    single: '&#39;'
  },
  unescaped: {
    amp: '&',
    lt: '<',
    gt: '>',
    quote: '"',
    single: '\''
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
// specs(toHtmlViaHogan);

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
  it('should be able to access the ractive adaptor\'s wrap function', function() {
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
  it('should be able to access the ractive adaptor\'s attachView function', function() {
    var output = template.attachView(template2.view, fakeWidgetConstructor);
    expect(output.view).to.deep.equal(template2.view);
  });
});
