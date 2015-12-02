'use strict';
require('./test/environment');
var fs = require('fs');
var template = `{{! w/test }}
<div selected class="{{class}}" {{#a}}{{#b}}data-{{c}}-a="bar"{{/b}} data-bar="{{foo}}"{{/a}} {{{test}}}>
  {{#test}}fa<span>ff</span>ce{{/test}}
  <!-- t{{#b}}es{{/b}}t-->
  {{> my/partial/name }}
  {{^test}}book{{/test}}
</div>`;

template = `<div>1<div>23</div></div>`;
// template = fs.readFileSync('/Users/deeg/Projects/tungstenjs/examples/svg/templates/chart_view.mustache').toString();

var compiler = require('./src/template/compiler');
var r1 = JSON.stringify(compiler(template), null, '  ');
console.log(r1);
