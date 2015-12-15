'use strict';
require('./test/environment');
var fs = require('fs');
var template = `{{! w/test }}
<div selected="selected" class="{{class}}" {{#a}}{{#b}}data-foo-a="bar"{{/b}} data-bar="{{foo}}"{{/a}} {{{test}}}>
  {{#test}}fa<span>ff</span>ce{{/test}}
  <!-- t{{#b}}es{{/b}}t-->
  {{> my/partial/name }}
  {{^test}}book{{/test}}
</div>`;

// template = `<div>1<div>23</div></div>`;
// template = fs.readFileSync('/Users/deeg/Projects/tungstenjs/examples/svg/templates/chart_view.mustache').toString();

var compiler = require('./src/template/compiler');
var reverse = require('./src/template/ractive_adaptor');
var tmpl = compiler(template).template;
var str = tmpl.toSource();
console.log(template);
console.log(str);
