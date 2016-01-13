window.data = window.data || {};
window.data.tutorials = window.data.tutorials || [];
window.data.tutorials.push({
  name: 'Hello World',
  steps: [
    {
      name: 'Hello Tungsten.js!',
      index: 1,
      template_highlights: [{start: {line: 0, ch: 6}, end: {line: 0, ch: 12}}],
      description_html: '<p>Welcome to the first tutorial on how to use Tungsten.js!  Use the steps above to navigate through each step of each tutorial.  On the top right is the mustache template for the step, and on the bottom right is the JavaScript code; together these make up your Tungsten.js application.  On the bottom left is the output of this applicaton.  After editing the code, click the run button below to update the output.  Or, press ctrl+enter while editing.</p><p>Alright, let\'s start.  Because Tungsten.js uses plain mustache templates, you can update the HTML in the template to update HTML in the application.  Change the HTML in the template to output text "Hello!" instead of "Hello?".  Then, change the <code>span</code> element to a <code>strong</code> element.</p>',
      template: '<span>Hello?</span>',
      js: "var View = tungsten.View, Model = tungsten.Model;\nnew View({\n  el: document.getElementById('app'),\n  template: compiledTemplates.app_view,\n  model: new Model({name: 'world'}),\n  dynamicInitialize: true \n});"
    },
    {
      name: 'Adding dynamic content',
      index: 2,
      template_highlights: [{start: {line: 0, ch: 8}, end: {line: 0, ch: 14}}],
      js_highlights: [{start: {line: 4, ch: 19}, end: {line: 4, ch: 34}}],
      description_html: '<p>Now let\'s add a dynamic value to the template.  In mustache (and so also in Tungsten.js), this is done with "tags" denoted by double braces, e.g., <code>{{ this_is_a_tag }}</code></p><p>Data for our templates is injected from our model.  Here, the property <code>name</code> (with the value "world") has been added to our model.</p><p>Add <code>name</code> to the template HTML after hello, so that the output reads, "Hello, World!".</p>',
      template: '<strong>Hello!</strong>',
      js: "var View = tungsten.View, Model = tungsten.Model;\nnew View({\n  el: document.getElementById('app'),\n  template: compiledTemplates.app_view,\n  model: new Model({name: 'world'}),\n  dynamicInitialize: true \n});"
    },
    {
      name: 'Looping through an array',
      index: 3,
      description_html: '<p>We can loop through a list of values in mustache using <code>section</code> tags which are denoted by double braces and prefixed with <code>#</code> for the start tag, and <code>/</code> for the end tag, e.g. <code>{{#section_starts}}{{/section_ends}}</code>.  While looping through an array, a single period in double braces (<code>{{ . }}</code>) indicates that current item in the loop should be output.</p><p>Here, the property <code>names</code> has been added to our model as an array of strings.</p><p>Add a <code>names</code> section to the template, and use <code>{{ . }}</code> to output each item to the unordered list.</p>',
      template: '<ul><li></li></ul>',
      js: "var View = tungsten.View, Model = tungsten.Model;\nnew View({\n  el: document.getElementById('app'),\n  template: compiledTemplates.app_view,\n  model: new Model({names: ['George Washington', 'John Adams', 'Thomas Jefferson', 'James Madison', 'James Monroe']}),\n  dynamicInitialize: true \n});"
    }
  ]

});
