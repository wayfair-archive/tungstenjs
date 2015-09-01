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
/* global describe, it, require */
'use strict';

// Ractive's parser has minor whitespace issues for Mustache Spec.
//   Additionally, current compiler will only output valid HTML so {{{}}} don't leave character literals
// Tests whose expected value have been changed are marked with "@adjusted"

// Use Backbone adaptor
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

/**
 * QUnit to Jasmine mapper function
 *
 * @param  {[type]} actual      [description]
 * @param  {[type]} expected    [description]
 * @param  {[type]} description [description]
 *
 * @return {[type]}             [description]
 */
function equal(actual, expected, description) {
  it(description, function() {
    expect(actual).to.equal(expected);
  });
}

function getTemplate(templateStr, partials) {
  return compiler(templateStr || '', partials || {});
}

function toHTML(templateStr, data, partials) {
  var template = getTemplate(templateStr, partials);
  return template.toString(data);
}

describe('HTML composition', function() {
  equal(toHTML('<tr><div>{{hi}}</div></tr>', {
    hi: 'Hi.'
  }), '<tr><div>Hi.</div></tr>');

  equal(toHTML('<tr><p><div>{{hi}}</div></p></tr>', {
    hi: 'Hi.'
  }), '<tr><p></p><div>Hi.</div></tr>');

  equal(toHTML('<tr data-static="test" {{{attrs}}}></tr>', {
    attrs: 'data-test="true"'
  }), '<tr data-static="test" data-test="true"></tr>');

  equal(toHTML('<tr data-static="test" {{{attrs}}}></tr>', {
    attrs: 'data_test="true"'
  }), '<tr data-static="test" data_test="true"></tr>');

  equal(toHTML('<table>{{{row}}}</table>', {
    row: '<tr><td>Row</td></tr>'
  }), '<table><tr><td>Row</td></tr></table>');
});

/*
 * QUnit tests from https://github.com/thegrandpoobah/mustache.js
 */
describe('Argument validation', function() {
  equal(toHTML(undefined), '', 'No parameters');
  equal(toHTML('{{hi}}'), '', ' No View or Partials');
  equal(toHTML('{{hi}}', {
    hi: 'Hi.'
  }), 'Hi.', 'No Partials');
  equal(toHTML('{{>hi}}', undefined, {
    hi: '{{p}}'
  }), '', 'Partial but no view');
});

describe('Parser', function() {
  // matches whitespace_partial.html
  equal(
    toHTML(
      '<h1>{{  greeting  }}</h1>\n{{#partial}}{{> partial }}{{/partial}}\n<h3>{{ farewell }}</h3>', {
        greeting: function() {
          return 'Welcome';
        },

        farewell: function() {
          return 'Fair enough, right?';
        },

        partial: {
          name: 'Chris',
          value: 10000,
          taxed_value: function() {
            return this.value - (this.value * 0.4);
          },
          in_ca: true
        }
      }, {
        partial: 'Hello {{ name}}\nYou have just won ${{value }}!\n{{# in_ca  }}\nWell, ${{ taxed_value }}, after taxes.\n{{/  in_ca }}\n'
      }
    ),
    '<h1>Welcome</h1>\nHello Chris\nYou have just won $10000!\nWell, $6000, after taxes.\n\n<h3>Fair enough, right?</h3>',
    'Whitespace in Tag names'
  );

  equal(
    toHTML(
      '{{tag1}}\n\n\n{{tag2}}\n', {
        tag1: 'Hello',
        tag2: 'World'
      }, {}
    ),
    'Hello\n\n\nWorld\n',
    'Preservation of white space'
  );

});

describe('Basic Variables', function() {
  // matches escaped.html
  equal(
    toHTML(
      '<h1>{{title}}</h1>\nBut not {{entities}}.\n', {
        title: function() {
          return 'Bear > Shark';
        },
        entities: '&quot;'
      }, {}
    ),
    '<h1>Bear &gt; Shark</h1>\nBut not &amp;quot;.\n',
    'HTML Escaping'
  );

  // matches apostrophe.html (except in this implementation, apostrophes are not escaped.
  equal(
    toHTML(
      '{{apos}}{{control}}', {
        apos: '\'',
        control: 'X'
      }, {}
    ),
    '\'X',
    'Apostrophe escaping'
  );

  // matches null_string.html
  equal(
    toHTML(
      'Hello {{name}}\nglytch {{glytch}}\nbinary {{binary}}\nvalue {{value}}\nnumeric {{numeric}}', {
        name: 'Elise',
        glytch: true,
        binary: false,
        value: null,
        numeric: function() {
          return NaN;
        }
      }, {}
    ),
    'Hello Elise\nglytch true\nbinary false\nvalue \nnumeric NaN',
    'Different variable types'
  );

  // matches two_in_a_row.html
  equal(
    toHTML(
      '{{greeting}}, {{name}}!', {
        name: 'Joe',
        greeting: 'Welcome'
      }, {}
    ),
    'Welcome, Joe!'
  );

});

describe('Dot Notation', function() {
  equal(
    toHTML(
      '{{a.b.c}}', {
        a: {
          b: {
            c: 0
          }
        }
      }, {}
    ),
    '0'
  );

  equal(
    toHTML(
      '{{a.b.c}}', {
        a: {
          b: {}
        }
      }, {}
    ),
    ''
  );

  equal(
    toHTML(
      '{{a.b.c}}', {
        a: {
          b: 0
        }
      }, {}
    ),
    ''
  );

  equal(
    toHTML(
      '{{a.b.c}}', {
        a: {
          b: function() {
            return {
              c: 5
            };
          }
        }
      }, {}
    ),
    '5'
  );

  equal(
    toHTML(
      '{{#a.b.c}}{{d}}{{/a.b.c}}', {
        a: {
          b: function() {
            return {
              c: [{
                d: 'a'
              }, {
                d: 'b'
              }, {
                d: 'c'
              }]
            };
          }
        }
      }, {}
    ),
    'abc'
  );
});


describe('"{" or "&" (Unescaped Variable)', function() {
  // matches unescaped.html
  equal(
    toHTML(
      '<h1>{{{title}}}</h1>', {
        title: function() {
          return 'Bear > Shark';
        }
      }, {}
    ),
    // '<h1>Bear > Shark</h1>',
    '<h1>Bear &gt; Shark</h1>', // @adjusted
    '{ character'
  );

  equal(
    toHTML(
      '<h1>{{&title}}</h1>', {
        title: function() {
          return 'Bear > Shark';
        }
      }, {}
    ),
    // '<h1>Bear > Shark</h1>',
    '<h1>Bear &gt; Shark</h1>', // @adjusted
    '& character'
  );

  equal(
    toHTML(
      '<h1>{{title}}}</h1>', {
        title: 'Bear > Shark'
      }, {}
    ),
    '<h1>Bear &gt; Shark}</h1>', 'Potential false positive'
  );
});

describe('"#" (Sections)', function() {
  // matches array_of_partials_implicit_partial.html
  equal(
    toHTML(
      'Here is some stuff!\n{{#numbers}}{{>partial}}{{/numbers}}', {
        numbers: ['1', '2', '3', '4']
      }, {
        partial: '{{.}}'
      }
    ),
    'Here is some stuff!\n1234',
    'Array of Partials (Implicit)'
  );

  // matches array_of_partials_partial.html
  equal(
    toHTML(
      'Here is some stuff!\n{{#numbers}}{{>partial}}{{/numbers}}', {
        numbers: [{
          i: '1'
        }, {
          i: '2'
        }, {
          i: '3'
        }, {
          i: '4'
        }]
      }, {
        partial: '{{i}}'
      }
    ),
    'Here is some stuff!\n1234',
    'Array of Partials (Explicit)'
  );

  // matches array_of_strings.html
  equal(
    toHTML(
      '{{#array_of_strings}}{{.}} {{/array_of_strings}}', {
        array_of_strings: ['hello', 'world']
      }, {}
    ),
    'hello world ',
    'Array of Strings'
  );

  // matches recursion_with_same_names.html
  equal(
    toHTML(
      '{{ name }}\n{{ description }}\n\n{{#terms}}\n  {{name}}\n  {{index}}\n{{/terms}}\n', {
        name: 'name',
        description: 'desc',
        terms: [{
          name: 't1',
          index: 0
        }, {
          name: 't2',
          index: 1
        }]
      }, {}
    ),
    'name\ndesc\n  t1\n  0\n  t2\n  1\n'
  );

  // matches reuse_of_enumerables.html
  equal(
    toHTML(
      '{{#terms}}\n  {{name}}\n  {{index}}\n{{/terms}}\n{{#terms}}\n  {{name}}\n  {{index}}\n{{/terms}}\n', {
        terms: [{
          name: 't1',
          index: 0
        }, {
          name: 't2',
          index: 1
        }]
      }, {}
    ),
    '\n  t1\n  0\n\n  t2\n  1\n\n  t1\n  0\n\n  t2\n  1\n',
    'Lazy match of Section and Inverted Section'
  );

  // matches section_as_context.html
  equal(
    toHTML(
      '{{#a_object}}\n  <h1>{{title}}</h1>\n  <p>{{description}}</p>\n  <ul>\n    {{#a_list}}\n    <li>{{label}}</li>\n    {{/a_list}}\n  </ul>\n{{/a_object}}\n', {
        a_object: {
          title: 'this is an object',
          description: 'one of its attributes is a list',
          a_list: [{
            label: 'listitem1'
          }, {
            label: 'listitem2'
          }]
        }
      }, {}
    ),
    '\n  <h1>this is an object</h1>\n  <p>one of its attributes is a list</p>\n  <ul>\n    <li>listitem1</li>\n    <li>listitem2</li>\n  </ul>\n',
    'Lazy match of Section and Inverted Section'
  );

  // matches nesting.html
  equal(
    toHTML(
      '{{#foo}}\n  {{#a}}\n    {{b}}\n  {{/a}}\n{{/foo}}', {
        foo: [{
          a: {
            b: 1
          }
        }, {
          a: {
            b: 2
          }
        }, {
          a: {
            b: 3
          }
        }]
      }, {}
    ),
    // '  \n    1\n  \n    2\n  \n    3\n',
    '\n    1\n\n    2\n\n    3\n', // @adjusted
    'Context Nesting'
  );
});

describe('"^" (Inverted Section)', function() {
  // matches inverted_section.html
  equal(
    toHTML(
      '{{#repo}}<b>{{name}}</b>{{/repo}}\n{{^repo}}No repos :({{/repo}}\n', {
        'repo': []
      }, {}
    ),
    '\nNo repos :(\n'
  );
});

describe('">" (Partials)', function() {
  // matches view_partial.html
  equal(
    toHTML(
      '<h1>{{greeting}}</h1>\n{{#partial}}{{>partial}}{{/partial}}\n<h3>{{farewell}}</h3>', {
        greeting: function() {
          return 'Welcome';
        },

        farewell: function() {
          return 'Fair enough, right?';
        },

        partial: {
          name: 'Chris',
          value: 10000,
          taxed_value: function() {
            return this.value - (this.value * 0.4);
          },
          in_ca: true
        }
      }, {
        partial: 'Hello {{name}}\nYou have just won ${{value}}!\n{{#in_ca}}\nWell, ${{ taxed_value }}, after taxes.\n{{/in_ca}}\n'
      }
    ),
    '<h1>Welcome</h1>\nHello Chris\nYou have just won $10000!\nWell, $6000, after taxes.\n\n<h3>Fair enough, right?</h3>'
  );

  // matches array_partial.html
  equal(
    toHTML(
      '{{>partial}}', {
        array: ['1', '2', '3', '4']
      }, {
        partial: 'Here\'s a non-sense array of values\n{{#array}}\n  {{.}}\n{{/array}}'
      }
    ),
    'Here\'s a non-sense array of values\n  1\n  2\n  3\n  4\n'
  );

  // matches template_partial.html
  equal(
    toHTML(
      '<h1>{{title}}</h1>\n{{>partial}}', {
        title: function() {
          return 'Welcome';
        },
        again: 'Goodbye'
      }, {
        partial: 'Again, {{again}}!'
      }
    ),
    '<h1>Welcome</h1>\nAgain, Goodbye!'
  );

  // matches partial_recursion.html
  // Test disabled as it causes infinite recursion
  // equal(
  //   toHTML(
  //     '{{name}}\n{{#kids}}\n{{>partial}}\n{{/kids}}', {
  //       name: '1',
  //       kids: [{
  //         name: '1.1',
  //         children: [{
  //           name: '1.1.1'
  //         }]
  //       }]
  //     }, {
  //       partial: '{{name}}\n{{#children}}\n{{>partial}}\n{{/children}}'
  //     }
  //   ),
  //   '1\n1.1\n1.1.1\n'
  // );
});

describe('"=" (Set Delimiter)', function() {
  // matches delimiter.html
  equal(
    toHTML(
      '{{=<% %>=}}*\n<% first %>\n* <% second %>\n<%=| |=%>\n* | third |\n|={{ }}=|\n* {{ fourth }}', {
        first: 'It worked the first time.',
        second: 'And it worked the second time.',
        third: 'Then, surprisingly, it worked the third time.',
        fourth: 'Fourth time also fine!.'
      }, {}
    ),
    '*\nIt worked the first time.\n* And it worked the second time.\n* Then, surprisingly, it worked the third time.\n* Fourth time also fine!.',
    'Simple Set Delimiter'
  );

  equal(
    toHTML(
      '{{#noData}}{{=~~ ~~=}}Set Change Delimiter ~~data~~ ~~={{ }}=~~{{/noData}}', {
        noData: true,
        data: false
      }, {}
    ), 'Set Change Delimiter false ', 'Change Delimiter inside Section');
});

describe('"!" (Comments)', function() {
  equal(
    toHTML('{{! this is a single line comment !}}'),
    '',
    'Single Line Comments');

  equal(
    toHTML('{{!this is a multiline comment\ni said this is a multiline comment!}}'),
    '',
    'Multiline Comments');

  // matches comments.html
  equal(
    toHTML(
      '<h1>{{title}}{{! just something interesting... or not... !}}</h1>\n', {
        title: function() {
          return 'A Comedy of Errors';
        }
      }, {}
    ),
    '<h1>A Comedy of Errors</h1>\n'
  );
});

describe('Context Stack', function() {
  equal(
    toHTML(
      '{{#documents}}<tr>{{#field_values}}<td><a href="?view={{id}}">{{.}}</a></td>{{/field_values}}</tr>{{/documents}}', {
        documents: [{
          id: 'alpha',
          field_values: ['my', 'very', 'own', 'table']
        }, {
          id: 'beta'
        }, {
          id: 'delta',
          field_values: ['etc', 'etc', 'etc']
        }]
      }
    ),
    '<tr><td><a href="?view=alpha">my</a></td><td><a href="?view=alpha">very</a></td><td><a href="?view=alpha">own</a></td><td><a href="?view=alpha">table</a></td></tr><tr></tr><tr><td><a href="?view=delta">etc</a></td><td><a href="?view=delta">etc</a></td><td><a href="?view=delta">etc</a></td></tr>',
    'Correct stack-based interpolation.'
  );

  equal(
    toHTML('{{#a}}{{#b}}{{#c}}{{#d}}{{token}}{{/d}}{{/c}}{{/b}}{{/a}}', {
      a: {
        b: {
          c: true
        },
        d: {
          token: 'Mustache'
        }
      }
    }),
    'Mustache',
    'Correct stack-based interpolation.'
  );
});

describe('Empty', function() {
  // matches empty_template.html
  equal(
    toHTML(
      '<html><head></head><body><h1>Test</h1></body></html>', {}, {}
    ),
    '<html><head></head><body><h1>Test</h1></body></html>',
    'Empty Template'
  );

  // matches empty_partial.html
  equal(
    toHTML(
      'hey {{foo}}\n{{>partial}}\n', {
        foo: 1
      }
    ),
    // 'hey 1\n',
    'hey 1\n\n', // @adjusted
    'Empty Partial'
  );
});

describe('Demo', function() {
  // matches simple.html
  equal(
    toHTML(
      'Hello {{name}}\nYou have just won ${{value}}!\n{{#in_ca}}\nWell, ${{ taxed_value }}, after taxes.\n{{/in_ca}}', {
        name: 'Chris',
        value: 10000,
        taxed_value: function() {
          return this.value - (this.value * 0.4);
        },
        in_ca: true
      }, {}
    ),
    'Hello Chris\nYou have just won $10000!\nWell, $6000, after taxes.\n',
    'A simple template'
  );

  // matches complex.html
  var template = [
    '<h1>{{header}}</h1>',
    '{{#list}}',
    '  <ul>',
    '  {{#item}}',
    '  {{#current}}',
    '      <li><strong>{{name}}</strong></li>',
    '  {{/current}}',
    '  {{#link}}',
    '      <li><a href="{{url}}">{{name}}</a></li>',
    '  {{/link}}',
    '  {{/item}}',
    '  </ul>',
    '{{/list}}',
    '{{#empty}}',
    '  <p>The list is empty.</p>',
    '{{/empty}}'
  ].join('\n');

  var view = {
    header: function() {
      return 'Colors';
    },
    item: [{
      name: 'red',
      current: true,
      url: '#Red'
    }, {
      name: 'green',
      current: false,
      url: '#Green'
    }, {
      name: 'blue',
      current: false,
      url: '#Blue'
    }],
    link: function() {
      return this.current !== true;
    },
    list: function() {
      return this.item.length !== 0;
    },
    empty: function() {
      return this.item.length === 0;
    }
  };

  // var expectedResult = '<h1>Colors</h1>\n  <ul>\n  \n      <li><strong>red</strong></li>\n      <li><a href=\"#Red\">red</a></li>\n        <li><a href=\"#Green\">green</a></li>\n        <li><a href=\"#Blue\">blue</a></li>\n  </ul>\n';
  // @adjusted
  var expectedResult =
    '<h1>Colors</h1>\n  <ul>\n  \n      <li><strong>red</strong></li>\n  \n      <li><a href="#Red">red</a></li>\n    \n      <li><a href="#Green">green</a></li>\n    \n      <li><a href="#Blue">blue</a></li>\n  </ul>\n';

  equal(
    toHTML(
      template,
      view, {}
    ),
    expectedResult,
    'A complex template'
  );
});

describe('Regression Suite', function() {
  // matches bug_11_eating_whitespace.html
  equal(
    toHTML(
      '{{tag}} foo', {
        tag: 'yo'
      }, {}
    ),
    'yo foo',
    'Issue 11'
  );

  // matches delimiters_partial.html
  equal(
    toHTML(
      '{{#enumerate}}\n{{>partial}}\n{{/enumerate}}', {
        enumerate: [{
          text: 'A'
        }, {
          text: 'B'
        }]
      }, {
        partial: '{{=[[ ]]=}}\n{{text}}\n[[={{ }}=]]'
      }
    ),
    // '{{text}}\n{{text}}\n',
    '\n\n{{text}}\n\n\n\n{{text}}\n\n', // @adjusted
    'Issue 44'
  );

  // matches bug_46_set_delimiter.html
  equal(
    toHTML(
      '{{=[[ ]]=}}[[#IsMustacheAwesome]]mustache is awesome![[/IsMustacheAwesome]]', {
        IsMustacheAwesome: true
      }, {}
    ),
    'mustache is awesome!',
    'Issue 46'
  );

  // matches Issue #79
  equal(
    toHTML(
      '{{#inner}}{{f}}{{#inner}}{{b}}{{/inner}}{{/inner}}', {
        inner: [{
          f: 'foo',
          inner: [{
            b: 'bar'
          }]
        }]
      }, {}
    ), 'foobar', 'Nested Sections with the same name'
  );

  // matches Issue #141
  equal(
    toHTML('You said "{{{html}}}" today', {
      html: 'I like {{mustache}}'
    }), 'You said "I like {{mustache}}" today', 'No recursive parsing');

  // matches Issue #148
  equal(
    toHTML('{{#items}}{{name}}{{#items}}{{.}}{{/items}}{{/items}}', {
      items: [{
        name: 'name',
        items: [1, 2, 3, 4]
      }]
    }), 'name1234', 'Nested Lists with the same name');
});

function specTests(json) {
  for (var i = 0, n = json.tests.length; i < n; ++i) {
    equal(toHTML(json.tests[i].template, json.tests[i].data, json.tests[i].partials || {}), json.tests[i].expected, json.tests[i].name + ' (' + json.tests[i].desc + ')');
  }
}

describe('Spec - Comments', function() {
  specTests({
    '__ATTN__': 'Do not edit this file; changes belong in the appropriate YAML file.',
    'overview': 'Comment tags represent content that should never appear in the resulting\noutput.\n\nThe tag\'s content may contain any substring (including newlines) EXCEPT the\nclosing delimiter.\n\nComment tags SHOULD be treated as standalone when appropriate.\n',
    'tests': [{
      'name': 'Inline',
      'data': {},
      'expected': '1234567890',
      'template': '12345{{! Comment Block! !}}67890',
      'desc': 'Comment blocks should be removed from the template.'
    }, {
      'name': 'Multiline',
      'data': {},
      'expected': '1234567890\n',
      'template': '12345{{!\n  This is a\n  multi-line comment...\n!}}67890\n',
      'desc': 'Multiline comments should be permitted.'
    }, {
      'name': 'Standalone',
      'data': {},
      'expected': 'Begin.\nEnd.\n',
      'template': 'Begin.\n{{! Comment Block! !}}\nEnd.\n',
      'desc': 'All standalone comment lines should be removed.'
    }, {
      'name': 'Indented Standalone',
      'data': {},
      'expected': 'Begin.\nEnd.\n',
      'template': 'Begin.\n  {{! Indented Comment Block! !}}\nEnd.\n',
      'desc': 'All standalone comment lines should be removed.'
    }, {
      'name': 'Standalone Line Endings',
      'data': {},
      // 'expected': '|\r\n|',
      'expected': '|\n|', // @adjusted
      'template': '|\r\n{{! Standalone Comment !}}\r\n|',
      'desc': '"\\r\\n" should be considered a newline for standalone tags.'
    }, {
      'name': 'Standalone Without Previous Line',
      'data': {},
      // 'expected': '!',
      'expected': '  \n!', // @adjusted
      'template': '  {{! I\'m Still Standalone !}}\n!',
      'desc': 'Standalone tags should not require a newline to precede them.'
    }, {
      'name': 'Standalone Without Newline',
      'data': {},
      // 'expected': '!\n',
      'expected': '!\n  ', // @adjusted
      'template': '!\n  {{! I\'m Still Standalone !}}',
      'desc': 'Standalone tags should not require a newline to follow them.'
    }, {
      'name': 'Multiline Standalone',
      'data': {},
      'expected': 'Begin.\nEnd.\n',
      'template': 'Begin.\n{{!\nSomething\'s going on here...\n!}}\nEnd.\n',
      'desc': 'All standalone comment lines should be removed.'
    }, {
      'name': 'Indented Multiline Standalone',
      'data': {},
      'expected': 'Begin.\nEnd.\n',
      'template': 'Begin.\n  {{!\n    Something\'s going on here...\n  !}}\nEnd.\n',
      'desc': 'All standalone comment lines should be removed.'
    }, {
      'name': 'Indented Inline',
      'data': {},
      'expected': '  12 \n',
      'template': '  12 {{! 34 !}}\n',
      'desc': 'Inline comments should not strip whitespace'
    }, {
      'name': 'Surrounding Whitespace',
      'data': {},
      'expected': '12345  67890',
      'template': '12345 {{! Comment Block! !}} 67890',
      'desc': 'Comment removal should preserve surrounding whitespace.'
    }]
  });
});

describe('Spec - Interpolation', function() {
  specTests({
    '__ATTN__': 'Do not edit this file; changes belong in the appropriate YAML file.',
    'overview': 'Interpolation tags are used to integrate dynamic content into the template.\n\nThe tag\'s content MUST be a non-whitespace character sequence NOT containing\nthe current closing delimiter.\n\nThis tag\'s content names the data to replace the tag.  A single period (`.`)\nindicates that the item currently sitting atop the context stack should be\nused; otherwise, name resolution is as follows:\n  1) Split the name on periods; the first part is the name to resolve, any\n  remaining parts should be retained.\n  2) Walk the context stack from top to bottom, finding the first context\n  that is a) a hash containing the name as a key OR b) an object responding\n  to a method with the given name.\n  3) If the context is a hash, the data is the value associated with the\n  name.\n  4) If the context is an object, the data is the value returned by the\n  method with the given name.\n  5) If any name parts were retained in step 1, each should be resolved\n  against a context stack containing only the result from the former\n  resolution.  If any part fails resolution, the result should be considered\n  falsey, and should interpolate as the empty string.\nData should be coerced into a string (and escaped, if appropriate) before\ninterpolation.\n\nThe Interpolation tags MUST NOT be treated as standalone.\n',
    'tests': [{
      'name': 'No Interpolation',
      'data': {},
      'expected': 'Hello from {Mustache}!\n',
      'template': 'Hello from {Mustache}!\n',
      'desc': 'Mustache-free templates should render as-is.'
    }, {
      'name': 'Basic Interpolation',
      'data': {
        'subject': 'world'
      },
      'expected': 'Hello, world!\n',
      'template': 'Hello, {{subject}}!\n',
      'desc': 'Unadorned tags should interpolate content into the template.'
    }, {
      'name': 'HTML Escaping',
      'data': {
        'forbidden': '& \" < >'
      },
      // 'expected': 'These characters should be HTML escaped: &amp; &quot; &lt; &gt;\n',
      'expected': 'These characters should be HTML escaped: &amp; \" &lt; &gt;\n', // @adjusted
      'template': 'These characters should be HTML escaped: {{forbidden}}\n',
      'desc': 'Basic interpolation should be HTML escaped.'
    }, {
      'name': 'Triple Mustache',
      'data': {
        'forbidden': '& \" < >'
      },
      // 'expected': 'These characters should not be HTML escaped: & \" < >\n',
      'expected': 'These characters should not be HTML escaped: &amp; \" &lt; &gt;\n', // @adjusted
      'template': 'These characters should not be HTML escaped: {{{forbidden}}}\n',
      'desc': 'Triple mustaches should interpolate without HTML escaping.'
    }, {
      'name': 'Ampersand',
      'data': {
        'forbidden': '& \" < >'
      },
      // 'expected': 'These characters should not be HTML escaped: & \" < >\n',
      'expected': 'These characters should not be HTML escaped: &amp; \" &lt; &gt;\n', // @adjusted
      'template': 'These characters should not be HTML escaped: {{&forbidden}}\n',
      'desc': 'Ampersand should interpolate without HTML escaping.'
    }, {
      'name': 'Basic Integer Interpolation',
      'data': {
        'mph': 85
      },
      'expected': '\"85 miles an hour!\"',
      'template': '\"{{mph}} miles an hour!\"',
      'desc': 'Integers should interpolate seamlessly.'
    }, {
      'name': 'Triple Mustache Integer Interpolation',
      'data': {
        'mph': 85
      },
      'expected': '\"85 miles an hour!\"',
      'template': '\"{{{mph}}} miles an hour!\"',
      'desc': 'Integers should interpolate seamlessly.'
    }, {
      'name': 'Ampersand Integer Interpolation',
      'data': {
        'mph': 85
      },
      'expected': '\"85 miles an hour!\"',
      'template': '\"{{&mph}} miles an hour!\"',
      'desc': 'Integers should interpolate seamlessly.'
    }, {
      'name': 'Basic Decimal Interpolation',
      'data': {
        'power': 1.21
      },
      'expected': '\"1.21 jiggawatts!\"',
      'template': '\"{{power}} jiggawatts!\"',
      'desc': 'Decimals should interpolate seamlessly with proper significance.'
    }, {
      'name': 'Triple Mustache Decimal Interpolation',
      'data': {
        'power': 1.21
      },
      'expected': '\"1.21 jiggawatts!\"',
      'template': '\"{{{power}}} jiggawatts!\"',
      'desc': 'Decimals should interpolate seamlessly with proper significance.'
    }, {
      'name': 'Ampersand Decimal Interpolation',
      'data': {
        'power': 1.21
      },
      'expected': '\"1.21 jiggawatts!\"',
      'template': '\"{{&power}} jiggawatts!\"',
      'desc': 'Decimals should interpolate seamlessly with proper significance.'
    }, {
      'name': 'Basic Context Miss Interpolation',
      'data': {},
      'expected': 'I () be seen!',
      'template': 'I ({{cannot}}) be seen!',
      'desc': 'Failed context lookups should default to empty strings.'
    }, {
      'name': 'Triple Mustache Context Miss Interpolation',
      'data': {},
      'expected': 'I () be seen!',
      'template': 'I ({{{cannot}}}) be seen!',
      'desc': 'Failed context lookups should default to empty strings.'
    }, {
      'name': 'Ampersand Context Miss Interpolation',
      'data': {},
      'expected': 'I () be seen!',
      'template': 'I ({{&cannot}}) be seen!',
      'desc': 'Failed context lookups should default to empty strings.'
    }, {
      'name': 'Dotted Names - Basic Interpolation',
      'data': {
        'person': {
          'name': 'Joe'
        }
      },
      'expected': '\"Joe\" == \"Joe\"',
      'template': '\"{{person.name}}\" == \"{{#person}}{{name}}{{/person}}\"',
      'desc': 'Dotted names should be considered a form of shorthand for sections.'
    }, {
      'name': 'Dotted Names - Triple Mustache Interpolation',
      'data': {
        'person': {
          'name': 'Joe'
        }
      },
      'expected': '\"Joe\" == \"Joe\"',
      'template': '\"{{{person.name}}}\" == \"{{#person}}{{{name}}}{{/person}}\"',
      'desc': 'Dotted names should be considered a form of shorthand for sections.'
    }, {
      'name': 'Dotted Names - Ampersand Interpolation',
      'data': {
        'person': {
          'name': 'Joe'
        }
      },
      'expected': '\"Joe\" == \"Joe\"',
      'template': '\"{{&person.name}}\" == \"{{#person}}{{&name}}{{/person}}\"',
      'desc': 'Dotted names should be considered a form of shorthand for sections.'
    }, {
      'name': 'Dotted Names - Arbitrary Depth',
      'data': {
        'a': {
          'b': {
            'c': {
              'd': {
                'e': {
                  'name': 'Phil'
                }
              }
            }
          }
        }
      },
      'expected': '\"Phil\" == \"Phil\"',
      'template': '\"{{a.b.c.d.e.name}}\" == \"Phil\"',
      'desc': 'Dotted names should be functional to any level of nesting.'
    }, {
      'name': 'Dotted Names - Broken Chains',
      'data': {
        'a': {}
      },
      'expected': '\"\" == \"\"',
      'template': '\"{{a.b.c}}\" == \"\"',
      'desc': 'Any falsey value prior to the last part of the name should yield "".'
    }, {
      'name': 'Dotted Names - Broken Chain Resolution',
      'data': {
        'a': {
          'b': {}
        },
        'c': {
          'name': 'Jim'
        }
      },
      'expected': '\"\" == \"\"',
      'template': '\"{{a.b.c.name}}\" == \"\"',
      'desc': 'Each part of a dotted name should resolve only against its parent.'
    }, {
      'name': 'Dotted Names - Initial Resolution',
      'data': {
        'a': {
          'b': {
            'c': {
              'd': {
                'e': {
                  'name': 'Phil'
                }
              }
            }
          }
        },
        'b': {
          'c': {
            'd': {
              'e': {
                'name': 'Wrong'
              }
            }
          }
        }
      },
      'expected': '\"Phil\" == \"Phil\"',
      'template': '\"{{#a}}{{b.c.d.e.name}}{{/a}}\" == \"Phil\"',
      'desc': 'The first part of a dotted name should resolve as any other name.'
    }, {
      'name': 'Interpolation - Surrounding Whitespace',
      'data': {
        'string': '---'
      },
      'expected': '| --- |',
      'template': '| {{string}} |',
      'desc': 'Interpolation should not alter surrounding whitespace.'
    }, {
      'name': 'Triple Mustache - Surrounding Whitespace',
      'data': {
        'string': '---'
      },
      'expected': '| --- |',
      'template': '| {{{string}}} |',
      'desc': 'Interpolation should not alter surrounding whitespace.'
    }, {
      'name': 'Ampersand - Surrounding Whitespace',
      'data': {
        'string': '---'
      },
      'expected': '| --- |',
      'template': '| {{&string}} |',
      'desc': 'Interpolation should not alter surrounding whitespace.'
    }, {
      'name': 'Interpolation - Standalone',
      'data': {
        'string': '---'
      },
      'expected': '  ---\n',
      'template': '  {{string}}\n',
      'desc': 'Standalone interpolation should not alter surrounding whitespace.'
    }, {
      'name': 'Triple Mustache - Standalone',
      'data': {
        'string': '---'
      },
      'expected': '  ---\n',
      'template': '  {{{string}}}\n',
      'desc': 'Standalone interpolation should not alter surrounding whitespace.'
    }, {
      'name': 'Ampersand - Standalone',
      'data': {
        'string': '---'
      },
      'expected': '  ---\n',
      'template': '  {{&string}}\n',
      'desc': 'Standalone interpolation should not alter surrounding whitespace.'
    }, {
      'name': 'Interpolation With Padding',
      'data': {
        'string': '---'
      },
      'expected': '|---|',
      'template': '|{{ string }}|',
      'desc': 'Superfluous in-tag whitespace should be ignored.'
    }, {
      'name': 'Triple Mustache With Padding',
      'data': {
        'string': '---'
      },
      'expected': '|---|',
      'template': '|{{{ string }}}|',
      'desc': 'Superfluous in-tag whitespace should be ignored.'
    }, {
      'name': 'Ampersand With Padding',
      'data': {
        'string': '---'
      },
      'expected': '|---|',
      'template': '|{{& string }}|',
      'desc': 'Superfluous in-tag whitespace should be ignored.'
    }]
  });
});

describe('Spec - Partials', function() {
  specTests({
    '__ATTN__': 'Do not edit this file; changes belong in the appropriate YAML file.',
    'overview': 'Partial tags are used to expand an external template into the current\ntemplate.\n\nThe tag\'s content MUST be a non-whitespace character sequence NOT containing\nthe current closing delimiter.\n\nThis tag\'s content names the partial to inject.  Set Delimiter tags MUST NOT\naffect the parsing of a partial.  The partial MUST be rendered against the\ncontext stack local to the tag.  If the named partial cannot be found, the\nempty string SHOULD be used instead, as in interpolations.\n\nPartial tags SHOULD be treated as standalone when appropriate.  If this tag\nis used standalone, any whitespace preceding the tag should treated as\nindentation, and prepended to each line of the partial before rendering.\n',
    'tests': [{
      'name': 'Basic Behavior',
      'data': {},
      'expected': '\"from partial\"',
      'template': '\"{{>text}}\"',
      'desc': 'The greater-than operator should expand to the named partial.',
      'partials': {
        'text': 'from partial'
      }
    }, {
      'name': 'Failed Lookup',
      'data': {},
      'expected': '\"\"',
      'template': '\"{{>text}}\"',
      'desc': 'The empty string should be used when the named partial is not found.',
      'partials': {}
    }, {
      'name': 'Context',
      'data': {
        'text': 'content'
      },
      'expected': '\"*content*\"',
      'template': '\"{{>partial}}\"',
      'desc': 'The greater-than operator should operate within the current context.',
      'partials': {
        'partial': '*{{text}}*'
      }
    }, {
      'name': 'Recursion',
      'data': {
        'content': 'X',
        'nodes': [{
          'content': 'Y',
          'nodes': []
        }]
      },
      // 'expected': 'X<Y<>>',
      'expected': 'X(Y())', // @adjusted
      'template': '{{>node}}',
      'desc': 'The greater-than operator should properly recurse.',
      'partials': {
        // 'node': '{{content}}<{{#nodes}}{{>node}}{{/nodes}}>'
        'node': '{{content}}({{#nodes}}{{>node}}{{/nodes}})' // @adjusted
      }
    }, {
      'name': 'Surrounding Whitespace',
      'data': {},
      'expected': '| \t|\t |',
      'template': '| {{>partial}} |',
      'desc': 'The greater-than operator should not alter surrounding whitespace.',
      'partials': {
        'partial': '\t|\t'
      }
    }, {
      'name': 'Inline Indentation',
      'data': {
        'data': '|'
      },
      // 'expected': '  |  >\n>\n',
      'expected': '  |  &gt;\n&gt;\n', // @adjusted
      'template': '  {{data}}  {{> partial}}\n',
      'desc': 'Whitespace should be left untouched.',
      'partials': {
        'partial': '>\n>'
      }
    }, {
      'name': 'Standalone Line Endings',
      'data': {},
      // 'expected': '|\r\n>|',
      'expected': '|\r\n&gt;\r\n|', // @adjusted
      'template': '|\r\n{{>partial}}\r\n|',
      'desc': '\'\\r\\n\' should be considered a newline for standalone tags.',
      'partials': {
        'partial': '>'
      }
    }, {
      'name': 'Standalone Without Previous Line',
      'data': {},
      // 'expected': '  >\n  >>',
      'expected': '  &gt;\n&gt;\n&gt;', // @adjusted
      'template': '  {{>partial}}\n>',
      'desc': 'Standalone tags should not require a newline to precede them.',
      'partials': {
        'partial': '>\n>'
      }
    }, {
      'name': 'Standalone Without Newline',
      'data': {},
      // 'expected': '>\n  >\n  >',
      'expected': '&gt;\n  &gt;\n&gt;', // @adjusted
      'template': '>\n  {{>partial}}',
      'desc': 'Standalone tags should not require a newline to follow them.',
      'partials': {
        'partial': '>\n>'
      }
    }, {
      'name': 'Standalone Indentation',
      'data': {
        'content': '<\n->'
      },
      // 'expected': '\\\n |\n <\n->\n |\n/\n',
      'expected': '\\\n |\n&lt;\n-&gt;\n|\n\n/\n', // @adjusted
      'template': '\\\n {{>partial}}\n/\n',
      'desc': 'Each line of the partial should be indented before rendering.',
      'partials': {
        'partial': '|\n{{{content}}}\n|\n'
      }
    }, {
      'name': 'Padding Whitespace',
      'data': {
        'boolean': true
      },
      'expected': '|[]|',
      'template': '|{{> partial }}|',
      'desc': 'Superfluous in-tag whitespace should be ignored.',
      'partials': {
        'partial': '[]'
      }
    }]
  });
});

describe('Spec - Sections', function() {
  specTests({
    '__ATTN__': 'Do not edit this file; changes belong in the appropriate YAML file.',
    'overview': 'Section tags and End Section tags are used in combination to wrap a section\nof the template for iteration\n\nThese tags\' content MUST be a non-whitespace character sequence NOT\ncontaining the current closing delimiter; each Section tag MUST be followed\nby an End Section tag with the same content within the same section.\n\nThis tag\'s content names the data to replace the tag.  Name resolution is as\nfollows:\n  1) Split the name on periods; the first part is the name to resolve, any\n  remaining parts should be retained.\n  2) Walk the context stack from top to bottom, finding the first context\n  that is a) a hash containing the name as a key OR b) an object responding\n  to a method with the given name.\n  3) If the context is a hash, the data is the value associated with the\n  name.\n  4) If the context is an object and the method with the given name has an\n  arity of 1, the method SHOULD be called with a String containing the\n  unprocessed contents of the sections; the data is the value returned.\n  5) Otherwise, the data is the value returned by calling the method with\n  the given name.\n  6) If any name parts were retained in step 1, each should be resolved\n  against a context stack containing only the result from the former\n  resolution.  If any part fails resolution, the result should be considered\n  falsey, and should interpolate as the empty string.\nIf the data is not of a list type, it is coerced into a list as follows: if\nthe data is truthy (e.g. `!!data == true`), use a single-element list\ncontaining the data, otherwise use an empty list.\n\nFor each element in the data list, the element MUST be pushed onto the\ncontext stack, the section MUST be rendered, and the element MUST be popped\noff the context stack.\n\nSection and End Section tags SHOULD be treated as standalone when\nappropriate.\n',
    'tests': [{
      'name': 'Truthy',
      'data': {
        'boolean': true
      },
      'expected': '\"This should be rendered.\"',
      'template': '\"{{#boolean}}This should be rendered.{{/boolean}}\"',
      'desc': 'Truthy sections should have their contents rendered.'
    }, {
      'name': 'Falsey',
      'data': {
        'boolean': false
      },
      'expected': '\"\"',
      'template': '\"{{#boolean}}This should not be rendered.{{/boolean}}\"',
      'desc': 'Falsey sections should have their contents omitted.'
    }, {
      'name': 'Context',
      'data': {
        'context': {
          'name': 'Joe'
        }
      },
      'expected': '\"Hi Joe.\"',
      'template': '\"{{#context}}Hi {{name}}.{{/context}}\"',
      'desc': 'Objects and hashes should be pushed onto the context stack.'
    }, {
      'name': 'Deeply Nested Contexts',
      'data': {
        'a': {
          'one': 1
        },
        'b': {
          'two': 2
        },
        'c': {
          'three': 3
        },
        'd': {
          'four': 4
        },
        'e': {
          'five': 5
        }
      },
      // 'expected': '1\n121\n12321\n1234321\n123454321\n1234321\n12321\n121\n1\n',
      'expected': '\n1\n121\n12321\n1234321\n123454321\n1234321\n12321\n121\n1\n', // @adjusted
      'template': '{{#a}}\n{{one}}\n{{#b}}\n{{one}}{{two}}{{one}}\n{{#c}}\n{{one}}{{two}}{{three}}{{two}}{{one}}\n{{#d}}\n{{one}}{{two}}{{three}}{{four}}{{three}}{{two}}{{one}}\n{{#e}}\n{{one}}{{two}}{{three}}{{four}}{{five}}{{four}}{{three}}{{two}}{{one}}\n{{/e}}\n{{one}}{{two}}{{three}}{{four}}{{three}}{{two}}{{one}}\n{{/d}}\n{{one}}{{two}}{{three}}{{two}}{{one}}\n{{/c}}\n{{one}}{{two}}{{one}}\n{{/b}}\n{{one}}\n{{/a}}\n',
      'desc': 'All elements on the context stack should be accessible.'
    }, {
      'name': 'List',
      'data': {
        'list': [{
          'item': 1
        }, {
          'item': 2
        }, {
          'item': 3
        }]
      },
      'expected': '\"123\"',
      'template': '\"{{#list}}{{item}}{{/list}}\"',
      'desc': 'Lists should be iterated; list items should visit the context stack.'
    }, {
      'name': 'Empty List',
      'data': {
        'list': []
      },
      'expected': '\"\"',
      'template': '\"{{#list}}Yay lists!{{/list}}\"',
      'desc': 'Empty lists should behave like falsey values.'
    }, {
      'name': 'Doubled',
      'data': {
        'two': 'second',
        'bool': true
      },
      // 'expected': '* first\n* second\n* third\n',
      'expected': '\n* first\n* second\n* third\n', // @adjusted
      'template': '{{#bool}}\n* first\n{{/bool}}\n* {{two}}\n{{#bool}}\n* third\n{{/bool}}\n',
      'desc': 'Multiple sections per template should be permitted.'
    }, {
      'name': 'Nested (Truthy)',
      'data': {
        'bool': true
      },
      'expected': '| A B C D E |',
      'template': '| A {{#bool}}B {{#bool}}C{{/bool}} D{{/bool}} E |',
      'desc': 'Nested truthy sections should have their contents rendered.'
    }, {
      'name': 'Nested (Falsey)',
      'data': {
        'bool': false
      },
      'expected': '| A  E |',
      'template': '| A {{#bool}}B {{#bool}}C{{/bool}} D{{/bool}} E |',
      'desc': 'Nested falsey sections should be omitted.'
    }, {
      'name': 'Context Misses',
      'data': {},
      'expected': '[]',
      'template': '[{{#missing}}Found key \'missing\'!{{/missing}}]',
      'desc': 'Failed context lookups should be considered falsey.'
    }, {
      'name': 'Implicit Iterator - String',
      'data': {
        'list': ['a', 'b', 'c', 'd', 'e']
      },
      'expected': '\"(a)(b)(c)(d)(e)\"',
      'template': '\"{{#list}}({{.}}){{/list}}\"',
      'desc': 'Implicit iterators should directly interpolate strings.'
    }, {
      'name': 'Implicit Iterator - Integer',
      'data': {
        'list': [1, 2, 3, 4, 5]
      },
      'expected': '\"(1)(2)(3)(4)(5)\"',
      'template': '\"{{#list}}({{.}}){{/list}}\"',
      'desc': 'Implicit iterators should cast integers to strings and interpolate.'
    }, {
      'name': 'Implicit Iterator - Decimal',
      'data': {
        'list': [1.1, 2.2, 3.3, 4.4, 5.5]
      },
      'expected': '\"(1.1)(2.2)(3.3)(4.4)(5.5)\"',
      'template': '\"{{#list}}({{.}}){{/list}}\"',
      'desc': 'Implicit iterators should cast decimals to strings and interpolate.'
    }, {
      'name': 'Dotted Names - Truthy',
      'data': {
        'a': {
          'b': {
            'c': true
          }
        }
      },
      'expected': '\"Here\" == \"Here\"',
      'template': '\"{{#a.b.c}}Here{{/a.b.c}}\" == \"Here\"',
      'desc': 'Dotted names should be valid for Section tags.'
    }, {
      'name': 'Dotted Names - Falsey',
      'data': {
        'a': {
          'b': {
            'c': false
          }
        }
      },
      'expected': '\"\" == \"\"',
      'template': '\"{{#a.b.c}}Here{{/a.b.c}}\" == \"\"',
      'desc': 'Dotted names should be valid for Section tags.'
    }, {
      'name': 'Dotted Names - Broken Chains',
      'data': {
        'a': {}
      },
      'expected': '\"\" == \"\"',
      'template': '\"{{#a.b.c}}Here{{/a.b.c}}\" == \"\"',
      'desc': 'Dotted names that cannot be resolved should be considered falsey.'
    }, {
      'name': 'Surrounding Whitespace',
      'data': {
        'boolean': true
      },
      'expected': ' | \t|\t | \n',
      'template': ' | {{#boolean}}\t|\t{{/boolean}} | \n',
      'desc': 'Sections should not alter surrounding whitespace.'
    }, {
      'name': 'Internal Whitespace',
      'data': {
        'boolean': true
      },
      'expected': ' |  \n  | \n',
      'template': ' | {{#boolean}} {{! Important Whitespace !}}\n {{/boolean}} | \n',
      'desc': 'Sections should not alter internal whitespace.'
    }, {
      'name': 'Indented Inline Sections',
      'data': {
        'boolean': true
      },
      'expected': ' YES\n GOOD\n',
      'template': ' {{#boolean}}YES{{/boolean}}\n {{#boolean}}GOOD{{/boolean}}\n',
      'desc': 'Single-line sections should not alter surrounding whitespace.'
    }, {
      'name': 'Standalone Lines',
      'data': {
        'boolean': true
      },
      'expected': '| This Is\n|\n| A Line\n',
      'template': '| This Is\n{{#boolean}}\n|\n{{/boolean}}\n| A Line\n',
      'desc': 'Standalone lines should be removed from the template.'
    }, {
      'name': 'Indented Standalone Lines',
      'data': {
        'boolean': true
      },
      'expected': '| This Is\n|\n| A Line\n',
      'template': '| This Is\n  {{#boolean}}\n|\n  {{/boolean}}\n| A Line\n',
      'desc': 'Indented standalone lines should be removed from the template.'
    }, {
      'name': 'Standalone Line Endings',
      'data': {
        'boolean': true
      },
      // 'expected': '|\r\n|',
      'expected': '|\n\r\n|', // @adjusted
      'template': '|\r\n{{#boolean}}\r\n{{/boolean}}\r\n|',
      'desc': '\"\\r\\n\" should be considered a newline for standalone tags.'
    }, {
      'name': 'Standalone Without Previous Line',
      'data': {
        'boolean': true
      },
      // 'expected': '#\n/',
      'expected': '  \n#\n/', // @adjusted
      'template': '  {{#boolean}}\n#{{/boolean}}\n/',
      'desc': 'Standalone tags should not require a newline to precede them.'
    }, {
      'name': 'Standalone Without Newline',
      'data': {
        'boolean': true
      },
      // 'expected': '#\n/\n',
      'expected': '#\n/\n  ', // @adjusted
      'template': '#{{#boolean}}\n/\n  {{/boolean}}',
      'desc': 'Standalone tags should not require a newline to follow them.'
    }, {
      'name': 'Padding',
      'data': {
        'boolean': true
      },
      'expected': '|=|',
      'template': '|{{# boolean }}={{/ boolean }}|',
      'desc': 'Superfluous in-tag whitespace should be ignored.'
    }]
  });
});

describe('Spec - Inverted Sections', function() {
  specTests({
    '__ATTN__': 'Do not edit this file; changes belong in the appropriate YAML file.',
    'overview': 'Inverted Section tags and End Section tags are used in combination to wrap a\nsection of the template.\n\nThese tags\' content MUST be a non-whitespace character sequence NOT\ncontaining the current closing delimiter; each Inverted Section tag MUST be\nfollowed by an End Section tag with the same content within the same\nsection.\n\nThis tag\'s content names the data to replace the tag.  Name resolution is as\nfollows:\n  1) Split the name on periods; the first part is the name to resolve, any\n  remaining parts should be retained.\n  2) Walk the context stack from top to bottom, finding the first context\n  that is a) a hash containing the name as a key OR b) an object responding\n  to a method with the given name.\n  3) If the context is a hash, the data is the value associated with the\n  name.\n  4) If the context is an object and the method with the given name has an\n  arity of 1, the method SHOULD be called with a String containing the\n  unprocessed contents of the sections; the data is the value returned.\n  5) Otherwise, the data is the value returned by calling the method with\n  the given name.\n  6) If any name parts were retained in step 1, each should be resolved\n  against a context stack containing only the result from the former\n  resolution.  If any part fails resolution, the result should be considered\n  falsey, and should interpolate as the empty string.\nIf the data is not of a list type, it is coerced into a list as follows: if\nthe data is truthy (e.g. `!!data == true`), use a single-element list\ncontaining the data, otherwise use an empty list.\n\nThis section MUST NOT be rendered unless the data list is empty.\n\nInverted Section and End Section tags SHOULD be treated as standalone when\nappropriate.\n',
    'tests': [{
      'name': 'Falsey',
      'data': {
        'boolean': false
      },
      'expected': '\"This should be rendered.\"',
      'template': '\"{{^boolean}}This should be rendered.{{/boolean}}\"',
      'desc': 'Falsey sections should have their contents rendered.'
    }, {
      'name': 'Truthy',
      'data': {
        'boolean': true
      },
      'expected': '\"\"',
      'template': '\"{{^boolean}}This should not be rendered.{{/boolean}}\"',
      'desc': 'Truthy sections should have their contents omitted.'
    }, {
      'name': 'Context',
      'data': {
        'context': {
          'name': 'Joe'
        }
      },
      'expected': '\"\"',
      'template': '\"{{^context}}Hi {{name}}.{{/context}}\"',
      'desc': 'Objects and hashes should behave like truthy values.'
    }, {
      'name': 'List',
      'data': {
        'list': [{
          'n': 1
        }, {
          'n': 2
        }, {
          'n': 3
        }]
      },
      'expected': '\"\"',
      'template': '\"{{^list}}{{n}}{{/list}}\"',
      'desc': 'Lists should behave like truthy values.'
    }, {
      'name': 'Empty List',
      'data': {
        'list': []
      },
      'expected': '\"Yay lists!\"',
      'template': '\"{{^list}}Yay lists!{{/list}}\"',
      'desc': 'Empty lists should behave like falsey values.'
    }, {
      'name': 'Doubled',
      'data': {
        'two': 'second',
        'bool': false
      },
      // 'expected': '* first\n* second\n* third\n',
      'expected': '\n* first\n* second\n* third\n', // @adjusted
      'template': '{{^bool}}\n* first\n{{/bool}}\n* {{two}}\n{{^bool}}\n* third\n{{/bool}}\n',
      'desc': 'Multiple inverted sections per template should be permitted.'
    }, {
      'name': 'Nested (Falsey)',
      'data': {
        'bool': false
      },
      'expected': '| A B C D E |',
      'template': '| A {{^bool}}B {{^bool}}C{{/bool}} D{{/bool}} E |',
      'desc': 'Nested falsey sections should have their contents rendered.'
    }, {
      'name': 'Nested (Truthy)',
      'data': {
        'bool': true
      },
      'expected': '| A  E |',
      'template': '| A {{^bool}}B {{^bool}}C{{/bool}} D{{/bool}} E |',
      'desc': 'Nested truthy sections should be omitted.'
    }, {
      'name': 'Context Misses',
      'data': {},
      'expected': '[Cannot find key \'missing\'!]',
      'template': '[{{^missing}}Cannot find key \'missing\'!{{/missing}}]',
      'desc': 'Failed context lookups should be considered falsey.'
    }, {
      'name': 'Dotted Names - Truthy',
      'data': {
        'a': {
          'b': {
            'c': true
          }
        }
      },
      'expected': '\"\" == \"\"',
      'template': '\"{{^a.b.c}}Not Here{{/a.b.c}}\" == \"\"',
      'desc': 'Dotted names should be valid for Inverted Section tags.'
    }, {
      'name': 'Dotted Names - Falsey',
      'data': {
        'a': {
          'b': {
            'c': false
          }
        }
      },
      'expected': '\"Not Here\" == \"Not Here\"',
      'template': '\"{{^a.b.c}}Not Here{{/a.b.c}}\" == \"Not Here\"',
      'desc': 'Dotted names should be valid for Inverted Section tags.'
    }, {
      'name': 'Dotted Names - Broken Chains',
      'data': {
        'a': {}
      },
      'expected': '\"Not Here\" == \"Not Here\"',
      'template': '\"{{^a.b.c}}Not Here{{/a.b.c}}\" == \"Not Here\"',
      'desc': 'Dotted names that cannot be resolved should be considered falsey.'
    }, {
      'name': 'Surrounding Whitespace',
      'data': {
        'boolean': false
      },
      'expected': ' | \t|\t | \n',
      'template': ' | {{^boolean}}\t|\t{{/boolean}} | \n',
      'desc': 'Inverted sections should not alter surrounding whitespace.'
    }, {
      'name': 'Internal Whitespace',
      'data': {
        'boolean': false
      },
      'expected': ' |  \n  | \n',
      'template': ' | {{^boolean}} {{! Important Whitespace !}}\n {{/boolean}} | \n',
      'desc': 'Inverted should not alter internal whitespace.'
    }, {
      'name': 'Indented Inline Sections',
      'data': {
        'boolean': false
      },
      'expected': ' NO\n WAY\n',
      'template': ' {{^boolean}}NO{{/boolean}}\n {{^boolean}}WAY{{/boolean}}\n',
      'desc': 'Single-line sections should not alter surrounding whitespace.'
    }, {
      'name': 'Standalone Lines',
      'data': {
        'boolean': false
      },
      'expected': '| This Is\n|\n| A Line\n',
      'template': '| This Is\n{{^boolean}}\n|\n{{/boolean}}\n| A Line\n',
      'desc': 'Standalone lines should be removed from the template.'
    }, {
      'name': 'Standalone Indented Lines',
      'data': {
        'boolean': false
      },
      'expected': '| This Is\n|\n| A Line\n',
      'template': '| This Is\n  {{^boolean}}\n|\n  {{/boolean}}\n| A Line\n',
      'desc': 'Standalone indented lines should be removed from the template.'
    }, {
      'name': 'Standalone Line Endings',
      'data': {
        'boolean': false
      },
      // 'expected': '|\r\n|',
      'expected': '|\n\r\n|', // @adjusted
      'template': '|\r\n{{^boolean}}\r\n{{/boolean}}\r\n|',
      'desc': '\"\\r\\n\" should be considered a newline for standalone tags.'
    }, {
      'name': 'Standalone Without Previous Line',
      'data': {
        'boolean': false
      },
      // 'expected': '^\n/',
      'expected': '  \n^\n/', // @adjusted
      'template': '  {{^boolean}}\n^{{/boolean}}\n/',
      'desc': 'Standalone tags should not require a newline to precede them.'
    }, {
      'name': 'Standalone Without Newline',
      'data': {
        'boolean': false
      },
      // 'expected': '^\n/\n',
      'expected': '^\n/\n  ', // @adjusted
      'template': '^{{^boolean}}\n/\n  {{/boolean}}',
      'desc': 'Standalone tags should not require a newline to follow them.'
    }, {
      'name': 'Padding',
      'data': {
        'boolean': false
      },
      'expected': '|=|',
      'template': '|{{^ boolean }}={{/ boolean }}|',
      'desc': 'Superfluous in-tag whitespace should be ignored.'
    }]
  });
});

describe('Spec - Set Delimiter', function() {
  specTests({
    '__ATTN__': 'Do not edit this file; changes belong in the appropriate YAML file.',
    'overview': 'Set Delimiter tags are used to change the tag delimiters for all content\nfollowing the tag in the current compilation unit.\n\nThe tag\'s content MUST be any two non-whitespace sequences (separated by\nwhitespace) EXCEPT an equal sign (\'=\') followed by the current closing\ndelimiter.\n\nSet Delimiter tags SHOULD be treated as standalone when appropriate.\n',
    'tests': [{
      'name': 'Pair Behavior',
      'data': {
        'text': 'Hey!'
      },
      'expected': '(Hey!)',
      'template': '{{=<% %>=}}(<%text%>)',
      'desc': 'The equal sign (used on both sides) should permit delimiter changes.'
    }, {
      'name': 'Special Characters',
      'data': {
        'text': 'It worked!'
      },
      'expected': '(It worked!)',
      'template': '({{=[ ]=}}[text])',
      'desc': 'Characters with special meaning regexen should be valid delimiters.'
    }, {
      'name': 'Sections',
      'data': {
        'section': true,
        'data': 'I got interpolated.'
      },
      'expected': '[\n  I got interpolated.\n  |data|\n\n  {{data}}\n  I got interpolated.\n]\n',
      'template': '[\n{{#section}}\n  {{data}}\n  |data|\n{{/section}}\n\n{{= | | =}}\n|#section|\n  {{data}}\n  |data|\n|/section|\n]\n',
      'desc': 'Delimiters set outside sections should persist.'
    }, {
      'name': 'Inverted Sections',
      'data': {
        'section': false,
        'data': 'I got interpolated.'
      },
      'expected': '[\n  I got interpolated.\n  |data|\n\n  {{data}}\n  I got interpolated.\n]\n',
      'template': '[\n{{^section}}\n  {{data}}\n  |data|\n{{/section}}\n\n{{= | | =}}\n|^section|\n  {{data}}\n  |data|\n|/section|\n]\n',
      'desc': 'Delimiters set outside inverted sections should persist.'
    }, {
      'name': 'Partial Inheritence',
      'data': {
        'value': 'yes'
      },
      'expected': '[ .yes. ]\n[ .yes. ]\n',
      'template': '[ {{>include}} ]\n{{= | | =}}\n[ |>include| ]\n',
      'desc': 'Delimiters set in a parent template should not affect a partial.',
      'partials': {
        'include': '.{{value}}.'
      }
    }, {
      'name': 'Post-Partial Behavior',
      'data': {
        'value': 'yes'
      },
      'expected': '[ .yes.  .yes. ]\n[ .yes.  .|value|. ]\n',
      'template': '[ {{>include}} ]\n[ .{{value}}.  .|value|. ]\n',
      'desc': 'Delimiters set in a partial should not affect the parent template.',
      'partials': {
        'include': '.{{value}}. {{= | | =}} .|value|.'
      }
    }, {
      'name': 'Surrounding Whitespace',
      'data': {},
      'expected': '|  |',
      'template': '| {{=@ @=}} |',
      'desc': 'Surrounding whitespace should be left untouched.'
    }, {
      'name': 'Outlying Whitespace (Inline)',
      'data': {},
      'expected': ' | \n',
      'template': ' | {{=@ @=}}\n',
      'desc': 'Whitespace should be left untouched.'
    }, {
      'name': 'Standalone Tag',
      'data': {},
      'expected': 'Begin.\nEnd.\n',
      'template': 'Begin.\n{{=@ @=}}\nEnd.\n',
      'desc': 'Standalone lines should be removed from the template.'
    }, {
      'name': 'Indented Standalone Tag',
      'data': {},
      'expected': 'Begin.\nEnd.\n',
      'template': 'Begin.\n  {{=@ @=}}\nEnd.\n',
      'desc': 'Indented standalone lines should be removed from the template.'
    }, {
      'name': 'Standalone Line Endings',
      'data': {},
      // 'expected': '|\r\n|',
      'expected': '|\n|', // @adjusted
      'template': '|\r\n{{= @ @ =}}\r\n|',
      'desc': '\"\\r\\n\" should be considered a newline for standalone tags.'
    }, {
      'name': 'Standalone Without Previous Line',
      'data': {},
      // 'expected': '=',
      'expected': '  \n=', // @adjusted
      'template': '  {{=@ @=}}\n=',
      'desc': 'Standalone tags should not require a newline to precede them.'
    }, {
      'name': 'Standalone Without Newline',
      'data': {},
      // 'expected': '=\n',
      'expected': '=\n  ', // @adjusted
      'template': '=\n  {{=@ @=}}',
      'desc': 'Standalone tags should not require a newline to follow them.'
    }, {
      'name': 'Pair with Padding',
      'data': {},
      'expected': '||',
      'template': '|{{= @   @ =}}|',
      'desc': 'Superfluous in-tag whitespace should be ignored.'
    }]
  });
});

describe('Spec', function() {
  equal(
    toHTML(' '),
    ' ',
    'Standalone flag is not too eager');

  equal(
    toHTML(' \n '),
    ' \n ',
    'Standalone flag is not too eager');

  equal(
    toHTML(' \n\n '),
    ' \n\n ',
    'Standalone flag is not too eager');
});
