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
